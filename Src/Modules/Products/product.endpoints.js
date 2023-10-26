import systemRoles from "../../Utils/systemRoles.js";

const productAPIsRoles = {
  CREATE_PRODUCT: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  UPDATE_PRODUCT: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  DELETE_PRODUCT: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};

export default productAPIsRoles;
