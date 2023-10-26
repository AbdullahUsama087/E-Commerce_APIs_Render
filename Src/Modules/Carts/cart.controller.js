import cartModel from "../../../DB/Models/cart.model.js";
import productModel from "../../../DB/Models/product.model.js";

/******************** 1- Add To Cart **************/

const addToCart = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const { productId, quantity } = req.body;

  //Check on Products
  const checkProduct = await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });

  // console.log(userId);
  if (!checkProduct) {
    return next(
      new Error("Invalid Product, Please Check the quantity", { cause: 400 })
    );
  }
  const userCart = await cartModel.findOne({ userId }).lean();
  // console.log(userCart);
  // Add Products fot the Old Cart

  if (userCart) {
    // Update Quantity

    let productExist = false;
    for (const product of userCart.products) {
      if (productId == product.productId) {
        productExist = true;
        product.quantity = quantity;
      }
    }
    // Push New Product
    if (!productExist) {
      userCart.products.push({ productId, quantity });
    }
    // Calculate SubTotal
    let subTotal = 0;
    for (const product of userCart.products) {
      const productExist = await productModel.findById(product.productId);
      subTotal += productExist.priceAfterDiscount * product.quantity || 0;
    }
    // Update the Cart for New Products
    const newCart = await cartModel.findOneAndUpdate(
      { userId },
      { subTotal, products: userCart.products },
      { new: true }
    );
    return res
      .status(201)
      .json({ message: "Cart Updated Successfully", newCart });
  }

  // Create Cart for New User
  const cartObject = {
    userId,
    products: [{ productId, quantity }],
    subTotal: checkProduct.priceAfterDiscount * quantity,
  };
  const cartDb = await cartModel.create(cartObject);
  res.status(201).json({ message: "Cart Created Successfully", cartDb });
};

/******************** 2- Delete From Cart **************/

const deleteFromCart = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const { productId } = req.body;
  // Check Product
  const checkProduct = await productModel.findById(productId);
  if (!checkProduct) {
    return next(new Error("Invalid ProductId", { cause: 400 }));
  }

  const userCart = await cartModel.findOne({
    userId,
    "products.productId": productId,
  });

  if (!userCart) {
    return next(new Error("No ProductId in This Cart", { cause: 400 }));
  }
  userCart.products.forEach((ele) => {
    if (ele.productId == productId) {
      userCart.products.splice(userCart.products.indexOf(ele), 1);
    }
  });
  await userCart.save();
  res.status(201).json({ message: "Process Done", userCart });
};

export { addToCart, deleteFromCart };
