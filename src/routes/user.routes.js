import { Router } from "express"
import { loginUser, registerUser,logoutUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; 

const router = Router()

router.route("/register").post(     //middleware injectd just before registerUser
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }

    ]),
    registerUser)

    router.route("/login").post(loginUser)

    // secured routes
    router.route("/logout").post(verifyJWT, logoutUser)   // that why we write next
    router.route("/refresh-token").post(refreshAccessToken)


export default router