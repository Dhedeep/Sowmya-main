import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../App';

const BrandCarousel = ({ logos }) => {
  const { theme } = useContext(ThemeContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default logos if none provided
  const defaultLogos = [
    "/images/Logo.png",
    "/images/Logo.png",
    "/images/Logo.png",
    "/images/Logo.png",
    "/images/Logo.png"
  ];

  const logosList = logos || defaultLogos;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logosList.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [logosList.length]);

  return (
    <div className={`py-6 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="overflow-hidden mx-[-2rem]">
          <div className="flex transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 20}%)` }}>
            {[...logosList, ...logosList, ...logosList].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-1/5"
              >
                <div className="rounded-xl p-4 flex items-center justify-center h-24 transition-all duration-500 hover:scale-110 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 mx-2">
                  <img
                    src={logo}
                    alt={`Brand ${index + 1}`}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandCarousel;