import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({token}) => {
  const navigate = useNavigate();
  const [list,setList] = useState([])
  
  const fetchList = async () => {
    try {
      
    const response = await axios.get(backendUrl + '/api/product/list')
    if (response.data.success) {
      setList(response.data.products);
    }
    else {
      toast.error(response.data.message)
    }
    
    } catch (error) {
      console.log(error)
      toast.error(error.message);
    }
  }

  const removeproduct = async (id) => {
    try {
      
    const response = await axios.post(backendUrl + '/api/product/remove', {id}, {headers:{token}})
    if(response.data.success){
      toast.success(response.data.message)
      await fetchList();
    }
    else {
     toast.error(response.data.message)
    }

    } catch (error) {
      console.log(error)
      toast.error(error.message);
    }
  } 

  const getStockDisplay = (inventory) => {
    if (!inventory || inventory.length === 0) return { text: "No Data", color: "text-gray-500" };
    const total = inventory.reduce((sum, item) => sum + item.quantity, 0);
    if (total === 0) return { text: "OUT OF STOCK", color: "text-red-500 font-bold" };
    if (total <= 5) return { text: `Low Stock (${total})`, color: "text-orange-500 font-bold" };
    return { text: total, color: "text-green-600" };
  }

  useEffect(() => {
    fetchList()
  },[])
  
  
  return (
    <>
      <p className='mb-2' >All products List</p>
      <div className='flex flex-col gap-2'>

        {/* --------------- List Table Title ----------------- */}
      <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm ' >
        <b>Image</b>
        <b>Name</b>
        <b>Category</b>
        <b>Price</b>
        <b>Stock</b>
        <b className='text-center'>Action</b>
      </div>

      {/* -------------- Product List --------------- */}
      {
        list.map((item,index) => (
          <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm ' key={index}>
            <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              {(() => {
                const stock = getStockDisplay(item.inventory);
                return <p className={`hidden md:block ${stock.color}`}>{stock.text}</p>;
              })()}
              <div className='flex justify-end md:justify-center gap-3 items-center'>
                <p onClick={() => navigate(`/edit/${item._id}`)} className='cursor-pointer text-blue-500 font-bold'>Edit</p>
                <p onClick={() => removeproduct(item._id)} className='cursor-pointer text-lg text-red-500 font-bold'>X</p>
              </div>
          </div>
        ))
      }
    
      </div>
    </>
  )
}

export default List
