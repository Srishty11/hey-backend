// Approach 1st - promises
 const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))
    }
 }


export {asyncHandler}



// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


    /*Approach 2nd
const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req, res, next)
        
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
        
    }
}
     */