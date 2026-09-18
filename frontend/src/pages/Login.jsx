import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
const Login = () => {

  const [currentState, setCurrentState] = useState('Login');
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext)
  
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Lazy import Firebase to avoid blocking initial render if not used immediately
      const { auth } = await import('../config/firebase.js');
      const { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      
      if (currentState === 'Sign Up' ) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // The token will be automatically set by ShopContext's onAuthStateChanged listener
        toast.success("Registration successful!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // The token will be automatically set by ShopContext's onAuthStateChanged listener
        toast.success("Login successful!");
      }

    } catch (error) {
      console.log(error);
      // Handle Firebase specific error codes gracefully if needed, or just display message
      toast.error(error.message.replace('Firebase: ', ''));
    }
  }


  useEffect(() => {
    if(token) {
      navigate('/')
    }
  },[token])

  return (
    <form  onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96  m-auto mt-14 gap-4 text-gray-800'>
       <div className='inline-flex items-center gap-2 mb-2 mt-10'>
         <p className='prata-regular text-3xl' >{currentState}</p>
         <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
       </div>
        
        {currentState === 'Login' ? '' : <input onChange={(e) => setName(e.target.value)} value={name} type='text'  className='w-full px-3 py-2  border border-gray-800' placeholder='Name' required /> } 
       <input  onChange={(e) => setEmail(e.target.value)} value={email} type='email'  className='w-full px-3 py-2  border border-gray-800' placeholder='Email' required/>
       <input  onChange={(e) => setPassword(e.target.value)} value={password} type='password'  className='w-full px-3 py-2  border border-gray-800' placeholder='Password' required />
       <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer' >Forget Your Password?</p>
        {
          currentState === 'Login' 
          ? <p onClick={() => setCurrentState('Sign Up')}  className='cursor-pointer' >Create Account</p>
          : <p onClick={() => setCurrentState('Login')}  className='cursor-pointer' >Login Here</p>
        }
       </div>
       <button className='bg-black text-white font-light px-8 py-2 mt-4' >{currentState === 'Login'  ?  'Sign In': 'Sign Up'}</button>
    </form>
  )
}

export default Login
