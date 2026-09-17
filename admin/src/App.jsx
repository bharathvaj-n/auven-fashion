import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Edit from './pages/Edit'
import DesignLibrary from './pages/DesignLibrary'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Coupons from './pages/Coupons'
import HomepageContent from './pages/HomepageContent'
import CustomerDetails from './pages/CustomerDetails'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';

export const backendUrl = import.meta.env.VITE_BACKEND_URL

export const currency = 'Rs '

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');

  useEffect(() => {
   localStorage.setItem('token', token)
  },[token])

  return (

    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
    
    { token === ""
    ? <Login setToken={setToken}/>
    :
    <>
    <Navbar setToken={setToken} />
    <hr />
      <div className='flex w-full'>
          <Sidebar/>
        <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
          <Routes>
            <Route path='/' element={<Navigate to='/dashboard' /> } />
            <Route path='/dashboard' element={<Dashboard token={token} /> } />
            <Route path='/add' element={<Add token={token} /> } />
            <Route path='/list' element={<List token={token} /> } />
            <Route path='/orders' element={<Orders token={token} /> } />
            <Route path='/customers' element={<Customers token={token} /> } />
            <Route path='/customers/:id' element={<CustomerDetails token={token} /> } />
            <Route path='/coupons' element={<Coupons token={token} /> } />
            <Route path='/homepage-content' element={<HomepageContent token={token} /> } />
            <Route path='/edit/:id' element={<Edit token={token} /> } />
            <Route path='/design-library' element={<DesignLibrary token={token} /> } />
          </Routes>
        </div>
      </div>
    </> 
    }
    </div>
  )
}

export default App
