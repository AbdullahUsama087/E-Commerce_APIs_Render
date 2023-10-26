import { nanoid } from "nanoid";
import cartModel from "../../../DB/Models/cart.model.js";
import couponModel from "../../../DB/Models/coupon.model.js";
import orderModel from "../../../DB/Models/order.model.js";
import productModel from "../../../DB/Models/product.model.js";
import isCouponValid from "../../Utils/couponCheck.js";
import createInvoice from "../../Utils/pdfkit.js";
import sendEmailService from "../../Services/sendEmailService.js";
import qrCodeFunction from "../../Utils/QrCode.js";
import paymentFunction from "../../Utils/payment.js";
import { generateToken, verifyToken } from "../../Utils/tokenFunctions.js";
import Stripe from "stripe";

/********************** 1- Create Order ******************/

const createOrder = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const {
    productId,
    quantity,
    address,
    phoneNumbers,
    paymentMethod,
    couponCode,
  } = req.body;
  // console.log(userId);
  // Check if User has CouponCode
  if (couponCode) {
    const coupon = await couponModel
      .findOne({ couponCode })
      .select("isPercentage isFixedAmount couponAmount couponAssignedToUsers");
    const isCouponValidResult = await isCouponValid({
      couponCode,
      userId,
      next,
    });
    if (isCouponValidResult !== true) {
      return next(new Error(isCouponValidResult.msg, { cause: 400 }));
    }
    req.coupon = coupon;
  }
  // Check on Product is Valid Or Not
  const products = [];
  const isProductValid = await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
  if (!isProductValid) {
    return next(new Error("This Product is Invalid", { cause: 400 }));
  }
  const productObj = {
    productId,
    quantity,
    title: isProductValid.title,
    price: isProductValid.priceAfterDiscount,
    finalPrice: isProductValid.priceAfterDiscount * quantity,
  };
  products.push(productObj);

  // Calculate SubTotal
  const subTotal = productObj.finalPrice;

  //Check if Coupon value is greater than price Value
  if (
    req.coupon?.isPercentage &&
    req.coupon?.isFixedAmount > isProductValid.priceAfterDiscount
  ) {
    return next(new Error("Please Select another Product", { cause: 400 }));
  }
  // Calculate PaidAmount
  let paidAmount = 0;
  if (req.coupon?.isPercentage) {
    paidAmount = subTotal - (subTotal * (req.coupon.couponAmount || 0)) / 100;
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - req.coupon.couponAmount;
  } else {
    paidAmount = subTotal;
  }

  // Change Order Status

  let orderStatus;
  if (paymentMethod == "Cash") {
    orderStatus = "Placed";
  } else {
    orderStatus = "Pending";
  }

  // Create Order Instance on DB
  const orderObject = {
    userId,
    products,
    address,
    phoneNumbers,
    paymentMethod,
    orderStatus,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  };

  const orderDb = await orderModel.create(orderObject);
  if (!orderDb) {
    return next(new Error("Fail to do this Order", { cause: 400 }));
  }

  //======================= Payment ========================
  let orderSession;
  if (orderDb.paymentMethod == "Card") {
    // =========== Apply Coupon ===============
    if (req.coupon) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      let coupon;
      // isPercentage Coupon
      if (req.coupon.isPercentage) {
        coupon = await stripe.coupons.create({
          percent_off: req.coupon.couponAmount,
        });
      }

      // isFixedAmount Coupon
      if (req.coupon.isFixedAmount) {
        coupon = await stripe.coupons.create({
          amount_off: req.coupon.couponAmount * 100,
          currency: "EGP",
        });
      }
      req.couponId = coupon.id;
    }

    //  Generate Token
    const token = generateToken({
      payload: { orderId: orderDb._id },
      signature: process.env.ORDER_TOKEN,
      expiresIn: "1h",
    });

    orderSession = await paymentFunction({
      payment_method_types: [orderDb.paymentMethod],
      mode: "payment",
      customer_email: req.authUser.email,
      metadata: { orderId: orderDb._id.toString() },
      success_url: `${req.protocol}://${req.headers.host}/order/successOrder?token=${token}`,
      cancel_url: `${req.protocol}://${req.headers.host}/order/cancelOrder?token=${token}`,
      line_items: orderDb.products.map((ele) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: ele.title,
            },
            unit_amount: ele.price * 100,
          },
          quantity: ele.quantity,
        };
      }),
      discounts: req.couponId ? [{ coupon: req.couponId }] : [],
    });
  }
  // console.log(orderSession);

  // Increase Usage Count for Coupon Usage

  if (req.coupon) {
    for (const user of req.coupon.couponAssignedToUsers) {
      if (userId.toString() == user.userId.toString()) {
        user.usageCount -= 1;
      }
    }
    await req.coupon.save();
  }

  // Decrease the Stock by Order's Product Quantity

  await productModel.findOneAndUpdate(
    { _id: productId },
    { $inc: { stock: -quantity } }
  );

  // TODO: remove Product from userCart If Exist

  /************************** Order QR Code ******************/

  const orderQr = await qrCodeFunction({
    data: { orderId: orderDb._id, products: orderDb.products },
  });

  /************************** Create Invoice ****************/
  // Create Order code
  const orderCode = `${req.authUser.userName}_${nanoid(3)}`;

  //Crete Order Object

  // const orderInvoice = {
  //   shipping: {
  //     name: req.authUser.userName,
  //     address: orderDb.address,
  //     city: "Cairo",
  //     state: "Cairo",
  //     country: "Egypt",
  //   },
  //   items: orderDb.products,
  //   subTotal: orderDb.subTotal,
  //   paidAmount: orderDb.paidAmount,
  //   date: orderDb.createdAt,
  //   orderCode,
  // };

  // createInvoice(orderInvoice, `${orderCode}.pdf`);
  // await sendEmailService({
  //   to: req.authUser.email,
  //   subject: "Order Confirmation",
  //   message: "<h1>Please find your invoice below</h1>",
  //   attachments: [
  //     {
  //       path: `./Files/${orderCode}.pdf`,
  //     },
  //   ],
  // });

  res.status(201).json({
    message: "Order done Successfully",
    orderDb,
    checkOutURL: orderSession.url,
  });
};

/********************** 2- Create Order from Cart ******************/

const orderFromCart = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const { cartId } = req.query;
  const { address, phoneNumbers, paymentMethod, couponCode } = req.body;

  //Check on there isn't Cart or it's empty
  const cart = await cartModel.findById(cartId);
  if (!cart || !cart.products.length) {
    return next(new Error("Your Cart is Empty", { cause: 400 }));
  }

  // Check on Coupon

  if (couponCode) {
    const coupon = await couponModel
      .findOne({ couponCode })
      .select("isPercentage isFixedAmount couponAmount couponAssignedToUsers");
    const isCouponValidResult = await isCouponValid({
      couponCode,
      userId,
      next,
    });
    if (isCouponValidResult !== true) {
      return next(new Error(isCouponValidResult.msg, { cause: 400 }));
    }
    req.coupon = coupon;
  }

  // Check on Product in Cart
  let orderProducts = [];
  for (const product of cart.products) {
    const productExist = await productModel.findById(product.productId);
    const productObj = {
      productId: product.productId,
      quantity: product.quantity,
      title: productExist.title,
      price: productExist.priceAfterDiscount,
      finalPrice: productExist.priceAfterDiscount * product.quantity,
    };
    orderProducts.push(productObj);
  }

  // Calculate SubTotal
  let subTotal = cart.subTotal;

  // Calculate PaidAmount
  let paidAmount = 0;
  if (req.coupon?.isPercentage) {
    paidAmount = subTotal - (subTotal * req.coupon.couponAmount || 0) / 100;
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - req.coupon.couponAmount;
  } else {
    paidAmount = subTotal;
  }

  // Change Order Status
  let orderStatus;
  paymentMethod == "Cash"
    ? (orderStatus = "Placed")
    : (orderStatus = "Pending");

  // Create Order Instance on DB
  const orderObject = {
    userId,
    products: orderProducts,
    address,
    phoneNumbers,
    orderStatus,
    paymentMethod,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  };

  const orderDb = await orderModel.create(orderObject);
  if (!orderDb) {
    return next(new Error("Fail to do This Order", { cause: 400 }));
  }

  // Increase the usageCount for Coupon
  if (req.coupon) {
    for (const user of req.coupon.couponAssignedToUsers) {
      if (userId.toString() == user.userId.toString()) {
        user.usageCount += 1;
      }
    }
    await req.coupon.save();
  }

  // Decrease the stock by Quantity of product

  for (const product of cart.products) {
    await productModel.findByIdAndUpdate(
      { _id: product.productId },
      { $inc: { stock: -product.quantity } }
    );
  }

  // Remove Products from userCart if exist
  cart.products = [];
  await cart.save();

  res.status(201).json({ message: "Order Done Successfully", orderDb, cart });
};

/*********************** 3- Success Payment ***************************/

const successPayment = async (req, res, next) => {
  const { token } = req.query;
  console.log(token);
  const decodedDate = verifyToken({
    token,
    signature: process.env.ORDER_TOKEN,
  });
  const order = await orderModel.findOneAndUpdate(
    { _id: decodedDate.orderId, orderStatus: "Pending" },
    { orderStatus: "Confirmed" },
    { new: true }
  );
  if (!order) {
    return next(new Error("Fail to Confirm Order", { cause: 400 }));
  }
  res.status(200).json({ message: "Your Order Is Confirmed", order });
};

/*********************** 4- Cancel Payment ***************************/

const cancelPayment = async (req, res, next) => {
  const { token } = req.query;
  const decodedDate = verifyToken({
    token,
    signature: process.env.ORDER_TOKEN,
  });
  const order = await orderModel.findOneAndUpdate(
    { _id: decodedDate.orderId },
    { orderStatus: "Canceled" },
    { new: true }
  );
  if (!order) {
    return next(new Error("Fail to Confirm Order", { cause: 400 }));
  }

  //=========== Undo Products Stock ==========

  for (const product of order.products) {
    await productModel.findByIdAndUpdate(product.productId, {
      $inc: { stock: product.quantity },
    });
  }

  //=========== Undo Coupons Usage ===========

  if (order.couponId) {
    const coupon = await couponModel.findById(order.couponId);
    if (!coupon) {
      return next(new Error("This Coupon Is deleted", { cause: 400 }));
    }
    coupon.couponAssignedToUsers.map((ele) => {
      if (ele.userId.toString() == order.userId.toString()) {
        ele.usageCount -= 1;
      }
    });
    await coupon.save();
  }

  res.status(200).json({ message: "Your Order is Canceled", order });
};

export { createOrder, orderFromCart, successPayment, cancelPayment };
