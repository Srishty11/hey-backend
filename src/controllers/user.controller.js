import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
 

const generateAccessAndRefreshToken = async(userId) => 
    {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken  // refreshToken ko DB me save bhi kra diya
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken}   //accsessToken generate ho gya

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and accsess token")
        
    }
}

const registerUser = asyncHandler( async (req,res) => {
  
    const { fullName, email, username, password } = req.body
   
    if (
        [fullName, email, username, password ].some((field) => field?.trim()  === "")
    ) {
       throw new ApiError(400,"All fields are requied")
    }
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }
// console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path; 

     /*// Classic way to check path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0]
    } */


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

  if(!createdUser){  //agr createduser nhi hai
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  )

} )

const loginUser = asyncHandler(async (req, res) => {
//   req body -> data
//   username or email
//   password check
//   access and refresh token
// send cookie


const {email, username, password} = req.body

if(!(username || email)) {
    throw new ApiError(400,"username or email is required")
}

const user = await User.findOne({
    $or: [{username}, {email}]
})

if(!user){
    throw new ApiError(404, "User does not exist")
}

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentail")
}

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

 const loggedInUser = User.findById(user._id).select("-password -refreshToken")   //optional step
   
//  cookie
const options = {
    httpOnly: true,  //only modify by servers not frontend
    secure
}
return res
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    )
)


})

const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,  //only modify by servers not frontend
        secure
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


export { 
      registerUser,
    loginUser }
