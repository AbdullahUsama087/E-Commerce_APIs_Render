import connectionDB from "../../DB/connection.js";
import { globalResponse } from "./errorHandling.js";
import * as routers from "../Modules/index.routes.js";
import { changeCouponStatusCron } from "./crons.js";
import { createHandler } from "graphql-http/lib/use/express";
import { categorySchema } from "../Modules/Categories/GraphQL/categorySchema.js";
import cors from "cors";


const intiateApp = (app, express) => {
  const port = process.env.PORT;
  app.use(express.json());

  connectionDB();
  app.use(cors());

  app.use("/category", routers.categoryRouter);
  app.use("/subCategory", routers.subCategoryRouter);
  app.use("/brand", routers.brandRouter);
  app.use("/product", routers.productRouter);
  app.use("/coupon", routers.couponRouter);
  app.use("/auth", routers.authRouter);
  app.use("/cart", routers.cartRouter);
  app.use("/order", routers.orderRouter);
  app.use("/review", routers.reviewRouter);

  app.use("/graphQlCategory", createHandler({ schema: categorySchema }));

  app.all("*", (req, res, next) => {
    res.status(404).json({ message: "404 URL Not Found" });
  });

  app.use(globalResponse);

  changeCouponStatusCron();

  app.listen(port, () => {
    console.log(`Server Is Running .........${port}`);
  });
};

export default intiateApp;
