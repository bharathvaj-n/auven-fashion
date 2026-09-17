import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const FeaturedProducts = () => {
    const { homepageContent } = useContext(ShopContext);

    if (!homepageContent || !homepageContent.featuredProducts || homepageContent.featuredProducts.length === 0) {
        return null;
    }

    return (
        <div className="my-10">
            {homepageContent.featuredProducts.map((section, index) => (
                <div key={section._id || index} className="mb-16">
                    <div className="text-center text-3xl py-8">
                        <Title text1={section.title ? section.title.split(' ')[0] : 'FEATURED'} text2={section.title ? section.title.split(' ').slice(1).join(' ') : 'PRODUCTS'} />
                        {section.description && (
                            <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                                {section.description}
                            </p>
                        )}
                    </div> 

                    {section.products && section.products.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                            {section.products.map((item, i) => (
                                <ProductItem key={i} id={item._id} name={item.name} image={item.image} price={item.price} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FeaturedProducts;
