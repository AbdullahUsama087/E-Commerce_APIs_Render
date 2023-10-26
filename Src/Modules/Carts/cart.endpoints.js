import systemRoles from "../../Utils/systemRoles.js";

const cartAPIsRoles = {
  CREATE_CART: [systemRoles.USER],
  UPDATE_CART: [systemRoles.USER],
  DELETE_CART: [systemRoles.USER],
};

export default cartAPIsRoles;
