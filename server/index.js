import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"//used to control cross origin http req
import http from "http"
import mongoose from "mongoose"
import "dotenv/config"
import exp from "constants"
import router from "./src/routes/index.js"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use("/api/v1",router);
const port = process.env.PORT || 5000

const server = http.createServer(app)
// console.log(process.env);
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Mongo DB Connected")
    server.listen(port , ()=>{
        console.log("server is listening on port :",port);
    });
}).catch((err)=>{
    console.log({err});
    process.exit(1);
})