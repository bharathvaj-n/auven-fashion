import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const [method,setMethod] = useState('Cash On Delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const {navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, standaloneBasePrice, standaloneObjectPrice, appliedCoupon, setAppliedCoupon, setDiscountAmount } = useContext(ShopContext);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/user/profile', { headers: { token } });
      if (res.data.success && res.data.user.addresses) {
        setSavedAddresses(res.data.user.addresses);
        // Pre-select default address if available
        const defaultAddr = res.data.user.addresses.find(a => a.isDefault);
        if (defaultAddr) {
           handleSelectSavedAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    
    // Split name into first and last
    const nameParts = addr.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    setFormData({
      firstName: firstName || '',
      lastName: lastName || '',
      email: formData.email || '', // Keep existing email if they typed it, or we could fetch from profile
      street: addr.addressLine1 + (addr.addressLine2 ? ', ' + addr.addressLine2 : ''),
      city: addr.city || '',
      state: addr.state || '',
      zipcode: addr.postalCode || '',
      country: addr.country || '',
      phone: addr.phone || ''
    });
  };

  const [formData, setFormData] = useState({
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    zipcode:'',
    country:'',
    phone:''
  })

  const onChangeHandler  = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData( data => ({...data,[name]:value }))
  }

  const onSubmitHandler = async (event) => {
     event.preventDefault()
     try {
      let orderItems = []

      for(const items in cartItems){
        if (items === 'custom_standalone') {
          for (const item in cartItems[items]) {
             if (cartItems[items][item].quantity > 0) {
                 const customItem = cartItems[items][item];
                 orderItems.push({
                     _id: 'custom_standalone',
                     name: 'Customized T-Shirt',
                     price: customItem.price || (standaloneBasePrice + (customItem.customization?.objects?.length || 0) * standaloneObjectPrice),
                     quantity: customItem.quantity,
                     size: item,
                     colour: customItem.colour,
                     customization: customItem.customization,
                     isCustomized: true
                 });
             }
          }
          continue;
        }

        for(const item in cartItems[items]){
          if(cartItems[items][item] > 0){
             const itemInfo = structuredClone(products.find(product => product._id === items))
             if(itemInfo){
                itemInfo.size = item
                itemInfo.quantity = cartItems[items][item]
                orderItems.push(itemInfo)
             }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        couponCode: appliedCoupon ? appliedCoupon.code : ''
      }

      switch(method) {
        // Api calls for COD
       case 'Cash On Delivery':
       setIsProcessing(true);
       const response = await axios.post(backendUrl + '/api/order/place', orderData, {headers: {token}}) 
       if(response.data.success){
        setCartItems({})
        setAppliedCoupon(null)
        setDiscountAmount(0)
        navigate('/orders')
       } else {
        toast.error(response.data.message)
       }
       setIsProcessing(false);
       break;


       case 'Stripe':
       setIsProcessing(true);
       
       const stripeOrderRes = await axios.post(backendUrl + '/api/order/stripe', orderData, {headers: {token}});
       if (!stripeOrderRes.data.success) {
         toast.error(stripeOrderRes.data.message || "Failed to create order");
         setIsProcessing(false);
         return;
       }
       
       // Redirect to Stripe Checkout session
       window.location.replace(stripeOrderRes.data.session_url);
       break;

        default:
        break;

      }
     } catch (error) {
      console.log(error);
      setIsProcessing(false);
     }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t' >
      {/* -------------- left Side ----------------- */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]' >

        <div className='text-xl sm:text-2xl my-3'>
            <Title  text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div>

        {/* Saved Addresses Section */}
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600 font-medium mb-3">Select a Saved Address</p>
            <div className="flex flex-col gap-3">
              {savedAddresses.map(addr => (
                <div 
                  key={addr._id} 
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`border p-3 cursor-pointer rounded ${selectedAddressId === addr._id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input type="radio" checked={selectedAddressId === addr._id} readOnly className="accent-black" />
                    <span className="font-medium">{addr.name}</span>
                    {addr.isDefault && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded ml-2">Default</span>}
                  </div>
                  <div className="text-sm text-gray-600 pl-5">
                    <p>{addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}</p>
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>Ph: {addr.phone}</p>
                  </div>
                </div>
              ))}
              <div 
                  onClick={() => {
                    setSelectedAddressId('');
                    setFormData({ firstName:'', lastName:'', email:formData.email, street:'', city:'', state:'', zipcode:'', country:'', phone:'' });
                  }}
                  className={`border p-3 cursor-pointer rounded flex items-center gap-2 ${selectedAddressId === '' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input type="radio" checked={selectedAddressId === ''} readOnly className="accent-black" />
                  <span className="font-medium">Enter a different address manually</span>
              </div>
            </div>
          </div>
        )}

        <div className='flex gap-3' >
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='First Name'/>
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Last name'/>
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='email' placeholder='Email Address'/>
        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Street'/>
        <div className='flex gap-3' >
          <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='City'/>
          <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='State'/>
        </div>
        <div className='flex gap-3' >
          <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Zip Code'/>
          <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Country'/>
        </div>
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Phone'/>
      </div>



      {/* -------------- Right Side ----------------- */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>
        
        <div className='mt-12' >
           <Title text1={'PAYMENT'} text2={'METHOD'}  />
           {/* ----------------- Payment Method Selection ---------------- */}
           <div className='flex gap-3 flex-col lg:flex-row'> 
              <div onClick={() => !isProcessing && setMethod('Cash On Delivery')}  className='flex items-center gap-3 border p-2 px-3 cursor-pointer' >
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'Cash On Delivery' ? 'bg-green-400' : '' } `} ></p>
                <p className='text-gray-500 text-sm font-medium mx-4' >CASH ON DELIVERY</p>
              </div>
              <div onClick={() => !isProcessing && setMethod('Stripe')}  className='flex items-center gap-3 border p-2 px-3 cursor-pointer' >
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'Stripe' ? 'bg-green-400' : '' } `} ></p>
                <p className='text-gray-500 text-sm font-medium mx-4' >ONLINE PAYMENT</p>
              </div>
           </div>

           <div className='w-full text-end mt-8 ' >
              <button disabled={isProcessing} type='submit' className={`bg-black text-white px-16 py-3 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 {isProcessing ? 'PROCESSING PAYMENT...' : (method === 'Stripe' ? 'PAY SECURELY' : 'PLACE ORDER')}
              </button>
           </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
