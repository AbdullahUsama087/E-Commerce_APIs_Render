import systemRoles from "../../Utils/systemRoles.js";

const brandAPIsRoles = {
  CREATE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  UPDATE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  DELETE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};

export default brandAPIsRoles;
