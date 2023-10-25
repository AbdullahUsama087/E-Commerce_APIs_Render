import { Schema, Types, model } from "mongoose";

const couponSchema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    couponAmount: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 100,
    },
    isPercentage: {
      type: Boolean,
      default: false,
      required: true,
    },
    isFixedAmount: {
      type: Boolean,
      default: false,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
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
    couponAssignedToUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        maxUsage: {
          type: Number,
          required: true,
        },
        usageCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    couponAssignedToProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },
    couponStatus: {
      type: String,
      required: true,
      enum: ["Expired", "Valid"],
      default: "Valid",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const couponModel = model("Coupon", couponSchema);

export default couponModel;
