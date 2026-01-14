
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIerror.js";

import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";

import path from "path";




// REGISTER USER //

const registerUser = asyncHandler(async (req, res) => {
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
    const { fullName, email, username, password } = req.body
    // console.log("email:",email)

    // console.log("avatar file object:", req.files?.avatar);

    //STEP 2: validation
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required");
    }
    // console.log("FILES =>", req.files);

    //STEP 3: Check if user exists already
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist ")
    }
    //we can also do it separate for username or email by making findOne function for existeduser by 1 username or email only

    //STEP 4: CHECK IMAGES,AVATAR
    // console.log(req.files)
    const avatarLocalpath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // console.log("REQ.FILES:", req.files);
    // console.log("AVATAR PATH:", avatarLocalpath);

    //STEP 5:UPLOAD FILES ON CLOUDINARY
    const avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file uplaod failed on cloudinary")
    }

    //STEP 6:cretae object and make entry in Database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //becuase coverimage wasnt checked 
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
    if (!createrUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    //STEP 9:Return response
    return res.status(201).json(
        new ApiResponse(200, createrUser, "User registered successfully")
    )


})

// LOGIN A USER //

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //add refresh token in database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    //req body ->data (take data form req.body)
    //username or email (can login through both)
    //find the user with that credentials
    //if user exists check password
    //if password matches generate access and refresh token 
    //send these tokens as cookies and response for successfull algorithm

    //STEP1:
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "USername or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
        //finds a value either with that that username or email
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    //check password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password does not match,Invalid User Credentials")
    }

    //generate acc tokens and refrsh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //this user will contain proper details with refresh token as well
    
    //send this in cookies
    const options = {
        httpOnly: true,  
        secure: true //cookies can only be modified through server only not frontend
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )

})


//  LOGOUT A USER  //

const logoutUser = asyncHandler (async (req,res) => {
    //using middleware authorization(verifyJWT) before logoutUser in user.routes we can use req.user to check is user login or not rn
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            },
        },
        {
            new: true //take new upadated value where refreshtoken is undefined
        }
    )
    const options = {
        httpOnly: true,  
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json (new ApiResponse(200, {}, "User looged Out "))

})


export {
    registerUser,
    loginUser,
    logoutUser
}