import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { connectDB } from "./DB/connect";
import router from "./routes/route";
import cookieParser from "cookie-parser";
import errorHandlerMiddleware from "./middleware/error-handler";
import cron from "node-cron";
// import sendMails from "./controllers/nodemailer";

const PORT = process.env.PORT || 3000;

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", router);
app.use(errorHandlerMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const start = async () => {
  try {
    // connectDB
    await connectDB(process.env.MONGO_URL || "");
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server is listening port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
