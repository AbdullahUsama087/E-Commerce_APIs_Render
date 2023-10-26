import categoryModel from "../../../DB/Models/category.model.js";
import subCategoryModel from "../../../DB/Models/subCategory.model.js";
import brandModel from "../../../DB/Models/brand.model.js";
import productModel from "../../../DB/Models/product.model.js";
import slugify from "slugify";
import cloudinary from "../../Utils/cloudinaryConfigrations.js";
import { customAlphabet } from "nanoid";
import ApiFeatures from "../../Utils/apiFeatures.js";
const nanoid = customAlphabet("123456789_-@#$%", 6);

/**************************** 1- Create Product ************************/
const createProduct = async (req, res, next) => {
  const { _id } = req.authUser;
  const { title, description, price, appliedDiscount, colors, sizes, stock } =
    req.body;
  const { categoryId, subCategoryId, brandId } = req.query;

  //Check on Category, SubCategory and Brand
  const brandExist = await brandModel.findById(brandId);
  if (!brandExist) {
    return next(new Error("Invalid BrandId", { cause: 400 }));
  }
  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  if (!subCategoryExist) {
    return next(new Error("Invalid subCategoryId", { cause: 400 }));
  }
  const categoryExist = await categoryModel.findById(categoryId);
  if (!categoryExist) {
    return next(new Error("Invalid CategoryId", { cause: 400 }));
  }
  //Check the title is Unique
  if (await productModel.findOne({ title })) {
    return next(new Error("This Product is already Exist!", { cause: 400 }));
  }
  // Create Slug
  const slug = slugify(title, { replacement: "_", lower: true });

  //Price After Disc
  // if (appliedDiscount) {
  const priceAfterDiscount = price - price * ((appliedDiscount || 0) / 100);
  // }

  //Check on Image Upload
  if (!req.files) {
    return next(new Error("There's No Img to Upload", { cause: 400 }));
  }
  const customId = nanoid();
  //Upload Imgs On HOST
  const Images = [];
  const publicIds = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products/${customId}`,
      }
    );
    Images.push({ secure_url, public_id });
    publicIds.push(public_id);
  }

  req.imagePath = `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products/${customId}`;

  //Upload Data on DB
  const productObj = {
    title,
    slug,
    description,
    Images,
    price,
    appliedDiscount,
    priceAfterDiscount,
    colors,
    sizes,
    stock,
    categoryId,
    subCategoryId,
    brandId,
    customId,
    createdBy: _id,
  };

  const product = await productModel.create(productObj);

  // Delete Imges from Host (Fail Case)
  if (!product) {
    await cloudinary.api.delete_resources(publicIds);
    return next(new Error("Fail to create the Product"));
  }
  res.status(200).json({ message: "Product Created Successfully", product });
};

/**************************** 2- Update Product ************************/

const updateProduct = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId, subCategoryId, brandId, productId } = req.query;
  const { title, description, appliedDiscount, price, colors, sizes, stock } =
    req.body;

  //Check on ProductId
  const product = await productModel.findOne({
    _id: productId,
    createdBy: _id,
  });
  if (!product) {
    return next(new Error("Invalid ProductId", { cause: 400 }));
  }

  //Check on CategoryId,SubCategoryId and BrandId
  const brandExist = await brandModel.findById(brandId);
  if (brandId) {
    if (!brandExist) {
      return next(new Error("Invalid BrandId", { cause: 400 }));
    }
  }
  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  if (subCategoryId) {
    if (!subCategoryExist) {
      return next(new Error("Invalid SubCategoryId", { cause: 400 }));
    }
  }
  const categoryExist = await categoryModel.findById(categoryId);
  if (categoryId) {
    if (!categoryExist) {
      return next(new Error("Invalid CategoryId", { cause: 400 }));
    }
  }
  // Check on Price and Discount
  if (price && appliedDiscount) {
    product.priceAfterDiscount = price - (price * (appliedDiscount || 0)) / 100;
  } else if (price) {
    product.priceAfterDiscount =
      price - (price * (product.appliedDiscount || 0)) / 100;
  } else if (appliedDiscount) {
    product.priceAfterDiscount =
      product.price - (product.price * (appliedDiscount || 0)) / 100;
  }

  //Check Images Upload on HOST
  //Upload the new Images
  if (req.files?.length) {
    let ImageArr = [];
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products/${product.customId}`,
        }
      );
      ImageArr.push({ secure_url, public_id });
    }
    //Delete the old Images
    let publicIds = [];
    for (const Image of product.Images) {
      publicIds.push(Image.public_id);
    }
    await cloudinary.api.delete_resources(publicIds);
  }
  //Update information
  if (title) {
    product.title = title;
    //Update Slug
    product.slug = slugify(title, "_");
  }
  if (description) product.description = description;
  if (colors) product.colors = colors;
  if (sizes) product.sizes = sizes;
  if (stock) product.stock = stock;

  // Update ProductId from User
  product.createdBy = _id;

  await product.save();
  res.status(200).json({ message: "Product updated successfully", product });
};

/**************************** 3- Get All Products ************************/

const getAllProducts = async (req, res, next) => {
  const product = await productModel.find().populate([
    {
      path: "brandId",
    },
    {
      path: "subCategoryId",
    },
    {
      path: "categoryId",
    },
    {
      path: "Reviews",
    },
  ]);
  res.status(200).json({ message: "Done", product });
};

/**************************** 4- Get Products By Name ************************/

const getProductsByTitle = async (req, res, next) => {
  const ApiFeaturesInstance = new ApiFeatures(
    productModel.find({}),
    req.query
  ).pagination();
  const products = await ApiFeaturesInstance.mongooseQuery;
  // const { page, size, search } = req.query;
  // const { limit, skip } = paginationFunction({ page, size });
  // const products = await productModel
  //   .find({
  //     $or: [
  //       { title: { $regex: search, $options: "i" } },
  //       { description: { $regex: search, $options: "i" } },
  //     ],
  //   })
  //   .limit(limit)
  //   .skip(skip);
  res.status(200).json({ message: "Done", products });
};

/**************************** 5- List Product ************************/

const listProduct = async (req, res, next) => {
  const { sort, select } = req.query;
  const ApiFeaturesInstance = new ApiFeatures(
    productModel.find({}),
    req.query
  ).filter();
  // ====================== Sort ==================
  // const products = await productModel.find().sort(sort.replaceAll(",", " "));

  //======================= Select ==================
  // const products = await productModel.find().select(select.replaceAll(",", " "));

  //======================= Filters ================
  // const filterData = JSON.parse(
  //   JSON.stringify(req.query).replace(
  //     /gt|gte|lt|lte|in|nin|eq|neq|regex/g,
  //     (match) => `$${match}`
  //   )
  // );

  const products = await ApiFeaturesInstance.mongooseQuery;
  // const products = await productModel.find(filterData);
  res.status(200).json({ message: "Done", products });
};

/**************************** 6- Delete Product ************************/

const deleteProduct = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId, subCategoryId, brandId, productId } = req.query;
  const categoryExist = await categoryModel.findById(categoryId);
  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  const brandExist = await brandModel.findById(brandId);

  //Delete product from DB
  const product = await productModel.findOneAndDelete({
    _id: productId,
    createdBy: _id,
  });
  if (!product) {
    return next(new Error("Invalid ProductId", { cause: 400 }));
  }

  //Delete Images from HOST

  for (const ImgIds of product.Images) {
    await cloudinary.uploader.destroy(ImgIds.public_id);
  }

  //Delete Folders from HOST
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products`
  );
  res.status(201).json({ message: "Product Deleted Successfully" });
};

export {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductsByTitle,
  listProduct,
  deleteProduct,
};
