import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomizedCartPreview = ({ customization }) => {
    if (!customization || !customization.baseTemplate) {
        return (
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 text-center border p-1 rounded shrink-0">
                Preview Unavailable
            </div>
        );
    }
    
    return (
        <div className="w-16 h-16 sm:w-24 sm:h-24 relative overflow-hidden bg-white border shrink-0 rounded select-none pointer-events-none">
            {/* The 1000x1000 logical grid, scaled perfectly to match the 64px mobile (0.064) or 96px desktop (0.096) containers */}
            <div className="absolute top-0 left-0 origin-top-left w-[1000px] h-[1000px] scale-[0.064] sm:scale-[0.096]">
                <img 
                    src={customization.baseTemplate} 
                    alt="Template"
                    className="absolute inset-0 w-full h-full object-contain z-0"
                />

                {customization.colour && (
                    <div 
                        className="absolute inset-0 w-full h-full z-[1]"
                        style={{
                            backgroundColor: customization.colour.toLowerCase(),
                            maskImage: `url(${customization.baseTemplate})`,
                            WebkitMaskImage: `url(${customization.baseTemplate})`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            mixBlendMode: 'multiply'
                        }}
                    />
                )}

                <div className="absolute inset-0 z-[2]">
                    {(customization.objects || []).map(obj => {
                        if (obj.type === 'text') {
                            return (
                                <div
                                    key={obj.id}
                                    className="absolute flex items-center justify-center font-sans font-bold text-gray-800"
                                    style={{
                                        left: `${obj.x}px`,
                                        top: `${obj.y}px`,
                                        transform: `translate(-50%, -50%)`,
                                        fontSize: `${obj.fontSize * obj.scaleX}px`,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {obj.text}
                                </div>
                            );
                        } else if (obj.type === 'image' || obj.type === 'design') {
                            return (
                                <div
                                    key={obj.id}
                                    className="absolute flex items-center justify-center"
                                    style={{
                                        left: `${obj.x}px`,
                                        top: `${obj.y}px`,
                                        width: `${obj.width * obj.scaleX}px`,
                                        height: `${obj.height * obj.scaleY}px`,
                                        transform: `translate(-50%, -50%)`,
                                    }}
                                >
                                    <img 
                                        src={obj.imageUrl} 
                                        alt="Object" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
};

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, standaloneBasePrice, standaloneObjectPrice, getCartAmount, backendUrl, token, appliedCoupon, setAppliedCoupon, setDiscountAmount } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (typeof cartItems[items][item] === 'number' && cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              sizeOrCustomKey: item,
              quantity: cartItems[items][item],
            });
          } else if (typeof cartItems[items][item] === 'object' && cartItems[items][item].quantity > 0) {
            tempData.push({
              _id: items,
              sizeOrCustomKey: item,
              quantity: cartItems[items][item].quantity,
              isCustomized: true,
              size: cartItems[items][item].size,
              colour: cartItems[items][item].colour,
              customization: cartItems[items][item].customization
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  // Recalculate frontend discount dynamically when cart changes if a coupon is applied
  useEffect(() => {
     if (appliedCoupon && cartData.length > 0) {
         const currentSubtotal = getCartAmount();
         if (currentSubtotal < appliedCoupon.minimumOrderAmount) {
             toast.warning(`Coupon ${appliedCoupon.code} removed. Minimum order value is ${currency} ${appliedCoupon.minimumOrderAmount}.`);
             handleRemoveCoupon();
         } else {
             const calculatedDiscount = (currentSubtotal * appliedCoupon.discountPercentage) / 100;
             const discount = Math.min(calculatedDiscount, appliedCoupon.maximumDiscountAmount);
             setDiscountAmount(Math.round(discount));
         }
     } else if (cartData.length === 0) {
         handleRemoveCoupon();
     }
  }, [cartData, appliedCoupon, getCartAmount, currency]);

  const handleApplyCoupon = async () => {
     if (!couponCodeInput.trim()) {
         toast.error("Please enter a coupon code.");
         return;
     }
     setIsApplyingCoupon(true);
     try {
         const currentSubtotal = getCartAmount();
         const res = await axios.post(`${backendUrl}/api/coupon/validate`, {
             code: couponCodeInput,
             subtotal: currentSubtotal
         }, { headers: { Authorization: `Bearer ${token}` } });

         if (res.data.success) {
             toast.success(res.data.message);
             setAppliedCoupon(res.data.coupon);
             setDiscountAmount(res.data.discountAmount);
             setCouponCodeInput(''); // Clear input
         } else {
             toast.error(res.data.message);
         }
     } catch (error) {
         console.log(error);
         toast.error(error.message);
     } finally {
         setIsApplyingCoupon(false);
     }
  };

  const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCodeInput('');
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = item._id === 'custom_standalone' 
              ? { name: "Customized T-Shirt", price: item.price || (standaloneBasePrice + (item.customization?.objects?.length || 0) * standaloneObjectPrice), image: [] }
              : products.find((product) => product._id === item._id);

          if (!productData) return null;

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700  grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-4 sm:gap-6">
                {item.isCustomized ? (
                    <CustomizedCartPreview customization={item.customization} />
                ) : (
                    <img
                      className="w-16 sm:w-20 shrink-0"
                      src={productData.image[0]}
                      alt={productData.name}
                    />
                )}
                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productData.name}
                  </p>
                  {item.isCustomized && (
                     <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">Customized</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-2">
                    <p>
                      {currency}
                      {productData.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                      {item.size}
                    </p>
                    {item.isCustomized && item.colour && (
                        <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">{item.colour}</p>
                    )}
                  </div>
                  {item.isCustomized && item.customization && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                       <p className="font-semibold text-gray-700 mb-1">Customization Elements:</p>
                       <ul className="list-disc pl-4 space-y-1">
                       {item.customization.objects.length === 0 && <li>No customization added</li>}
                       {item.customization.objects.map((obj, i) => (
                          <li key={i}>
                             {obj.type === 'text' && <span>Text: "{obj.text}"</span>}
                             {obj.type === 'image' && <span>Uploaded Image</span>}
                             {obj.type === 'design' && <span>{obj.name || 'Predefined Design'}</span>}
                          </li>
                       ))}
                       </ul>
                    </div>
                  )}
                  {item.isCustomized && (
                     <div className="mt-3 text-xs">
                        <button 
                            className="text-blue-600 hover:text-blue-800 underline mr-4"
                            onClick={() => {
                                navigate(`/customizer`, { state: { editCartItem: item } });
                            }}
                            aria-label={`Edit customization for ${productData.name}`}
                        >
                            Edit Customization
                        </button>
                     </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-4">
                  <input
                    onChange={(e) =>
                      e.target.value === "" || e.target.value === "0"
                        ? null
                        : updateQuantity(
                            item._id,
                            item.sizeOrCustomKey,
                            Number(e.target.value),
                          )
                    }
                    className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                    type="number"
                    min={1}
                    defaultValue={item.quantity}
                    aria-label={`Quantity for ${productData.name}`}
                  />
                  <button 
                    onClick={() => updateQuantity(item._id, item.sizeOrCustomKey, 0)}
                    className="text-xs text-red-500 hover:text-red-700 underline flex sm:hidden"
                    aria-label={`Remove ${productData.name}`}
                  >
                     Remove
                  </button>
              </div>
              
              <img
                onClick={() => updateQuantity(item._id, item.sizeOrCustomKey, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer hidden sm:block"
                src={assets.bin_icon}
                alt="Remove item"
                aria-label={`Remove ${productData.name}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          
          {/* Coupon Section */}
          <div className="mb-8">
             <p className="text-gray-600 font-medium mb-3">Have a coupon code?</p>
             {appliedCoupon ? (
                 <div className="flex items-center justify-between border border-green-500 bg-green-50 p-3">
                     <div>
                         <p className="text-green-700 font-semibold">{appliedCoupon.code} Applied!</p>
                         <p className="text-xs text-green-600">{appliedCoupon.discountPercentage}% off up to {currency} {appliedCoupon.maximumDiscountAmount}</p>
                     </div>
                     <button onClick={handleRemoveCoupon} className="text-sm text-red-500 font-medium hover:underline">Remove</button>
                 </div>
             ) : (
                 <div className="flex gap-2">
                     <input 
                         type="text" 
                         value={couponCodeInput}
                         onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                         placeholder="Enter coupon code"
                         className="border border-gray-300 px-3 py-2 w-full uppercase focus:outline-none focus:border-gray-500"
                     />
                     <button 
                         onClick={handleApplyCoupon}
                         disabled={isApplyingCoupon || cartData.length === 0}
                         className={`bg-black text-white px-6 py-2 transition-colors ${isApplyingCoupon ? 'opacity-50' : 'hover:bg-gray-800'}`}
                     >
                         {isApplyingCoupon ? 'APPLYING...' : 'APPLY'}
                     </button>
                 </div>
             )}
          </div>

          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={() => navigate("/place-order")}
              disabled={cartData.length === 0}
              className={`bg-black text-white text-sm my-8 px-8 py-3 ${cartData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
