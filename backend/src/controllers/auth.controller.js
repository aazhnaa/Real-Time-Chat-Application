import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'

export const signup=async(req,res)=>{
    const {email, fullName, password} = req.body
    try{
        if(!email || !password || !fullName){
            return res.status(400).json({message:"all fields must be filled!"})
        }
        if(password.length < 6){
            return res.status(400).json({message : "Password must be of at least 6 characters"})
        }
         const user = await User.findOne({email})

        if(user){
            return res.status(400).json({message:"This email already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(password,salt)

        const newUser = new User({
            email,
            fullName,
            password : hashPass
        })

        if(newUser){
            //generate token :
            generateToken(newUser._id,res)
            await newUser.save()

            res.status(201).json({
                _id : newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic : newUser.profilePic
            })
        }
        else{
            res.status(400).json({message:"invalid user data"})
        }

    }
    catch (err){
        console.log("Error in signup controller : ", err.message)
        res.status(400).json({message:"internal server error"})
    }
}

export const login =async(req,res)=>{
    const {email, fullName, password} = req.body
    try{
        const user =await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        //now we need to get the hashed password from db and compare it with entered passwd
        const isPassCorrect = await bcrypt.compare(password, user.password)

        if(!isPassCorrect){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        generateToken(user._id,res)

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        }
        )
    }
    catch(err){
        console.log("Error in login controller : ", err.message)
        res.status(400).json({message:"internal server error"})
    }
}

export const logout =(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged Out Successfuuly"})
    } catch (error) {
        console.log("Error in logout controller :", error)
        res.status(400).json({message:"Internal server error"})
    }
}

export const updateProfile=async(req,res)=>{
    try {
        const {profilePic} = req.body
        const userId = req.user._id

        if(!profilePic){
            return res.status(400).json({message : "profile picture is required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findOneAndUpdate(userId, {profilePic:uploadResponse.secure_url},{new:true})

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("error in update profile controller : ",error)
        res.status(500).json({message:"internal server error"})
    }
}

// will return the authenticated user
export const checkAuth =(req,res)=>{
     try {
        res.status(200).json(req.user)
     } catch (error) {
        console.log("error in checkAuth controller ", error.message)
        res.status(500).json({message:"internal server error"})
     }
}