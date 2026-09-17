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
    const navigate = useNavigate();

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
  
   useEffect(() => {
     getProductData()
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
        setToken, token
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;