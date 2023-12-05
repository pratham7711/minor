import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"//used to control cross origin http req
import http from "http"
import mongoose from "mongoose"
import "dotenv/config"
import router from "./src/routes/index.js"
import { Server } from "socket.io";

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/api/v1", router);
const port = process.env.PORT || 5000


const start = async () => {
    try {
        const server = http.createServer(app)
        mongoose.connect(process.env.MONGO_URL).then(() => {
            console.log("Mongo DB Connected")
            server.listen(port, () => {
                console.log("server is listening on port :", port);
            });
        });

        const io = new Server(server, {
            cors: {
                origin: '*',
                credentials: true,
            }
        });

        global.onlineUsers = new Map();;
        io.on("connection", (socket) => {
            global.chatsocket = socket;
            socket.on("addUser", (id) => {
                onlineUsers.set(id, socket.id);
            })

            socket.on("send-msg", (data) => {
                const sendUserSocket = onlineUsers.get(data.to);
                if (sendUserSocket) {
                    socket.to(sendUserSocket).emit("msg-recieve", data.message);
                }
            })
        })

    } catch (error) {
        console.log({ error });
        process.exit(1);
    }
}

start();
