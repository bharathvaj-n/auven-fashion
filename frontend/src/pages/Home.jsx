import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import FeaturedProducts from '../components/FeaturedProducts'
import PromotionalBanner from '../components/PromotionalBanner'
import OurPolicy from '../components/OurPolicy'
import NewsLetterBox from '../components/NewsLetterBox'

const Home = () => {
  return (
    <div>
      <Hero />
      <PromotionalBanner />
      <FeaturedProducts />
      <LatestCollection/>
      <OurPolicy/>
      <NewsLetterBox/>
    </div>
  )
}

export default Home
