import { ApiError } from "../utils/APIerror.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"



// verifyJWT checks login, verifies token, fetches user, and attaches the user to the request.

// If yes → request continues
// If no → request is stopped with 401 Unauthorized

export const verifyJWT = asyncHandler(async( req,res,next) =>{
    try {
        //catch those tokens form either browser as cookies or from moile/postman as bearer token
        const token = req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorised request")
        }
    
        //verify those tokens using jwt
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)


        // check the user that token is stating still exist in db or not 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError (401,"Invalid Acess Token")
        }


        // Attach user to request
        req.user = user
        //Now every next controller can do:
        // req.user._id
        // req.user.email


        // next process after middleware continues 
        next()

    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Acess Token")
    }

}) 

