import {create} from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast"
import {io} from 'socket.io-client'

const BASE_URL =import.meta.env.MODE === "development"? 'http://localhost:8000':"/api"
export const useAuthStore = create((set,get)=>({
    //following states we will be using : 
    authUser:null, //initially we don't know whether user is authenticated or not
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,//as soon as we refresh our page we will start to check if user is authorized or not
    onlineUsers : [],
    socket : null,


     checkAuth:async()=>{
        try {
            const res = await axiosInstance.get("/auth/check")
            set({authUser:res.data})
            get().connectSocket()
        } 
        catch (error) {
            console.log("error in checkAuth useAuthStore : ",error)
            set({authUser:null})
        }
        finally{
            set({isCheckingAuth:false})
        }
     },
     signup:async(data)=>{
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            toast.success("Account created successfully!")
            get().connectSocket()
            set({authUser:res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isCheckingAuth:false})
        }
     },
     login:async(data)=>{
        try {
            const res = await axiosInstance.post("/auth/login",data)
            toast.success("Logged in successfully!")
            get().connectSocket()
            set({authUser:res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isCheckingAuth:false})
        }
     },
     logout:async()=>{
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser:null})
            toast.success("Loggout out successfully!")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isCheckingAuth:false})
        }
     },
     updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updateProfile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
     },

     connectSocket:()=>{
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return ;
        const socket = io(BASE_URL,{
            query:{
                userId:authUser._id
            },
        })
        socket.connect()
        
        set({socket:socket })

        //listen for online users :
        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers:userIds})
        })
     },
     disconnectSocket:()=>{
        if(get().socket?.connected) get().socket.disconnect()
     },
}))