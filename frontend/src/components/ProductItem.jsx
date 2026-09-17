import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link, useNavigate } from 'react-router-dom'
const ProductItem = ({id, image, name, price, showCustomize}) => {

    const { currency } = useContext(ShopContext);
    const navigate = useNavigate();
 
    return (
    <div className='text-gray-700 relative group flex flex-col h-full'>
      <Link to={`/product/${id}`} className='cursor-pointer flex-1 flex flex-col'>
        <div className='overflow-hidden' >
          <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
        </div>
        <p className='pt-3 pb-1 text-sm'>{name}</p>
        <p className='text-sm font-medium mb-2'>{currency}{price}</p> 
      </Link>

      {showCustomize && (
        <div className='mt-auto flex flex-col gap-2'>
           <Link 
               to={`/product/${id}`}
               className='w-full text-center text-sm py-2 border border-black bg-black text-white hover:bg-gray-800 transition-colors' 
           >
               VIEW PRODUCT
           </Link>
           <button 
               onClick={() => navigate('/customizer')}
               className='w-full text-center text-sm py-2 border border-gray-300 bg-white text-black hover:bg-gray-50 transition-colors'
               aria-label='Customize this T-shirt'
           >
               CUSTOMIZE
           </button>
        </div>
      )}
    </div>
  )
}

export default ProductItem
