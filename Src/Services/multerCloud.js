import multer from "multer";
import allowedExtensions from "../Utils/allowedExtensions.js";

const multerCloudFunction = (allowedExtensionArr) => {
  if (!allowedExtensionArr) {
    allowedExtensionArr = allowedExtensions.Image;
  }
  /**************** Storage  *************/
  const storage = multer.diskStorage({});
  /***************** File Filter ***************/
  const fileFilter = function (req, file, cb) {
    if (allowedExtensionArr.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Invalid Extension", { cause: 400 }), false);
  };
  const fileUpload = multer({ fileFilter, storage });
  return fileUpload;
};

export default multerCloudFunction