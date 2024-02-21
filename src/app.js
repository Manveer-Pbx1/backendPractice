import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    orgin: process.env.CORS_ORIGIN,
    credentials: true

}))

app.use(express.json({limit: "15kb"})) //before we had to use body-parser to parse the body of the request, but now it's included in express
app.use(express.urlencoded({extended: true, limit:"15kb"})) // %20 means space OR + means space, etc..
app.use(express.static("public")) //to serve static files and images
app.use(cookieParser())


//importing routes
import userRouter from "./routes/user.route.js"

//declaring routes
app.use("/api/v1/users", userRouter); //this is a middleware that will handle all the routes that start with /users
// we used .use instead of .get, .post, etc.. because we want to use the userRouter for all the routes that start with /users
// the url will look like this: http://localhost:3000/api/v1/users/register or /login 



export {app}
