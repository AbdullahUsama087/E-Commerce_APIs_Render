import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    paidAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Placed",
        "Preperation",
        "On Way",
        "Delivered",
        "Canceled",
      ],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Card"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    canceledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: String,
  },
  { timestamps: true }
);

const orderModel = model("Order", orderSchema);

export default orderModel;
