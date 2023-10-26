import { nanoid } from "nanoid";
import userModel from "../../../DB/Models/user.model.js";
import sendEmailService from "../../Services/sendEmailService.js";
import emailTemplate from "../../Utils/emailTemplate.js";
import { generateToken, verifyToken } from "../../Utils/tokenFunctions.js";
import pkg from "bcrypt";

/******************************* 1- Sign Up *******************/

const signUp = async (req, res, next) => {
  const { userName, email, password, phoneNumber, address, age, gender } =
    req.body;

  //Check is Email Duplicated
  const isEmailExist = await userModel.findOne({ email });
  if (isEmailExist) {
    return next(
      new Error("This email is already exist, please Choose another one", {
        cause: 400,
      })
    );
  }

  ///*********** Token ***********/
  const token = generateToken({
    payload: { email },
    signature: process.env.CONFIRM_EMAIL_TOKEN,
    expiresIn: "1h",
  });

  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`;

  const isEmailSent = sendEmailService({
    to: email,
    subject: "Confirmation Email",
    message: emailTemplate({
      link: confirmationLink,
      linkData: "Click here to Confirm",
      subject: "Confirmation Email",
    }),
  });
  if (!isEmailSent) {
    return next(new Error("Fail to send Confirmation Email", { cause: 400 }));
  }

  const userInstance = new userModel({
    userName,
    email,
    password,
    phoneNumber,
    address,
    age,
    gender,
  });

  const userDb = await userInstance.save();
  res.status(201).json({ message: "User Created Successfully", userDb });
};

/***************************** 2- Confirm Email ************/

const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decodedData = verifyToken({
    token,
    signature: process.env.CONFIRM_EMAIL_TOKEN,
  });
  const userToken = await userModel.findOneAndUpdate(
    { email: decodedData?.email, isConfirmed: false },
    { isConfirmed: true },
    { new: true }
  );
  if (!userToken) {
    return next(new Error("Already Confirmed", { cause: 400 }));
  }
  res.status(200).json({ message: "Email Confirmed Successfully" });
};

/***************************** 3- Sign In ************/

const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  //Check on User
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Invalid Login Credentials", { cause: 400 }));
  }
  //Check is Password matchs the Password on DB
  const isPassMatch = pkg.compareSync(password, user.password);
  // console.log(isPassMatch);
  if (!isPassMatch) {
    return next(new Error("Wrong Password", { cause: 400 }));
  }

  const token = generateToken({
    payload: { email, _id: user._id, role: user.role },
    signature: process.env.SIGN_IN_TOKEN,
    expiresIn: "1h",
  });

  const userUpdated = await userModel.findOneAndUpdate(
    { email },
    { token, status: "Online" },
    { new: true }
  );

  res.status(201).json({ message: "Login Done", userUpdated });
};

/***************************** 4- Forget Password ************/

const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Invalid Email", { cause: 400 }));
  }
  const code = nanoid();
  const hashedCode = pkg.hashSync(code, +process.env.SALT_ROUNDS);
  const token = generateToken({
    payload: { email, resetCode: hashedCode },
    signature: process.env.RESET_TOKEN,
    expiresIn: "1h",
  });
  console.log(token);
  const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/reset/${token}`;

  const isEmailSent = sendEmailService({
    to: email,
    subject: "Reset Password",
    message: emailTemplate({
      link: resetPasswordLink,
      linkData: "Click to Reset your Password",
      subject: "Reset Password",
    }),
  });

  if (!isEmailSent) {
    return next(new Error("Fail to send Reset Password", { cause: 400 }));
  }

  const userUpdated = await userModel.findOneAndUpdate(
    { email },
    { forgetCode: hashedCode },
    { new: true }
  );

  res.status(201).json({ message: "Process Done!", userUpdated });
};

/***************************** 5- Reset Password ************/

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  // console.log(token);
  // console.log(process.env.RESET_TOKEN);
  const decodedData = verifyToken({
    token,
    signature: process.env.RESET_TOKEN,
  });
  // console.log(decodedData?.email, decodedData.resetCode);
  const user = await userModel.findOne({
    email: decodedData?.email,
    forgetCode: decodedData.resetCode,
  });
  console.log(user);
  if (!user) {
    return next(new Error("You already reset your password", { cause: 400 }));
  }

  const { newPassword } = req.body;

  const isPassMatch = pkg.compareSync(newPassword, user.password);
  // console.log(isPassMatch);
  if (isPassMatch) {
    return next(
      new Error("You entered the old password please write a new one", {
        cause: 400,
      })
    );
  }
  user.password = newPassword;
  user.forgetCode = null;

  const passUpdated = await user.save();

  res
    .status(200)
    .json({ message: "Password Updated Successfully", passUpdated });
};

export { signUp, confirmEmail, signIn, forgetPassword, resetPassword };
