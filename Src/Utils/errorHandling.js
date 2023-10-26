import cloudinary from "./cloudinaryConfigrations.js";

/************ Error Handlig *************/
const asyncHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch(async (err) => {
      console.log(err);
      if (req.imagePath) {
        await cloudinary.api.delete_resources_by_prefix(req.imagePath);

        await cloudinary.api.delete_folder(req.imagePath);
      }

      return next(new Error("Fail", { cause: 500 }));
    });
  };
};

//*********** Global Response **************/
const globalResponse = (err, req, res, next) => {
  if (err) {
    if (req.validationErrArr) {
      return res
        .status(err["cause"] || 400)
        .json({ message: req.validationErrArr });
    }
    return res.status(err["cause"] || 500).json({ message: err.message });
  }
};
export { globalResponse, asyncHandler };
