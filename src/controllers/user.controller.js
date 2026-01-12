
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIerror.js";

import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation of details- not empty
    // check if user already exist: username,email
    // check images,check avatar
    // upload them to cloudinary,check avatar
    // create user object- create entry in db
    // remove password and refresh token field from response from response
    // check for user creation
    // return response 


    //STEP 1: TAKE DETAILS
    const {fullName,email,username,password}=req.body
    console.log("email:",email)

    //STEP 2: validation
    if(
        [fullName,email,username,password].some((field)=>
            field?.trim()=== "" )
    ){
        throw new ApiError(400,"All field are required");
    }

    //STEP 3: Check if user exists already
    const existedUser=User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist ")
    }
    //we can also do it separate for username or email by making findOne function for existeduser by 1 username or email only

    //STEP 4: CHECK IMAGES,AVATAR
    const avatarLocalpath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalpath){
        throw new ApiError(400,"Avatar file is required")
    }

    //STEP 5:UPLOAD FILES ON CLOUDINARY
    const avatar=await uploadOnCloudinary(avatarLocalpath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //STEP 6:cretae object and make entry in Database
    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url||"", //becuase coverimage wasnt checked 
        email,
        password,
        username: username.toLowerCase()
    })

    //AWAIT IS ONLY USED INSIDE ASYNC FUNCTION IN ORDER TO STOP OTHER CODE INSIDE ASYNC FUNCTION BEFORE IT RESOLVES BUT ALLOWING OTHER CODE OUTSIDE ASYNC FUNCTION CONTINUES


    //STEP 7:  this want allow pas and refesh toke in response
    const createrUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    //STEP 8: Check for user creation
    if(!createrUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }

    //STEP 9:Return response
    return res.status(201).json(
        new ApiResponse(200,createrUser,"User registered successfully")
    )

    



    

})

export {registerUser}

