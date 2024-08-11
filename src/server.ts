import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("MongoDB connection secceed");
    const PORT = process.env.PORT ?? 5500;
    app.listen(PORT, function () {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Error on connection MongoDB", err));
