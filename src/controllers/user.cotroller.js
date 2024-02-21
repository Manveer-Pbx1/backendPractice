import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
const registerUser = asyncHandler(  async(req,res)=>{
   //how to register the user? --Problem
   //get user details from Frontend (getting data thru postman)
   //put validation (for email, username, and any other possible validations)
   //check if user already exists
        //how to check this? - thru username, or email.
    //is avatar present? 
    //upload avatar to cloudinary
        //has avatar been uploaded successfully?
    //create user object (since data is being sent to mongodb, a NOSQL database so it accepts only objects)
    //remove password and refresh token field from response
    //check for user creaton , if it has been created, return response

    //if data is coming from a form or a json file, it can be accessed using
    const {username, fullname, email, password} = req.body
    console.log("email: " , email); //go to postman and check if the data is being sent or not, go to body, then raw data
    // if(fullname === ""){
    //     //return error
    //     throw new apiError(400, "full name is required...")
    // }   
    //how pros do it
    if(
        [fullname, email, username, password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "all fields are compulsory!");
    }
    //new js methods, read a bit about them

    const existingUser = User.findOne({ //console.log existingUser to see what it returns
        //read about the operators
        $or: [
            {username}, {email}
        ]
    })
    if(existingUser)
    throw new ApiError(409, "user already exists");

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
    throw new ApiError(400, "avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar)
    throw new ApiError(400, "avatar is required");

    //till now everything has been validated, now we can create the user
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //user._id is added by mongodb
    const createdUser = await User.findById(user._id).select(
        //- mtlb nahi chahiye 
        "-password -refreshToken" //first field, second field, and so on

    )
    if(!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user X");
    //now user has been successfully created and we can send the response
    return res.status(201).json(
        //creating a new object because we don't want to send the password and refresh token
        new ApiResponse(200,createdUser, "User registered successfully!")    
    )


})

export {registerUser,}