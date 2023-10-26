// import jwt from "jsonwebtoken";
import userModel from "../../DB/Models/user.model.js";
import { generateToken, verifyToken } from "../Utils/tokenFunctions.js";

const isAuth = (roles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return next(new Error("Please Login First", { cause: 400 }));
      }
      if (!authorization.startsWith(process.env.TOKEN_PERFIX)) {
        return next(new Error("Invalid Token Perfix", { cause: 400 }));
      }
      const splitedToken = authorization.split(" ")[1];

      try {
        // const decodedData = jwt.verify(splitedToken, process.env.SIGN_IN_TOKEN);
        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.SIGN_IN_TOKEN,
        });
        // if (!decodedData || decodedData.id) {
        //   return next(new Error("Invalid Token", { cause: 400 }));
        // }
        const findUser = await userModel.findById(
          decodedData._id,
          "email userName role"
        );
        if (!findUser) {
          return next(new Error("Please SignUp", { cause: 400 }));
        }
        /**************************** Authorization *****************/
        if (!roles.includes(findUser.role)) {
          return next(
            new Error("Unauthorized to access this API", { cause: 401 })
          );
        }

        req.authUser = findUser;
        next();
      } catch (error) {
        if (error == "TokenExpiredError: jwt expired") {
          // Refresh Token
          const user = await userModel.findOne({ token: splitedToken });
          if (!user) {
            return next(new Error("Wrong Token", { cause: 400 }));
          }
          // Generate new Token to Refresh
          const userToken = generateToken({
            payload: { email: user.email, _id: user._id },
            signature: process.env.SIGN_IN_TOKEN,
            expiresIn: "1h",
          });
          if (!userToken) {
            return next(
              new Error("Generation of Token Failed", { cause: 400 })
            );
          }
          // const userToken = jwt.sign(
          //   { email: user.email, id: user._id },
          //   process.env.SIGN_IN_TOKEN,
          //   { expiresIn: "1h" }
          // );

          // Update the old token to the new one
          await userModel.findOneAndUpdate(
            { token: splitedToken },
            { token: userToken }
          );

          // user.token = userToken;
          // await user.save();  **Save not allowed here because HOOKS
          return res.status(200).json({
            message: "Token Refreshed Successfully",
            userToken,
          });
        }
        return next(new Error("Invalid Token", { cause: 500 }));
      }
    } catch (error) {
      console.log(error);
      next(new Error("Catch Error in Authorization", { cause: 500 }));
    }
  };
};

export default isAuth;
