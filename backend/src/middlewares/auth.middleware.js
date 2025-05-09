import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log('Auth middleware - Token:', token);
        
        if (!token) {
            console.log('Auth middleware - No token found');
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log('Auth middleware - Decoded token:', decodedToken);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        console.log('Auth middleware - Found user:', user);
    
        if (!user) {
            console.log('Auth middleware - User not found');
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        console.log('Auth middleware - User attached to request:', req.user);
        next()
    } catch (error) {
        console.error('Auth middleware - Error:', error);
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})