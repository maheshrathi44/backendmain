import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import { app } from "./app.js";   // 🔥 YE LINE MISSING THI

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server running at port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("MongoDB connection failed", error);
});
