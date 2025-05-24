import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import path from 'path'
dotenv.config()
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import {connectDb} from './lib/db.js'
import {app,server,io} from './lib/socket.js'

const __dirname = path.resolve()
const PORT = process.env.PORT || 3000
server.listen (PORT, ()=>{
    console.log(`server is running on PORT ${PORT}`)
    connectDb()
})
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true //allow cookies headers tp be sent with requests
}))
app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

