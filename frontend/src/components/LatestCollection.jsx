import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products, homepageContent } = useContext(ShopContext);
  const [latestProducts, setLatestProducts ] = useState([]);

  useEffect(() => {
     setLatestProducts(products.slice(0,10));
  },[products])
  
  // Check if LatestCollection is managed and active
  let config = null;
  if (homepageContent && homepageContent.latestCollection && homepageContent.latestCollection.length > 0) {
      config = homepageContent.latestCollection[0];
  }

  // If there's a config and it's explicitly deactivated, or if you want it always on by default if no config exists.
  // We'll assume if it's inactive, we return null.
  if (config && config.active === false) {
      return null;
  }

  const titleText1 = config?.title ? config.title.split(' ')[0] : 'LATEST';
  const titleText2 = config?.title ? config.title.split(' ').slice(1).join(' ') : 'COLLECTION';
  const description = config?.description || 'Ecommerce or "electronic commerce" is the trading of goods and services online. The internet allows individuals and businesses to buy and sell an increasing amount of physical goods, digital goods, and services electronically.';

    return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title  text1={titleText1} text2={titleText2} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base  text-gray-600'>{description}</p>     
      </div>
      
      {/* Rendering products */}
      
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 gap-y-6'>
        {latestProducts.map((item,index) => (
          <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price}/>
        ))}
      </div>

    </div>
  )
}

export default LatestCollection
