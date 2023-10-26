import moment from "moment";
import couponModel from "../../../DB/Models/coupon.model.js";
import userModel from "../../../DB/Models/user.model.js";

/************************* 1- Create Coupon  *******************/

const createCoupon = async (req, res, next) => {
  const { _id } = req.authUser;
  const {
    couponCode,
    couponAmount,
    isPercentage,
    isFixedAmount,
    fromDate,
    toDate,
    couponAssignedToUsers,
  } = req.body;

  //Check if the coupon is already exist
  const couponExist = await couponModel.findOne({ couponCode });
  if (couponExist) {
    return next(
      new Error("This Coupon is already exist, The Coupon should be Unique", {
        cause: 400,
      })
    );
  }

  //Check for the discount
  if ((isPercentage && isFixedAmount) || (!isPercentage && !isFixedAmount)) {
    return next(
      new Error("Please Select the Discount of Coupon is Amount or Percent", {
        cause: 400,
      })
    );
  }

  // Assign Coupon To Users

  let userIds = [];
  for (const user of couponAssignedToUsers) {
    userIds.push(user.userId);
  }
  const usersCheck = await userModel.find({
    _id: {
      $in: userIds,
    },
  });
  if (userIds.length !== usersCheck.length) {
    return next(new Error("Invalid userIds", { cause: 400 }));
  }

  const couponObject = {
    couponCode,
    couponAmount,
    isPercentage,
    isFixedAmount,
    fromDate,
    toDate,
    couponAssignedToUsers,
    createdBy: _id,
  };

  //Upload Coupon on DB
  const couponDb = await couponModel.create(couponObject);
  if (!couponDb) {
    return next(new Error("Fail to Add Coupon", { cause: 400 }));
  }
  res.status(201).json({ message: "Coupon Added Successfully", couponDb });
};

/************************* 2- Update Coupon ********************/

const updateCoupon = async (req, res, next) => {
  const { _id } = req.authUser;
  const { couponId } = req.query;
  const {
    couponCode,
    couponAmount,
    isPercentage,
    isFixedAmount,
    fromDate,
    toDate,
  } = req.body;

  const coupon = await couponModel.findOne({ _id: couponId, createdBy: _id });
  if (!coupon) {
    return next(new Error("Invalid CouponId", { cause: 400 }));
  }
  // console.log(req.body.couponCode);
  // const vv = await couponModel.findOne({ couponCode });
  // console.log(vv);\
  const couponCheck = await couponModel.findOne({ couponCode });
  //Check the code is unique
  if (couponCheck) {
    return next(new Error("This Code is already Exist", { cause: 400 }));
  }

  //Check the code is update
  if (coupon.couponCode == couponCode) {
    return next(
      new Error("This Code matchs the old one, Please Write a new Code", {
        cause: 400,
      })
    );
  }
  if (couponCode) coupon.couponCode = couponCode;
  if (couponAmount) coupon.couponAmount = couponAmount;
  if (isPercentage) coupon.isPercentage = isPercentage;
  if (isFixedAmount) coupon.isFixedAmount = isFixedAmount;
  if (fromDate) coupon.fromDate = fromDate;
  if (toDate) {
    // date valid
    if (moment(new Date()).isAfter(moment(new Date(toDate)))) {
      return next(new Error("to date wrong"));
    }
    if (coupon.couponStatus == "Expired") coupon.couponStatus = "Valid";
    coupon.toDate = toDate;
  }

  // Update couponId from User
  coupon.createdBy = _id;

  await coupon.save();
  res.status(201).json({ message: "Coupon updated Successfully", coupon });
};

/************************* 3- Get All Coupons ********************/

const getAllCoupons = async (req, res, next) => {
  const coupons = await couponModel.find({});
  res.status(201).json({ message: "Coupons", coupons });
};

/************************* 4- Delete Coupon ********************/

const deleteCoupon = async (req, res, next) => {
  const { _id } = req.authUser;
  const { couponId } = req.query;
  const coupon = await couponModel.findOneAndDelete({
    _id: couponId,
    createdBy: _id,
  });
  if (!coupon) {
    return next(new Error("This Coupon is not Exist!", { cause: 400 }));
  }
  res.status(200).json({ message: "Coupon deleted Successfully" });
};

export { createCoupon, updateCoupon, getAllCoupons, deleteCoupon };
