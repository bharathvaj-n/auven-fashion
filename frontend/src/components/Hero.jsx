import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { homepageContent } = useContext(ShopContext);

  let heroData = null;
  if (homepageContent && homepageContent.hero && homepageContent.hero.length > 0) {
      heroData = homepageContent.hero[0]; // Take the first active hero based on sortOrder
  }

  // Fallback content if no active hero is returned from the API
  const title = heroData?.title || 'Latest Arrivals';
  const subtitle = heroData?.subtitle || 'OUR BEST SELLERS';
  const buttonText = heroData?.buttonText || 'SHOP NOW';
  const buttonLink = heroData?.buttonLink || '/collection';
  const image = heroData?.image || assets.hero_img;
  const description = heroData?.description || '';

  return (
    <div className='flex flex-col sm:flex-row border border-gray-400'>
      {/* Hero Left Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
        <div className='text-[#414141] px-8' >
          
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
            <p className='font-medium text-sm md:text-base uppercase'>{subtitle}</p>
          </div>
            
            <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed' >{title}</h1>
            
            {description && (
                <p className="text-gray-600 text-sm md:text-base mb-4 max-w-md">{description}</p>
            )}
            
            <Link to={buttonLink} className='flex items-center gap-2 group cursor-pointer inline-flex'>
              <p className='font-semibold text-sm md:text-base group-hover:text-black'>{buttonText}</p>
              <p className='w-8 md:w-11 h-[1px] bg-[#414141] group-hover:bg-black transition-all group-hover:w-14'></p>
            </Link>
          
          </div>
        </div> 

        {/* Hero Right Side */}
        <div className='w-full sm:w-1/2'>
            <img className='w-full h-full object-cover object-center' src={image} alt="Hero Banner" />
        </div>
      </div>
  )
}

export default Hero
