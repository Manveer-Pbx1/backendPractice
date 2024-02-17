//Production grade kaam, create a wrapper function that'll be used everywhere

// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req,res,next)
//     } catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message || "Internal Server Error"
//     })
//   }
// }

//with promises
const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
  };

export {asyncHandler}