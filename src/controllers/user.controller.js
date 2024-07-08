import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
 

const registerUser = asyncHandler( async (req,res) => {
  
    const { fullName, email, username, password } = req.body
   
    if (
        [fullName, email, username, password ].some((field) => field?.trim()  === "")
    ) {
       throw new ApiError(400,"All fields are requied")
    }

    const avatarLocalPath = req.files?.avatar.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path; 

    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // again check for Avatar because it is important field
    if(!avatar) {
        throw new ApiError(400,"Avatar  is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url ||"",
        email,
        password,
        username: username.toLowerCase()
    })

  const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"   // -ve means ye nhi chaiye
  )

  if(!createdUser){  //agr created user nhi hai
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  )
  
} )


export { registerUser }