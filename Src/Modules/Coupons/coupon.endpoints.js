import systemRoles from "../../Utils/systemRoles.js";

const couponAPIsRoles = {
  CREATE_COUPON: [systemRoles.ADMIN],
  UPDATE_COUPON: [systemRoles.ADMIN],
  DELETE_COUPON: [systemRoles.ADMIN],
};

export default couponAPIsRoles;
