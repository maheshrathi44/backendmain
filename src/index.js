import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import { app } from "./app.js";   // ✅ IMPORTANT

connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at PORT ${process.env.PORT || 8000}`);
  });
})
.catch((error) => {
  console.log("MONGODB failed to connect", error);
});

