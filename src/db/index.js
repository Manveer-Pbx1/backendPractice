import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try{
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host }`); //learn about connectionInstance via console (Assignment)
    }catch(error){
        console.log("MONGODB connection ERROR: ", error);
        process.exit(1); //exit with failure , 1 means overload
    }
}

export default connectDB;