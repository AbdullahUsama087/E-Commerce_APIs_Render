import systemRoles from "../../Utils/systemRoles.js";

const categoryAPIsRoles = {
  CREATE_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  UPDATE_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  DELETE_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};

export default categoryAPIsRoles;