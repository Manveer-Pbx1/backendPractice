import { v2 as cloudinary } from "cloudinary";
import fs from "fs" // Node.js 'file system' module,  comes with Node.js, no need to install it
//we require the file's path
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath){
            return null;
        }
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // read documentation to know more about this
        })  
        //file has been uploaded successfully
        // console.log("File uploaded successfully", response.url);
        fs.unlinkSync(localFilePath);       
        return response;
    } catch(error){
        fs.unlinkSync(localFilePath) // delete the file from the local storage, sync means 
        //it will be deleted before the next line of code is executed

    }
}

cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });

  export  {uploadOnCloudinary}