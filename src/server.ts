import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("MongoDB connection secceed");
      const PORT = process.env.PORT ?? 5500;
  })
  .catch((err) => console.log("Error on connection MongoDB", err));
