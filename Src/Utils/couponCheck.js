import moment from "moment";
import couponModel from "../../DB/Models/coupon.model.js";

const isCouponValid = async ({ couponCode, userId, next } = {}) => {
  const coupon = await couponModel.findOne({ couponCode });
  // if User entered a wrong code
  if (!coupon) {
    return next(new Error("This CouponCode is not Valid", { cause: 400 }));
  }
  // if Coupon was Expired
  if (
    coupon.couponStatus == "Expired" ||
    moment(new Date(coupon.toDate)).isBefore(moment(new Date()))
  ) {
    return next(new Error("This Coupon is Expired", { cause: 400 }));
  }
  // if Coupon dosn't started yet
  if (
    coupon.couponStatus == "Valid" &&
    moment(new Date()).isBefore(moment(new Date(coupon.fromDate)))
  ) {
    return next(new Error("Coupon dosn't started yet"));
  }
  let notAssignedUsers = [];
  let userMaxUsage = false; 
  for (const user of coupon.couponAssignedToUsers) {
    // if Coupon is not assigned for this User
    // if (userId.toString() !== user.userId.toString()) {
    //   return next(
    //     new Error("This User is not assigned to use this Coupon", {
    //       cause: 400,
    //     })
    //   );
    // }
    notAssignedUsers.push(user.userId.toString());

    // if user exceeded the max Usage
    if (user.userId.toString() == userId.toString()) {
      // To handle the object of user that he is already loggedIn
      if (user.maxUsage <= user.usageCount) {
        // return next(
        //   new Error("You exceeded the max limit for usage of this Coupon", {
        //     cause: 400,
        //   })
        // );
        userMaxUsage = true;
      }
    }
  }

  //================== Not Assigned To Users ===============

  if (!notAssignedUsers.includes(userId.toString())) {
    return {
      NotAssigned: true,
      msg: "This User is not assigned to use this Coupon",
    };
  }
  if (userMaxUsage) {
    return {
      msg: "You exceeded the max limit for usage of this Coupon",
    };
  }

  return true;
};

export default isCouponValid;
