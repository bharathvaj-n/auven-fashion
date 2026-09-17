import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
const Collection = () => {
  

  const {products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [SubCategory, setSubCategory] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [sortType, setSortType] = useState('relavent');

  const toggleCategory = (e) => {

    if (category.includes(e.target.value)){
      
      setCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setCategory(prev => [...prev, e.target.value]);

    }
  
  }

  const toggleSubCategory = (e) => {
  
    if(SubCategory.includes(e.target.value)){
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setSubCategory(prev => [...prev,e.target.value]);
    }
  }

  const toggleSize = (e) => {
    if (selectedSizes.includes(e.target.value)) {
      setSelectedSizes(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSelectedSizes(prev => [...prev, e.target.value]);
    }
  }

  const togglePrice = (e) => {
    if (selectedPrices.includes(e.target.value)) {
      setSelectedPrices(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSelectedPrices(prev => [...prev, e.target.value]);
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search && search.trim() !== "") {
      const query = search.trim().toLowerCase();
      productsCopy = productsCopy.filter(item => {
        const nameMatch = item.name && item.name.toLowerCase().includes(query);
        const catMatch = item.category && item.category.toLowerCase().includes(query);
        const subCatMatch = item.subcategory && item.subcategory.toLowerCase().includes(query);
        return nameMatch || catMatch || subCatMatch;
      });
    }

    if(category.length > 0){
      productsCopy =  productsCopy.filter(item => category.includes(item.category));
    }

    if(SubCategory.length > 0){
      productsCopy =  productsCopy.filter(item => SubCategory.includes(item.subcategory));
    }

    if (selectedSizes.length > 0) {
      productsCopy = productsCopy.filter(item => selectedSizes.some(size => item.sizes.includes(size)));
    }

    if (selectedPrices.length > 0) {
      productsCopy = productsCopy.filter(item => {
        return selectedPrices.some(range => {
          if (range === 'under500') return item.price < 500;
          if (range === '500-999') return item.price >= 500 && item.price <= 999;
          if (range === '1000-1499') return item.price >= 1000 && item.price <= 1499;
          if (range === '1500+') return item.price >= 1500;
          return false;
        });
      });
    }

    setFilterProducts(productsCopy);
  }


  const sortProducts = () => {
     let fpCopy = filterProducts.slice();

     switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b) => (a.price - b.price)));
        break;

        case 'high-low':
          setFilterProducts(fpCopy.sort((a,b) => (b.price -a.price)));
          break;

        default:
          applyFilter();
          break; 

     }
  }


  useEffect(() => {
    setFilterProducts(products);
  },[])

  useEffect(() => {
       applyFilter();
  },[category, SubCategory, selectedSizes, selectedPrices, search, showSearch, products])


  useEffect(() => {
    sortProducts();
  },[sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t' >
        
      {/* filter Options */}
      <div className='min-w-60'>
         <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
         </p>

         {/* Category Filter */}

         <div className={`border border-gray-300  pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
           <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3'  type='checkbox'  value={"Men"} onChange={toggleCategory} checked={category.includes("Men")} />Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3'  type='checkbox'  value={"Women"} onChange={toggleCategory} checked={category.includes("Women")} />Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3'  type='checkbox'  value={"Kids"} onChange={toggleCategory} checked={category.includes("Kids")} />Kids
            </p>
           </div>
         </div>

        {/* Sub Category Filter */}
        <div className={`border border-gray-300  pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
           <p className='mb-3 text-sm font-medium'>TYPE</p>
           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3'  type='checkbox'  value={"Topwear"} onChange={toggleSubCategory} checked={SubCategory.includes("Topwear")} />Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3'  type='checkbox'  value={"Bottomwear"} onChange={toggleSubCategory} checked={SubCategory.includes("Bottomwear")} />Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3'  type='checkbox'  value={"Winterwear"} onChange={toggleSubCategory} checked={SubCategory.includes("Winterwear")} />Winterwear
            </p>
           </div>
         </div>

         {/* Size Filter */}
         <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
           <p className='mb-3 text-sm font-medium'>SIZE</p>
           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"S"} onChange={toggleSize} checked={selectedSizes.includes("S")} />S
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"M"} onChange={toggleSize} checked={selectedSizes.includes("M")} />M
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"L"} onChange={toggleSize} checked={selectedSizes.includes("L")} />L
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"XL"} onChange={toggleSize} checked={selectedSizes.includes("XL")} />XL
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"XXL"} onChange={toggleSize} checked={selectedSizes.includes("XXL")} />XXL
            </p>
           </div>
         </div>

         {/* Price Filter */}
         <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
           <p className='mb-3 text-sm font-medium'>PRICE</p>
           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"under500"} onChange={togglePrice} checked={selectedPrices.includes("under500")} />Under ₹500
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"500-999"} onChange={togglePrice} checked={selectedPrices.includes("500-999")} />₹500 - ₹999
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"1000-1499"} onChange={togglePrice} checked={selectedPrices.includes("1000-1499")} />₹1000 - ₹1499
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={"1500+"} onChange={togglePrice} checked={selectedPrices.includes("1500+")} />₹1500+
            </p>
           </div>
         </div>
         
         <div className={`text-right sm:text-left ${showFilter ? '' : 'hidden'} sm:block`}>
           <button onClick={() => { setSearch(''); setCategory([]); setSubCategory([]); setSelectedSizes([]); setSelectedPrices([]); }} className="text-sm text-gray-500 hover:text-black mt-2 underline">
             Clear Filters
           </button>
         </div>

      </div>

      {/* Right Side */}
      <div className='flex-1' >
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTION'} />
           
           {/* Product Sort */}

           <select onChange={(e) => setSortType(e.target.value)}  className='border-2 border-gray-300 text-sm px-2'>
            <option value='relavent' >Sort by: Relavent</option>
            <option value='low-high' >Sort by: Low to High</option>
            <option value='high-low' >Sort by: High to Low</option>
           </select>
        </div>

        {/* Map Products */}
        {filterProducts.length > 0 ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
             {
              filterProducts.map((item, index) => (
                <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
              ))
             }  
          </div>
        ) : (
          <div className="w-full text-center py-20 text-gray-500">
            <p>No products found matching your filters.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Collection
