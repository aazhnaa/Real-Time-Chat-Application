import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import { getReceiverSocketId , io} from "../lib/socket.js";
export const sidebarUsers=async(req,res)=>{
    // fetch all users except ourselves, we dont want to talk to ourselves
    try {
        const loggedInId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne:loggedInId}}).select("-password")
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in sidebarUsers controller : ", err.message)
        res.status(500).json({message:"internal server error"})        
    }
}
export const getMessages = async(req,res)=>{
    try {
        const myId = req.user._id //us!
        const {id:userToChatId} = req.params//with whom we talking
        
        const messages = await Message.find({
            $or:[
                {myId:myId, receiverId:userToChatId},
                {myId:userToChatId, receiverId:myId }
            ]})

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in get messages controller : ", err.message)
        res.status(500).json({message:"internal server error"})       
    }
}
export const sendMessages= async(req,res)=>{
    try {
        const {id:receiverId} = req.params
        const {text, image} = req.body
        const myId = req.user._id

        let imageUrl;
        if(image){
            const uploadImage = await cloudinary.uploader.upload(image)
            imageUrl=uploadImage.secure_url
        }

        //creating the message : 
        const newMessage = new Message({
            senderId:myId,
            receiverId,
            text,
            image:imageUrl
        })

        await newMessage.save()

        //for real time we need socket.io
        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage) //we only broadcast to receiver, hence we use to()
        }
        res.status(201).json(newMessage)     
    } catch (error) {
        console.log("Error in get messages controller : ", error)
        res.status(500).json({message:"internal server error"})           
    }
}