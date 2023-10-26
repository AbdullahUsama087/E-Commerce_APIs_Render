import orderModel from "../../../DB/Models/order.model.js";
import productModel from "../../../DB/Models/product.model.js";
import reviewModel from "../../../DB/Models/review.model.js";

/************************* 1- Add Review *******************/

const addReview = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const { productId } = req.query;
  const { reviewRate, reviewComment } = req.body;
  // Check on Product
  const productToBeReviewed = await orderModel.findOne({
    userId,
    "products.productId": productId,
    orderStatus: "Delivered",
  });
  if (!productToBeReviewed) {
    return next(new Error("You Should buy the Product first", { cause: 400 }));
  }
  const reviewObj = {
    userId,
    productId,
    reviewRate,
    reviewComment,
  };
  const reviewDb = await reviewModel.create(reviewObj);
  if (!reviewDb) {
    return next(new Error("Fail to add Review", { cause: 400 }));
  }
  const product = await productModel.findById(productId);
  const reviews = await reviewModel.find({ productId });
  let sumOfRates = 0;
  for (const review of reviews) {
    sumOfRates += review.reviewRate;
  }
  product.rate = Number(sumOfRates / reviews.length).toFixed(2);

  await product.save();

  res.status(200).json({ message: "Add Review Done", reviewDb, product });
};

export { addReview };