import systemRoles from "../../Utils/systemRoles.js";

const subCategoryAPIsRoles = {
  CREATE_SUBCATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  UPDATE_SUBCATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  DELETE_SUBCATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};

export default subCategoryAPIsRoles;
