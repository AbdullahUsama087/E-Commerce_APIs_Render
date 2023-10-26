import { Schema, model } from "mongoose"

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: String,
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    Images: [
      {
        secure_url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    rate: {
      type: Number,
      default: 0,
      required: true,
    },
    colors: [String],
    sizes: [String],
    price: {
      type: Number,
      required: true,
      default: 1,
    },
    appliedDiscount: {
      type: Number,
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "subCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    customId: String,
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

productSchema.virtual("Reviews", {
  ref: "Review",
  foreignField: "productId",
  localField: "_id",
});

const productModel = model("Product", productSchema);

export default productModel;
