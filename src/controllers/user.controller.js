import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const access = user.generateAccessToken();
        const refresh = user.generateRefreshToken();

        user.refreshToken = refresh;
        await user.save({validateBeforeSave: false})

        return {access, refresh};
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}
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

    const existingUser = await User.findOne({ //console.log existingUser to see what it returns
        //read about the operators
        $or: [
            {username}, {email}
        ]
    })
    if(existingUser)
    throw new ApiError(409, "user already exists");
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

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
const loginUser = asyncHandler(async(req,res)=>{
    //req body-> data
    const {email,username,password} = req.body
    //username or email for login
    if(!(username || email)){
        throw new ApiError(400, "Username or Email is required");
    }
    //find the user 
   const user  = await User.findOne({
        $or:  [{username}, {email}] //mongodb operator or (study about it)
    })
    if(!user){
        throw new ApiError(404, "User does not exist");
    }
    //password check ? access and refresh token  : error
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }
    const { access, refresh } = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")
    //send cookie
    const options = {
        httpOnly: true,
        secure: true
        //now cookies can't be modified from frontend
    }
    return res.status(200).cookie("accessToken", access, options)
    .cookie("refreshToken", refresh, options).json(
        new ApiResponse(
            200, 
            {
                user: loggedinUser, access, refresh
            },
            "User logged in successfully!!")
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
        //now cookies can't be modified from frontend
    }
        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, undefined, "User logged out successfully!!"));
    })

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const {access, newrefresh} = await generateAccessAndRefreshToken(user._id)
        return res.status(200).cookie("accessToken", access, options).cookie("refreshToken", newrefresh, options).json(new ApiResponse(200,{access, refreshToken: newrefresh}, "Access token refreshed successfully!!"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }
    
    user.password = newPassword;
    await user.save({validateBeforeSave: false})
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully!!"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body
    
    if(!(fullName || email)){
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res.status(200)
    .json(new ApiResponse(200, user, "Account Details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
})
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverLocalPath = req.file?.path
    if(!coverLocalPath){
        throw new ApiError(400, "Image is required")
    }
    const coverImage = await uploadOnCloudinary(coverLocalPath)
        if(!coverImage.url){
            throw new ApiError(400, "Error while uploading Image")
        }

       const user =  await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    coverImage: coverImage.url
                }
            },
            {new: true}
        ).select("-password")
        return res.status(200).json(new ApiResponse(200, user, "Cover Image updated successfully"));
    })

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};
