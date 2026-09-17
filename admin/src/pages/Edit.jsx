import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useParams, useNavigate } from 'react-router-dom'

const Edit = ({token}) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [slot1, setSlot1] = useState(null)
  const [slot2, setSlot2] = useState(null)
  const [slot3, setSlot3] = useState(null)
  const [slot4, setSlot4] = useState(null)

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.post(backendUrl + '/api/product/single', { productId: id })
        if (response.data.success) {
          const product = response.data.product;
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price);
          setCategory(product.category);
          setSubCategory(product.subcategory);
          setBestseller(product.bestseller);
          setSizes(product.sizes);

          if (product.inventory) {
             const invObj = {};
             product.inventory.forEach(item => {
                 invObj[item.size] = item.quantity;
             });
             setInventory(invObj);
          }

          if (product.image[0]) setSlot1(product.image[0]);
          if (product.image[1]) setSlot2(product.image[1]);
          if (product.image[2]) setSlot3(product.image[2]);
          if (product.image[3]) setSlot4(product.image[3]);

          setLoading(false);
        } else {
          toast.error(response.data.message || "Product not found");
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id])

  const handleSizeToggle = (size) => {
    setSizes(prev => {
      if (prev.includes(size)) {
        const newSizes = prev.filter(item => item !== size);
        setInventory(prevInv => {
          const newInv = {...prevInv};
          delete newInv[size];
          return newInv;
        });
        return newSizes;
      } else {
        setInventory(prevInv => ({...prevInv, [size]: 0}));
        return [...prev, size];
      }
    });
  }

  const handleInventoryChange = (size, qty) => {
    setInventory(prev => ({...prev, [size]: Math.max(0, parseInt(qty) || 0)}));
  }

  const onsubmitHandler = async (e) => {
    e.preventDefault();
    if (updating) return;

    if (!name.trim()) {
      return toast.error("Product name is required");
    }
    if (!description.trim()) {
      return toast.error("Product description is required");
    }
    if (Number(price) <= 0) {
      return toast.error("Price must be greater than 0");
    }

    try {
      setUpdating(true);
      const formData = new FormData()

      formData.append("productId", id)
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subcategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))

      const inventoryArray = sizes.map(size => ({ size, quantity: inventory[size] || 0 }));
      formData.append("inventory", JSON.stringify(inventoryArray));

      const prevImages = [];
      if (typeof slot1 === 'string') prevImages.push(slot1);
      if (typeof slot2 === 'string') prevImages.push(slot2);
      if (typeof slot3 === 'string') prevImages.push(slot3);
      if (typeof slot4 === 'string') prevImages.push(slot4);

      formData.append("prevImages", JSON.stringify(prevImages));

      if (slot1 instanceof File) formData.append("image1", slot1);
      if (slot2 instanceof File) formData.append("image2", slot2);
      if (slot3 instanceof File) formData.append("image3", slot3);
      if (slot4 instanceof File) formData.append("image4", slot4);

      const response = await axios.post(backendUrl + '/api/product/update', formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/list')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    } finally {
      setUpdating(false);
    }
  }

  const renderImage = (slot) => {
    if (!slot) return assets.upload_area;
    if (typeof slot === 'string') return slot;
    return URL.createObjectURL(slot);
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  }

  return (
    <form onSubmit={onsubmitHandler} className='flex flex-col w-full items-start gap-3' >
      
      <div>
        <p className='mb-2'>Update Images</p>
        <div className='flex gap-2' >
          <label htmlFor="image1">
            <img className='w-20 h-20 object-cover cursor-pointer' src={renderImage(slot1)} alt="" />
            <input onChange={(e) => setSlot1(e.target.files[0])} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img className='w-20 h-20 object-cover cursor-pointer' src={renderImage(slot2)} alt="" />
            <input onChange={(e) => setSlot2(e.target.files[0])} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img className='w-20 h-20 object-cover cursor-pointer' src={renderImage(slot3)} alt="" />
            <input onChange={(e) => setSlot3(e.target.files[0])} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img className='w-20 h-20 object-cover cursor-pointer' src={renderImage(slot4)} alt="" />
            <input onChange={(e) => setSlot4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
        </div>
      </div>

      <div className='w-full' >
        <p className='mb-2' >Product name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required />
      </div>

      <div className='w-full' >
        <p className='mb-2' >Product description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8 '>
        <div>
          <p className='mb-2' >Product category</p>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2' >Sub category</p>
          <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2' >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className='mb-2' >Product Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type='Number' placeholder='25' required min="1" />
        </div>
      </div>

      <div>
        <p className='mb-2' >Product Sizes</p>
        <div className='flex gap-3' >
          <div onClick={() => handleSizeToggle('S')}>
            <p className={`${sizes.includes('S') ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`} >S</p>
          </div>
          <div onClick={() => handleSizeToggle('M')} >
            <p className={`${sizes.includes('M') ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`} >M</p>
          </div>
          <div onClick={() => handleSizeToggle('L')} >
            <p className={`${sizes.includes('L') ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`} >L</p>
          </div>        
          <div onClick={() => handleSizeToggle('XL')} >
            <p className={`${sizes.includes('XL') ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`} >XL</p>
          </div>
          <div onClick={() => handleSizeToggle('XXL')} >
            <p className={`${sizes.includes('XXL') ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>XXL</p>
          </div>
        </div>

        {sizes.length > 0 && (
          <div className='mt-4'>
            <p className='mb-2'>Stock Quantity</p>
            <div className='flex flex-col gap-2'>
              {sizes.map(size => (
                <div key={size} className='flex items-center gap-4'>
                  <span className='w-8 font-medium'>{size}</span>
                  <input 
                    type="number" 
                    min="0"
                    className='border px-2 py-1 w-24' 
                    value={inventory[size] !== undefined ? inventory[size] : 0}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className='flex gap-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
        <label className='cursor-pointer' htmlFor="bestseller">Add to Bestseller</label>
      </div>

      <button type='submit' className='w-36 py-3 mt-4 bg-black text-white cursor-pointer disabled:bg-gray-400' disabled={updating}>
        {updating ? 'UPDATING...' : 'UPDATE'}
      </button>
    </form>
  )
}

export default Edit
