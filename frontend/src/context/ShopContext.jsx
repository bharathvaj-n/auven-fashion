import React, { useEffect, useState } from 'react';
import { createContext } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'


export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = 'Rs ';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const [standaloneBasePrice, setStandaloneBasePrice] = useState(999);
    const [standaloneObjectPrice, setStandaloneObjectPrice] = useState(100);
    const navigate = useNavigate();

    // Coupon State
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Homepage Content State
    const [homepageContent, setHomepageContent] = useState(null);

    const addToCart = async (itemId, size, quantity = 1) => {
        if(!size) {
            toast.error('Select Product Size');
            return;
        }
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            if (cartData[itemId][size]) {
                cartData[itemId][size] += quantity;
            }
            else {
                cartData[itemId][size] = quantity;
            }
        }else{
        cartData[itemId] = {};
        cartData[itemId][size] = quantity;
        }
        setCartItems(cartData);

    if(token) {
        try {    
        await axios.post(backendUrl + '/api/cart/add', {itemId, size, quantity}, {headers:{token}})
        toast.success('Item added to cart')
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

}

    const addCustomizedToCart = async (itemId, size, colour, customization, quantity = 1) => {
        let cartData = structuredClone(cartItems);
        
        // Create deterministic hash for the customization string
        const customString = JSON.stringify(customization);
        // Simple hash function for string
        let hash = 0;
        for (let i = 0; i < customString.length; i++) {
            const char = customString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const customKey = `custom_${Math.abs(hash)}`;

        if(cartData[itemId]){
            if (cartData[itemId][customKey]) {
                cartData[itemId][customKey].quantity += quantity;
            }
            else {
                cartData[itemId][customKey] = {
                    quantity,
                    size,
                    colour,
                    isCustomized: true,
                    customization
                };
            }
        }else{
            cartData[itemId] = {};
            cartData[itemId][customKey] = {
                quantity,
                size,
                colour,
                isCustomized: true,
                customization
            };
        }
        setCartItems(cartData);

        if(token) {
            try {    
                await axios.post(backendUrl + '/api/cart/addCustomized', {
                    itemId, 
                    customKey, 
                    size, 
                    colour, 
                    customization, 
                    quantity
                }, {headers:{token}})
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

    const updateCustomizedCartItem = async (itemId, oldCustomKey, size, colour, customization, quantity = 1) => {
        let cartData = structuredClone(cartItems);
        
        // Create deterministic hash for the customization string
        const customString = JSON.stringify(customization);
        let hash = 0;
        for (let i = 0; i < customString.length; i++) {
            const char = customString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const newCustomKey = `custom_${Math.abs(hash)}`;

        // Remove old key locally
        if (cartData[itemId] && cartData[itemId][oldCustomKey]) {
            delete cartData[itemId][oldCustomKey];
        }

        if(cartData[itemId]){
            if (cartData[itemId][newCustomKey]) {
                // If it coincidentally matches another exact configuration, update quantity
                cartData[itemId][newCustomKey].quantity = quantity;
            }
            else {
                cartData[itemId][newCustomKey] = {
                    quantity,
                    size,
                    colour,
                    isCustomized: true,
                    customization
                };
            }
        }else{
            cartData[itemId] = {};
            cartData[itemId][newCustomKey] = {
                quantity,
                size,
                colour,
                isCustomized: true,
                customization
            };
        }
        setCartItems(cartData);

        if(token) {
            try {    
                await axios.post(backendUrl + '/api/cart/updateCustomized', {
                    itemId, 
                    oldCustomKey,
                    newCustomKey, 
                    size, 
                    colour, 
                    customization, 
                    quantity
                }, {headers:{token}})
                toast.success('Cart updated')
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

   
   const getCartCount = () => {
    let totalCount = 0;
    for(const items in cartItems){
        for(const item in cartItems[items]){
            try{
                if (typeof cartItems[items][item] === 'number' && cartItems[items][item] > 0) {
                    totalCount += cartItems[items][item];
                } else if (typeof cartItems[items][item] === 'object' && cartItems[items][item].quantity > 0) {
                    totalCount += cartItems[items][item].quantity;
                }
            }catch(error){          
            }
        }
    }
    return totalCount;
   }
     


   const updateQuantity = async (itemId, sizeOrCustomKey, quantity) => {
        let cartData = structuredClone(cartItems);
        
        if (typeof cartData[itemId][sizeOrCustomKey] === 'object') {
            cartData[itemId][sizeOrCustomKey].quantity = quantity;
        } else {
            cartData[itemId][sizeOrCustomKey] = quantity;
        }
        
        setCartItems(cartData);
        
        if(token) {
           try {
               // Send sizeOrCustomKey as 'size' so the backend handles it generically
               await axios.post(backendUrl + '/api/cart/update', {itemId, size: sizeOrCustomKey, quantity}, {headers: {token}})
           } catch (error) {
            console.log(error)
            toast.error(error.message)
           }
        }
    }


   const getCartAmount = () => {
       let totalAmount = 0;
       for(const items in cartItems){
           if (items === 'custom_standalone') {
               for (const item in cartItems[items]) {
                   if (typeof cartItems[items][item] === 'object' && cartItems[items][item].quantity > 0) {
                       const itemPrice = cartItems[items][item].price || (standaloneBasePrice + (cartItems[items][item].customization?.objects?.length || 0) * standaloneObjectPrice);
                       totalAmount += itemPrice * cartItems[items][item].quantity;
                   }
               }
               continue;
           }

           let itemInfo = products.find((product) => product._id === items);
           if (!itemInfo) continue;
           
           for(const item in cartItems[items]){
               try{
                   if (typeof cartItems[items][item] === 'number' && cartItems[items][item] > 0) {
                       totalAmount += itemInfo.price * cartItems[items][item]
                   } else if (typeof cartItems[items][item] === 'object' && cartItems[items][item].quantity > 0) {
                       totalAmount += itemInfo.price * cartItems[items][item].quantity;
                   }
               }catch(error){
               }
           }
       }   
       return totalAmount;
   }

   const addStandaloneCustomizedToCart = async (colour, customization, quantity = 1) => {
        let cartData = structuredClone(cartItems);
        
        const customString = JSON.stringify(customization);
        let hash = 0;
        for (let i = 0; i < customString.length; i++) {
            const char = customString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const customKey = `custom_${Math.abs(hash)}`;

        const itemId = 'custom_standalone';
        const numObjects = customization.objects ? customization.objects.length : 0;
        const calculatedPrice = standaloneBasePrice + (numObjects * standaloneObjectPrice);

        if(cartData[itemId]){
            if (cartData[itemId][customKey]) {
                cartData[itemId][customKey].quantity += quantity;
                cartData[itemId][customKey].price = calculatedPrice;
            }
            else {
                cartData[itemId][customKey] = {
                    quantity,
                    colour,
                    isCustomized: true,
                    customization,
                    price: calculatedPrice
                };
            }
        }else{
            cartData[itemId] = {};
            cartData[itemId][customKey] = {
                quantity,
                colour,
                isCustomized: true,
                customization,
                price: calculatedPrice
            };
        }
        setCartItems(cartData);

        if(token) {
            try {    
                await axios.post(backendUrl + '/api/cart/addStandaloneCustomized', {
                    customKey, 
                    colour, 
                    customization, 
                    quantity
                }, {headers:{token}})
                toast.success('Customized item added to cart')
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        } else {
             toast.success('Customized item added to cart (Login to save)')
        }
   }

   const updateStandaloneCustomizedCartItem = async (oldCustomKey, colour, customization, quantity = 1) => {
        let cartData = structuredClone(cartItems);
        
        const customString = JSON.stringify(customization);
        let hash = 0;
        for (let i = 0; i < customString.length; i++) {
            const char = customString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const newCustomKey = `custom_${Math.abs(hash)}`;
        const itemId = 'custom_standalone';
        const numObjects = customization.objects ? customization.objects.length : 0;
        const calculatedPrice = standaloneBasePrice + (numObjects * standaloneObjectPrice);

        if (cartData[itemId] && cartData[itemId][oldCustomKey]) {
            delete cartData[itemId][oldCustomKey];
        }

        if(cartData[itemId]){
            if (cartData[itemId][newCustomKey]) {
                cartData[itemId][newCustomKey].quantity = quantity;
                cartData[itemId][newCustomKey].price = calculatedPrice;
            }
            else {
                cartData[itemId][newCustomKey] = {
                    quantity,
                    colour,
                    isCustomized: true,
                    customization,
                    price: calculatedPrice
                };
            }
        }else{
            cartData[itemId] = {};
            cartData[itemId][newCustomKey] = {
                quantity,
                colour,
                isCustomized: true,
                customization,
                price: calculatedPrice
            };
        }
        setCartItems(cartData);

        if(token) {
            try {    
                await axios.post(backendUrl + '/api/cart/updateStandaloneCustomized', {
                    oldCustomKey,
                    newCustomKey, 
                    colour, 
                    customization, 
                    quantity
                }, {headers:{token}})
                toast.success('Cart updated')
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
   }

   const getProductData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if(response.data.success){
        setProducts(response.data.products)
      } else {
        toast.error(response.data.message)
      }
      
    } catch (error) {
        console.log(error);
        toast.error(error.message)
    }
   }

   const getConfigData = async () => {
    try {
        const response = await axios.get(backendUrl + '/api/config/constants');
        if (response.data.success && response.data.constants) {
            if (response.data.constants.STANDALONE_CUSTOM_BASE_PRICE) {
                setStandaloneBasePrice(response.data.constants.STANDALONE_CUSTOM_BASE_PRICE);
            }
            if (response.data.constants.STANDALONE_CUSTOM_OBJECT_PRICE) {
                setStandaloneObjectPrice(response.data.constants.STANDALONE_CUSTOM_OBJECT_PRICE);
            }
        }
    } catch (error) {
        console.log(error);
    }
   }

   const getUserCart = async ( token ) => {
       try {   
     const response = await axios.post(backendUrl + '/api/cart/get', {} , {headers: {token}})
      if(response.data.success){
       setCartItems(response.data.cartData)
      }
       } catch (error) {
        console.log(error)
        toast.error(error.message)
       }
   }
  
   const getHomepageContent = async () => {
       try {
           const response = await axios.get(backendUrl + '/api/homepage');
           if (response.data.success) {
               setHomepageContent(response.data);
           }
       } catch (error) {
           console.log(error);
       }
   }

   useEffect(() => {
     getProductData()
     getConfigData()
     getHomepageContent()
   },[])

   useEffect(() => {
     if(!token && localStorage.getItem('token')){
        setToken(localStorage.getItem('token'))
        getUserCart(localStorage.getItem('token'))
     }
   },[])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, addCustomizedToCart, updateCustomizedCartItem, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token,
        standaloneBasePrice, standaloneObjectPrice, addStandaloneCustomizedToCart, updateStandaloneCustomizedCartItem,
        appliedCoupon, setAppliedCoupon, discountAmount, setDiscountAmount,
        homepageContent
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;