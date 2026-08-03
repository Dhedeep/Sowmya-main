import React, { useContext, useState, useEffect } from 'react';
import { Page, Product } from '../types';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import TextMarquee from '../components/TextMarquee';
import CollectionSections from '../components/CollectionSections';
import TestimonialsSection from '../components/TestimonialsSection';
import PopularProducts from '../components/PopularProducts';
import FeaturesSection from '../components/FeaturesSection';
import { ThemeContext } from '../App';
import { ArrowRight } from 'lucide-react';
import { useProductContext } from '../src/contexts/ProductContext';

const HomePage = ({ navigateTo, viewProduct }) => {
  const { theme } = useContext(ThemeContext);
  const { getProductsByOptions, loading, refresh } = useProductContext();
  const [products, setProducts] = useState([]);

  // Create a wrapper function for viewProduct to handle home- prefixed IDs
  const handleViewProduct = (product) => {
    // Remove the home- prefix before passing to viewProduct
    const productToView = product.id.startsWith('home-')
      ? { ...product, id: product.id.replace('home-', '') }
      : product;
    viewProduct(productToView);
  };

  useEffect(() => {
    // Get products with stock
    const cachedProducts = getProductsByOptions({ includeStock: true });

    // Filter to EXCLUDE new arrivals for the home page "Popular Products" section
    // and show regular shop products instead
    const displayProducts = cachedProducts.filter(p =>
      p.subcategory !== 'new-arrivals' && p.subcategoryName !== 'New Arrivals'
    ).slice(0, 8);

    // Add prefix to ensure unique keys for home page
    if (displayProducts.length > 0) {
      const productsWithPrefix = displayProducts.map(product => ({
        ...product,
        id: `home-${product.id}`
      }));
      setProducts(productsWithPrefix);
    } else {
      setProducts([]);
    }
  }, [getProductsByOptions]);

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {/* Hero Carousel */}
        <HeroCarousel navigateTo={navigateTo} />

        {/* Text Marquee */}
        <TextMarquee />

        {/* Collection Sections */}
        <CollectionSections />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Loading State for Popular Products */}
        <div className={`py-16 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-white' : 'bg-black'} rounded-full flex items-center justify-center`}>
                  <i className={`icofont icofont-lion-head-2 ${theme === 'dark' ? 'text-black' : 'text-white'} text-xl`}></i>
                </div>
              </div>
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Popular Products</h2>
              <div className={`w-20 h-1 ${theme === 'dark' ? 'bg-white' : 'bg-black'} mx-auto`}></div>
            </div>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <FeaturesSection />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Hero Carousel */}
      <HeroCarousel navigateTo={navigateTo} />

      {/* Text Marquee */}
      <TextMarquee />

      {/* Collection Sections */}
      <CollectionSections />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Popular Products */}
      <PopularProducts
        products={products}
        viewProduct={handleViewProduct}
        navigateTo={navigateTo}
      />


      {/* Features Section */}
      <FeaturesSection />

    </div>
  );
};

export default HomePage;