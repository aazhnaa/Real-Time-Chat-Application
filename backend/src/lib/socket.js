import {Server} from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:['http://localhost:5173']         
    }
});
//helper func : return the socket id when we pass user id
export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

//to store online users : 
const userSocketMap = {}

io.on("connection", (socket)=>{
    console.log("A user is connected :", socket.id )
    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id

    //used to send events to all the connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    socket.on("disconnect", ()=>{
        console.log("A user is disconnected ", socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

export {io,server,app}