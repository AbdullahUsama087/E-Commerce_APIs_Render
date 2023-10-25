import mongoose from "mongoose";

const connectionDB = async () => {
  return await mongoose
    .connect(process.env.CLOUD_CONNECTION_URL)
    .then((res) => console.log("Data Base Connection Success"))
    .catch((err) => console.log("Fail To Connect DB", err));
};

export default connectionDB;