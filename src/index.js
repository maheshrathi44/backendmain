// require('dotenv').config({path: './env'})

// import dotenv
import dotenv from "dotenv";
dotenv.config();  // <-- no path unless you renamed file to env

import connectDB from "./db/index.js";

connectDB()
.then(()=>{
  app.listen(process.env.PORT||8000,()=>{
     console.log(`Server is ruuning at PORT${process.env.PORT}`)
  })
})
.catch((error)=>{
  console.log("MONGODB failed to connect",error);
})

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