import React, { useEffect } from 'react'
import {Routes, Route} from "react-router-dom"
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SignUp from './pages/SignUp'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Login from './pages/Login'
import { useAuthStore } from './store/useAuthStore'
import {useThemeStore} from './store/useThemeStore.js'
import {Loader} from "lucide-react"
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
const App = () => {
  const {authUser,checkAuth,isCheckingAuth, onlineUsers} = useAuthStore() //destructuring state

  const{theme}=useThemeStore()
  useEffect(()=>{
    checkAuth()
  },[checkAuth])

  if(isCheckingAuth && !authUser) return(
    <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin'/>
    </div>
  )
  return (
    <div data-theme={theme} >
      <Navbar/>

      <Routes>
        <Route path="/" element = { authUser?<HomePage/>:<Navigate to ="/login"/>}/>
        <Route path="/signup" element = {!authUser?<SignUp/>:<Navigate to ="/"/>}/>
        <Route path="/login" element = {!authUser?<Login/>:<Navigate to ="/"/>}/>
        <Route path="/settings" element = {authUser?<Settings/>:<Navigate to ="/login"/>}/>
        <Route path="/profile" element = {authUser?<Profile/>:<Navigate to ="/login"/>}/>
      </Routes>

      <Toaster/>
    </div>
  )
}

export default App
