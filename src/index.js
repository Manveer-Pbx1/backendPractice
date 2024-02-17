//require("dotenv").config(); this is inconsistent as we're using import at other places

import dotenv from "dotenv"
import connectDB from "./db/index.js"
import express from "express"
const app = express();
dotenv.config({
    path: './env'
});

connectDB() //just called the function that connects the database into the main file
.then(()=>{
app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
app.on("error", (error)=>{
    console.log("ERROR: ", error);
    process.exit(1);
})
})
.catch((error)=>{
    console.log("MONGODB connection FAILED", error);
    process.exit(1);
})












//FIRST APPROACH:
// import express from "express"
// const app = express();  
// (async ()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error)=>{
//             console.log('ERROR: ', error);
//             throw error;
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     } catch(error){
//         console.log("ERROR:", error);
//         throw error;
//     }
// })()