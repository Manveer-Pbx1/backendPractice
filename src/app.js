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


export {app}
