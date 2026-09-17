import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const PromotionalBanner = () => {
    const { homepageContent } = useContext(ShopContext);

    if (!homepageContent || !homepageContent.promotionalBanners || homepageContent.promotionalBanners.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6 my-10">
            {homepageContent.promotionalBanners.map(banner => (
                <div key={banner._id} className="relative w-full overflow-hidden bg-gray-100 flex flex-col md:flex-row items-center">
                    
                    {/* Image Side */}
                    {banner.image && (
                        <div className="w-full md:w-1/2 h-[300px] md:h-[400px]">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover object-center" />
                        </div>
                    )}

                    {/* Text Side */}
                    <div className={`w-full ${banner.image ? 'md:w-1/2' : 'md:w-full'} p-8 md:p-12 lg:p-16 flex flex-col justify-center`}>
                        {banner.title && (
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{banner.title}</h2>
                        )}
                        {banner.description && (
                            <p className="text-gray-600 text-lg mb-8 max-w-xl">{banner.description}</p>
                        )}
                        
                        {banner.buttonText && banner.buttonLink && (
                            <div>
                                <Link to={banner.buttonLink} className="inline-block bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors">
                                    {banner.buttonText}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PromotionalBanner;
