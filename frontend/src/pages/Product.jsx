import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const fetchProductData = async () => {
     let found = false;
     products.map((item) => {
      if(item._id === productId){
        setProductData(item);
        setImage(item.image[0]);
        found = true;
        return null;
      }
     });
     if (!found && products.length > 0) {
       setProductData(null);
     }
  }

  useEffect(() => {
   fetchProductData();
  }, [productId, products])

  const hasInventory = productData && Array.isArray(productData.inventory);
  
  const getStockForSize = (sizeName) => {
    if (!hasInventory) return 0;
    const inv = productData.inventory.find(i => i.size === sizeName);
    return inv ? inv.quantity : 0;
  }
  
  const currentStock = size ? getStockForSize(size) : 0;
  const maxQty = hasInventory ? Math.min(10, currentStock) : 0;

  const handleQuantityChange = (delta) => {
    if (!size) return toast.error("Please select a size first.");
    setQuantity(prev => {
      const newVal = prev + delta;
      return newVal >= 1 && newVal <= maxQty ? newVal : prev;
    });
  };

  const handleManualQuantity = (e) => {
    if (!size) return;
    const val = e.target.value;
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    if (num < 1) {
      setQuantity(1);
    } else if (num > maxQty) {
      setQuantity(maxQty);
    } else {
      setQuantity(num);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === '' || isNaN(quantity) || quantity < 1) {
      setQuantity(1);
    } else if (size && quantity > maxQty) {
      setQuantity(maxQty);
    }
  };

  const handleAddToCart = () => {
    if (!productData) {
      return toast.error("Product not loaded yet.");
    }
    if (!hasInventory || productData.inventory.length === 0) {
      return toast.error("Stock information is unavailable.");
    }
    if (!productData.sizes || productData.sizes.length === 0) {
      return toast.error("Size selection is currently unavailable.");
    }
    if (!size) {
      return toast.error("Please select a size.");
    }
    if (currentStock === 0) {
      return toast.error("Selected size is out of stock.");
    }
    const finalQuantity = parseInt(quantity, 10);
    if (isNaN(finalQuantity) || finalQuantity < 1 || finalQuantity > maxQty) {
      return toast.error(`Please enter a valid quantity between 1 and ${maxQty}.`);
    }
    addToCart(productData._id, size, finalQuantity);
  };

  if (productData === false) {
    return (
      <div className="flex items-center justify-center h-96">
         <p className="text-xl text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (productData === null) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-t pt-10">
         <h2 className="text-2xl mb-4">Product not found.</h2>
         <button onClick={() => navigate('/collection')} className="px-6 py-2 bg-black text-white">Back to Collection</button>
      </div>
    );
  }

  return (
    <div  className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* ---------------- product Data --------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

      {/* --------------- product Images --------------- */}
      <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
        <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full' >
           {
            productData.image.map((item,index) => (
              <img onClick={() =>setImage(item)}  src={item}  key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink cursor-pointer' alt="" />
            ))
           }
        </div>
        <div className='w-full sm:w-[80%]'>
          <img className='w-full h-auto'  src={image} alt="" />
        </div>
      </div>

      {/* -------------- Product Info --------------- */}

      <div className='flex-1'>
        <h1 className='font medium text-2xl mt-2 ' >{productData.name}</h1>
        <div className='flex items-center gap-1 mt-2' >
          <img src={assets.star_icon} alt="" className="w-3 5" />
          <img src={assets.star_icon} alt="" className="w-3 5" />
          <img src={assets.star_icon} alt="" className="w-3 5" />
          <img src={assets.star_icon} alt="" className="w-3 5" />
          <img src={assets.star_dull_icon} alt="" className="w-3 5" />
          <p className='pl-2' >(122)</p>
        </div>
        <p className='mt-5 text-3xl font-medium ' >{currency}{productData.price}</p>
        <p  className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
        <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {
                (!hasInventory || productData.inventory.length === 0) ? (
                   <p className="text-red-500 text-sm">Stock information is unavailable.</p>
                ) : (productData.sizes && productData.sizes.length > 0) ? (
                  productData.sizes.map((item,index) => {
                    const stock = getStockForSize(item);
                    const isOutOfStock = stock === 0;
                    return (
                      <button 
                        onClick={() => { if(!isOutOfStock) { setSize(item); setQuantity(1); } }} 
                        disabled={isOutOfStock}
                        className={`border py-2 px-4 ${item === size ? 'border-orange-500 bg-orange-50': 'bg-gray-100'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed text-gray-400' : ''}`}  
                        key={index}
                      >
                        {item} {isOutOfStock && <span className="text-xs text-red-500 block">Out of Stock</span>}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-red-500 text-sm">Size selection is currently unavailable.</p>
                )
              }
            </div>
        </div>
        
        <div className='flex flex-col gap-4 my-8'>
            <p>Quantity</p>
            <div className='flex items-center border border-gray-300 w-fit'>
              <button onClick={() => handleQuantityChange(-1)} disabled={!size || quantity <= 1} className='px-4 py-2 bg-gray-100 disabled:opacity-50 border-r border-gray-300'>-</button>
              <input type='number' min='1' max={size ? maxQty : 10} value={quantity} onChange={handleManualQuantity} onBlur={handleQuantityBlur} disabled={!size || currentStock === 0} className='w-14 text-center py-2 outline-none appearance-none m-0 disabled:bg-gray-100' style={{MozAppearance: 'textfield'}} />
              <button onClick={() => handleQuantityChange(1)} disabled={!size || quantity >= maxQty} className='px-4 py-2 bg-gray-100 disabled:opacity-50 border-l border-gray-300'>+</button>
            </div>
        </div>

        <button onClick={handleAddToCart} disabled={!hasInventory || productData.inventory.length === 0} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed'>ADD TO CART</button>
        <hr className='mt-8 sm:w-4/5'/>
        <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
           <p>100% Original product.</p>
           <p>Cash on delivery is available on this product.</p>
           <p>Easy return and exchange policy within 7 days.</p>
        </div>
      </div>
    </div>
       
       {/* --------------- Description & review Section ---------------- */}
      
      <div className='mt-20' >
        <div className='flex'>
            <b className='border px-5 py-3  text-sm'>Description</b>
            <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
           <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam asperiores, itaque sit facilis eveniet, delectus optio qui corrupti eius praesentium dicta maiores culpa autem odit reprehenderit labore similique quaerat saepe.</p>
           <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nemo enim tenetur deserunt provident sit molestiae repellendus! Magni, quae. Architecto culpa deserunt totam eos quidem eveniet ea officia, aspernatur fugiat. Facere.</p>
        </div>
      </div>

      {/* -------------- display related products ----------------- */}

          <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  )
}

export default Product
