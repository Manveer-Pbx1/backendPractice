//Recommended practice for connecting database- create a separate file for database connection
// and import it in the main file (index.js) of the application. 
//This will help in keeping the code clean and easy to understand. 
//Also, if you want to change the database, you will have to change the connection details in only one file.
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