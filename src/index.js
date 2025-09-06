// require('dotenv').config({path: './env'})

// import dotenv
import dotenv from "dotenv";
dotenv.config();  // <-- no path unless you renamed file to env

import connectDB from "./db/index.js";

connectDB();


// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Error::",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listen on port ${process.env.PORT}`);
//         })
//     }
//     catch{
//         console.error("ERROR",error)
//         throw error
//     }
// })()