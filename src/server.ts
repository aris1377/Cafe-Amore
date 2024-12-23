import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import server from "./app";



mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 5500;
    server.listen(PORT, function () {
      console.log(`Server is running on port ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin\n`);
    });
  })
  .catch((err) => console.log("Error on connection MongoDB", err));
