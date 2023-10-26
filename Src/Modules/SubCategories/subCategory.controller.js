import slugify from "slugify";
import cloudinary from "../../Utils/cloudinaryConfigrations.js";
import categoryModel from "../../../DB/Models/category.model.js";
import subCategoryModel from "../../../DB/Models/subCategory.model.js";
import brandModel from "../../../DB/Models/brand.model.js";
import productModel from "../../../DB/Models/product.model.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("123456789_-@#$%", 6);

// ******************** 1- Create SubCategory ****************

const createSubCategory = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId } = req.params;
  const { name, logType } = req.body;
  //Generate Slug
  const slug = slugify(name, "_");

  //Check CategoryId
  const categoryExist = await categoryModel.findById(categoryId);
  if (!categoryExist) {
    return next(new Error("Invalid CategoryId", { cause: 400 }));
  }
  // Check the name is unique
  if (await subCategoryModel.findOne({ name })) {
    console.log(await subCategoryModel.findOne({ name }));
    return next(new Error("The name of subCategory is already exist"));
  }
  //Check Img Upload
  if (!req.file) {
    return next(new Error("Please Upload The Img of SubCategory"));
  }
  //Upload Img on Host
  const customId = nanoid();

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${customId}`,
    }
  );
  // Upload Img on DB
  const subCategoryObject = {
    name,
    slug,
    Image: { secure_url, public_id },
    customId,
    categoryId,
    createdBy: _id,
  };
  const subCategory = await subCategoryModel.create(subCategoryObject);
  // console.log(subCategory);

  // Delete Img from HOST
  if (!subCategory) {
    await cloudinary.uploader.destroy(public_id);
    return next(
      new Error("Fail To add the Img of SubCategory", { cause: 400 })
    );
  }
  res
    .status(201)
    .json({ message: "SubCategory Added Successfully", subCategory });
};

// ******************** 2- Update SubCategory ****************

const updateSubCategory = async (req, res, next) => {
  const { _id } = req.authUser;
  const { subCategoryId, categoryId } = req.query;
  const { name } = req.body;
  // Check SubCategoryID
  const subCategory = await subCategoryModel.findOne({
    _id: subCategoryId,
    createdBy: _id,
  });
  if (!subCategory) {
    return next(new Error("Invalid SubCategoryId", { cause: 400 }));
  }
  // Check Category ID
  const categoryExist = await categoryModel.findById(categoryId);
  if (categoryId) {
    if (!categoryExist) {
      return next(new Error("Invalid CategoryId", { cause: 400 }));
    }
    subCategory.categoryId = categoryId;
  }
  //Check the name is different
  if (name) {
    if (subCategory.name == name) {
      return next(
        new Error("the name matchs the old one ,Please Enter a new Name", {
          cause: 400,
        })
      );
    }
    //Check the name is unique
    if (await subCategoryModel.findOne({ name })) {
      return next(
        new Error("The name of subCategory is already exist", { cause: 400 })
      );
    }
    //Update name and slug
    subCategory.name = name;
    subCategory.slug = slugify(name, "_");
  }
  //Check Img
  if (!req.file) {
    return next(
      new Error("Please Enter Image for subCategory", { cause: 400 })
    );
  }
  //Delete the old subCategoryImg
  await cloudinary.uploader.destroy(subCategory.Image.public_id);

  //Upload new Img (Host)

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategory.customId}`,
    }
  );

  //Upload On DB

  subCategory.Image = { secure_url, public_id };

  // Update subCategoryId from user
  subCategory.updatedBy = _id;

  await subCategory.save();
  res
    .status(201)
    .json({ message: "SubCategory Updated Successfully", subCategory });
};

// ********************** 3- Get All SubCategories ****************

const getAllSubCategories = async (req, res, next) => {
  const subCategories = await subCategoryModel.find().populate([
    {
      path: "categoryId",
      select: "slug",
    },
  ]);
  res.status(200).json({ message: "Done", subCategories });
};

// ********************** 4- Delete SubCategory ****************

const deleteSubCategory = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId, subCategoryId } = req.query;
  //Check for Is Category Exists
  const categoryExist = await categoryModel.findOne(categoryId);
  //Check and delete subCategory from DB
  const subCategoryExist = await subCategoryModel.findOneAndDelete({
    _id: subCategoryId,
    createdBy: _id,
  });
  if (!subCategoryExist) {
    return next(new Error("Invalid SubCategoryId", { cause: 400 }));
  }
  //Delete Images of subCategory from HOST
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}`
  );

  //Delete Folders of subCategory from HOST
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}`
  );

  //Check and Delete related Brands and Products from DB
  if (await brandModel.findById(categoryId)) {
    const relatedBrands = await brandModel.deleteMany({ subCategoryId });
    if (!relatedBrands.deletedCount) {
      return next(new Error("Fail to Delete related Brands", { cause: 400 }));
    }
  }
  const relatedProducts = await productModel.deleteMany({ subCategoryId });
  if (!relatedProducts) {
    return next(new Error("Fail to delete related Products", { cause: 400 }));
  }
  res.status(201).json({ message: "subCategory Deleted Successfully" });
};

export {
  createSubCategory,
  updateSubCategory,
  getAllSubCategories,
  deleteSubCategory,
};
