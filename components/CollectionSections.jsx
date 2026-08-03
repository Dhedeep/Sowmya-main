import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import { useContext } from 'react';

const CollectionSections = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleShopNow = () => {
    // Navigate to shop page showing all products
    navigate('/shop');
  };

  return (
    <div className={`py-10 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kalamkari Collection */}
          <div className="relative group cursor-pointer" onClick={() => handleShopNow()}>
            <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
              <img
                src="/images/Kalamkari Sarees.jpg"
                alt="Kalamkari Sarees"
                className="w-full h-[550px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-300 rounded-2xl">
              <div className="text-center text-white pb-12 w-full px-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-5 tracking-tight" style={{ lineHeight: '1.2' }}>
                  Kalamkari <br />Sarees
                </h2>
                <button
                  className="inline-block px-8 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-xl text-sm uppercase tracking-widest"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShopNow();
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Kota Doria Collection */}
          <div className="relative group cursor-pointer" onClick={() => handleShopNow()}>
            <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
              <img
                src="/images/Kota Doria Sarees.jpg"
                alt="Kota Doria Sarees"
                className="w-full h-[550px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-300 rounded-2xl">
              <div className="text-center text-white pb-12 w-full px-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-5 tracking-tight" style={{ lineHeight: '1.2' }}>
                  Kota Doria <br />Sarees
                </h2>
                <button
                  className="inline-block px-8 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-xl text-sm uppercase tracking-widest"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShopNow();
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Chennuri Silk Collection */}
          <div className="relative group cursor-pointer" onClick={() => handleShopNow()}>
            <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
              <img
                src="/images/chennuri silk.jpg"
                alt="Chennuri Silk Sarees"
                className="w-full h-[550px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-300 rounded-2xl">
              <div className="text-center text-white pb-12 w-full px-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-5 tracking-tight" style={{ lineHeight: '1.2' }}>
                  Chennuri Silk <br />Sarees
                </h2>
                <button
                  className="inline-block px-8 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-xl text-sm uppercase tracking-widest"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShopNow();
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionSections;