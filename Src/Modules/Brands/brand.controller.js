import slugify from "slugify";
import cloudinary from "../../Utils/cloudinaryConfigrations.js";
import categoryModel from "../../../DB/Models/category.model.js";
import subCategoryModel from "../../../DB/Models/subCategory.model.js";
import brandModel from "../../../DB/Models/brand.model.js";
import productModel from "../../../DB/Models/product.model.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456789_-@#$%", 6);

// ****************** 1- Create Brand ****************

const createBrand = async (req, res, next) => {
  const { _id } = req.authUser;
  const { name } = req.body;
  const { categoryId, subCategoryId } = req.query;

  //Check Category and SubCategory Exists

  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  if (!subCategoryExist) {
    return next(new Error("Invalid SubCategoryId", { cause: 400 }));
  }
  const categoryExist = await categoryModel.findById(categoryId);
  if (!categoryExist) {
    return next(new Error("Invalid CategoryId", { cause: 400 }));
  }

  //Create Slug
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  //Check Logo Upload
  if (!req.file) {
    return next(new Error("Please Upload a Logo for Brand"));
  }
  //Upload Logo on HOST
  const customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${customId}`,
    }
  );

  // Upload Logo on DB
  const brandObject = {
    name,
    slug,
    logo: { secure_url, public_id },
    categoryId,
    subCategoryId,
    customId,
    createdBy: _id,
  };
  const brand = await brandModel.create(brandObject);
  //Delete Logo from HOST
  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Fail to add the Img of Brand", { cause: 400 }));
  }
  res.status(200).json({ message: "Brand Created Successfully", brand });
};

// ****************** 2- Update Brand ****************

const updateBrand = async (req, res, next) => {
  const { _id } = req.authUser;
  const { name } = req.body;
  const { categoryId, subCategoryId, brandId } = req.query;
  //Check on BrandId
  const brand = await brandModel.findOne({ _id: brandId, createdBy: _id });
  if (!brandExist) {
    return next(new Error("Invalid BrandID", { cause: 400 }));
  }
  //Check on subCategoryId and CategoryId
  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  if (subCategoryId) {
    if (!subCategoryExist) {
      return next(new Error("Invalid SubCategoryId", { cause: 400 }));
    }
    brand.subCategoryId = subCategoryId;
  }

  const categoryExist = await categoryModel.findById(categoryId);
  if (categoryId) {
    if (!categoryExist) {
      return next(new Error("Invalid CategoryId", { cause: 400 }));
    }
    brand.categoryId = categoryId;
  }
  //Check the name is different
  if (name) {
    if (brand.name == name) {
      return next(
        new Error("This name matchs the old name , Please choose a new one", {
          cause: 400,
        })
      );
    }
    //Update brand and slug
    brand.name = name;
    brand.slug = slugify(name, "_");
  }
  //Check Logo Upload
  if (!req.file) {
    return next(
      new Error("Please Upload a Logo for the brand", { cause: 400 })
    );
  }
  //Delete the old logo
  await cloudinary.uploader.destroy(brand.logo.public_id);
  //Upload Logo on HOST
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${brand.customId}`,
    }
  );
  //Upload Logo on DB
  brand.logo = { secure_url, public_id };

  // Update BrandId from User
  brand.updatedBy = _id;

  await brand.save();
  res.status(201).json({ message: "Brand Updated Successfully", brand });
};

// ****************** 3- Get All Brands ****************

const getAllBrands = async (req, res, next) => {
  const brands = await brandModel.find().populate([
    {
      path: "subCategoryId",
    },
    {
      path: "categoryId",
    },
  ]);
  res.status(200).json({ message: "Done", brands });
};

// ********************* 4- Delete Brand *********************

const deleteBrand = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId, subCategoryId, brandId } = req.query;
  //Check for category and subCategory Exists
  const categoryExist = await categoryModel.findOne(categoryId);
  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  //Check and Delete Brand from DB
  const brandExist = await brandModel.findOneAndDelete({
    _id: brandId,
    createdBy: _id,
  });
  if (!brandExist) {
    return next(new Error("Invalid BrandId", { cause: 400 }));
  }
  //Delete Imges from Brand On HOST
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}`
  );
  //Delete Folder from Brands On HOST
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}`
  );

  //Check and Delete related Products from DB
  const relatedProducts = await productModel.deleteMany({ brandId });
  if (!relatedProducts) {
    return next(new Error("Fail to delete related Products", { cause: 400 }));
  }
  res.status(201).json({ message: "Brand Deleted Successfully" });
};

export { createBrand, updateBrand, getAllBrands, deleteBrand };
