import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler( async (req,res) => {
  res.status(200).json({    // here 200 is http status code
        message: "Ok"
    })
} )


export { registerUser }