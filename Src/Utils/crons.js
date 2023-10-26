import { scheduleJob } from "node-schedule";
import couponModel from "../../DB/Models/coupon.model.js";
import moment from "moment";

const changeCouponStatusCron = () => {
  scheduleJob("* */60 * * * *", async function () {
    const validCoupons = await couponModel.find({ couponStatus: "Valid" });
    for (const coupon of validCoupons) {
    //   console.log({
    //     momentToDate: moment(coupon.toDate),
    //     nowTime: moment(),
    //     Condition: moment(coupon.toDate).isBefore(moment()),
    //   });
      if (moment(coupon.toDate).isBefore(moment())) {
        coupon.couponStatus = "Expired";
      }
      await coupon.save();
    }
    console.log("cron changeCouponStatusCron() Is Running.........");
  });
};

export { changeCouponStatusCron };
