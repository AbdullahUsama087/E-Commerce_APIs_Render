import slugify from "slugify";
import cloudinary from "../../Utils/cloudinaryConfigrations.js";
import categoryModel from "../../../DB/Models/category.model.js";
import subCategoryModel from "../../../DB/Models/subCategory.model.js";
import brandModel from "../../../DB/Models/brand.model.js";
import productModel from "../../../DB/Models/product.model.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456789_-@#$%", 6);

// ******************** 1- Create Category ****************

const createCategory = async (req, res, next) => {
  const { _id } = req.authUser;
  const { name } = req.body;
  //Create Slug
  const slug = slugify(name, "_");

  //Check the name is unique
  if (await categoryModel.findOne({ name })) {
    return next(
      new Error(
        "This name of Category is already exist !, Please Choose another one",
        {
          cause: 400,
        }
      )
    );
  }

  // Check Img Upload
  if (!req.file) {
    return next(
      new Error("Please upload the image of Category", { cause: 400 })
    );
  }
  //upload on Host(Cloudinary)
  const customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${customId}`,
    }
  );
  //upload on DB
  const categoryObject = {
    name,
    slug,
    Image: { secure_url, public_id },
    customId,
    createdBy: _id,
  };
  const category = await categoryModel.create(categoryObject);
  //Delete Img from HOST
  if (!category) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Fail To add the Img of Category", { cause: 400 }));
  }
  res.status(200).json({ message: "Category Added Successfully", category });
};

// ******************** 2- Update Category ****************

const updateCategory = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId } = req.query;
  const { name } = req.body;
  const category = await categoryModel.findOne({
    _id: categoryId,
    createdBy: _id,
  });
  if (!category) {
    return next(new Error("Invalid Category Id", { cause: 400 }));
  }
  if (name) {
    //Check the name update
    if (category.name == name.toLowerCase()) {
      return next(
        new Error("Please Enter a different name from the old one", {
          cause: 400,
        })
      );
    }
    //Check the name is unique
    if (await categoryModel.findOne({ name })) {
      return next(new Error("This name is already exist", { cause: 400 }));
    }
    category.name = name;
    category.slug = slugify(name, "_");
  }
  if (req.file) {
    //Delete the old Category Img from HOST
    await cloudinary.uploader.destroy(category.Image.public_id);
    //Upload new Img (HOST)
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}`,
      }
    );
    //Upload new Img (DB)
    category.Image = { secure_url, public_id };
  }

  // CategoryId update by user
  category.updatedBy = _id;

  await category.save();
  res.status(201).json({ message: "Category Updated Successfully", category });
};

// ******************** 3- Get All Categories ****************

const getAllCategories = async (req, res, next) => {
  /***************** Virtual way ************/
  const Categories = await categoryModel.find().populate([
    {
      path: "subCategories",
      populate: [
        {
          path: "Brands",
        },
      ],
    },
  ]);
  /***************** Cursor way ************/

  // let categoryArr = [];
  // const cursor = await categoryModel.find().cursor();
  // for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  //   const subCategories = await subCategoryModel.find({
  //     categoryId: doc._id,
  //   });
  //   const categoryObj = doc.toObject();
  //   categoryObj.subCategories = subCategories;
  //   categoryArr.push(categoryObj);

  /********************* for loop way *******************/

  // let subCategories = [];
  // let categoryArr = [];
  // for (const category of await categoryModel.find()) {
  //   subCategories = await subCategoryModel.find({
  //     categoryId: category._id,
  //   });
  //   const categoryObj = category.toObject();
  //   categoryObj.subCategories = subCategories;
  //   categoryArr.push(categoryObj);
  // }
  res.status(200).json({ message: "Done", Categories });
};

// ******************** 4- Delete Category ********************

const deleteCategory = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId } = req.query;
  //Check and delete Category from DB
  const categoryExist = await categoryModel.findOneAndDelete({
    _id: categoryId,
    createdBy: _id,
  });
  if (!categoryExist) {
    return next(new Error("Invalid Category", { cause: 400 }));
  }

  // Delete IMgs from HOST
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}`
  );
  // Delete Folder from Host
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}`
  );

  //Check and delete related subCategories,brands and products from DB
  if (await subCategoryModel.findById(categoryId)) {
    const relatedSubCategories = await subCategoryModel.deleteMany({
      categoryId,
    });
    if (!relatedSubCategories.deletedCount) {
      return next(
        new Error("Fail to delete related subCategories", { cause: 400 })
      );
    }
  }
  if (await brandModel.findById(categoryId)) {
    const relatedBrands = await brandModel.deleteMany({ categoryId });
    if (!relatedBrands.deletedCount) {
      return next(new Error("Fail to delete related Brands", { cause: 400 }));
    }
  }
  if (await productModel.findById(categoryId)) {
    const relatedProducts = await productModel.deleteMany({ categoryId });
    if (!relatedProducts.deletedCount) {
      return next(new Error("Fail to delete related Products", { cause: 400 }));
    }
  }

  res.status(200).json({ message: "Category Deleted Successfully" });
};

export { createCategory, updateCategory, getAllCategories, deleteCategory };
