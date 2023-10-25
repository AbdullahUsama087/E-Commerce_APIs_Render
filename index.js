import express from "express";
import path from "path";
import { config } from "dotenv";
import intiateApp from "./Src/Utils/intiateApp.js";

config({ path: path.resolve("./Config/config.env") });

const app = express();

intiateApp(app, express);