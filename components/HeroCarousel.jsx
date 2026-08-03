import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../App';
import { Page } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = ({ navigateTo }) => {
  const { theme } = useContext(ThemeContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);

  // Slides data with images that provide good contrast for purple/pink text colors
  const slides = [
    {
      id: 1,
      image: "/images/Hero image 1.jpg",
      mobileImage: "/images/hero_mobile1.jpg",
      cta: "Explore Now +"
    },
    {
      id: 2,
      image: "/images/Hero image 3.jpg",
      mobileImage: "/images/hero_mobile3.jpg",
      cta: "Discover More +"
    },
    {
      id: 3,
      image: "/images/Hero image 2.jpg",
      mobileImage: "/images/hero_mobile2.jpg",
      cta: "Shop Collection +"
    }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;

    // Reset progress when slide changes
    setProgress(0);

    // Increment progress every 100ms
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / 70); // 7000ms / 100ms = 70 steps
      });
    }, 100);

    // Change slide after 7 seconds
    const slideInterval = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(slideInterval);
    };
  }, [isAutoPlay, slides.length, currentSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
    setIsAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
    setIsAutoPlay(false);
  };

  const handleShopNow = () => {
    // Navigate to shop page
    navigateTo('shop');
  };

  return (
    <div className={`relative w-full overflow-hidden h-[700px] md:h-[750px] ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative w-full h-full flex-shrink-0"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {/* Desktop Image */}
              <img
                src={slide.image}
                alt={slide.cta}
                className="hidden md:block w-full h-full object-cover"
              />
              {/* Mobile Image */}
              <img
                src={slide.mobileImage}
                alt={slide.cta}
                className="block md:hidden w-full h-full object-cover"
              />
            </div>

            {/* Content Overlay - CTA Button at Bottom Center */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={handleShopNow}
                className={`transform transition-all duration-700 delay-500 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  } font-bold uppercase text-white hover:scale-105 hover:bg-white hover:text-black whitespace-nowrap shadow-2xl`}
                style={{
                  backgroundColor: '#d91656',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  fontWeight: '800',
                  padding: '18px 45px',
                  borderRadius: '50px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows Removed */}

      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-gray-300 z-30"
        style={{
          width: '100%',
          height: '3px',
          backgroundColor: 'rgba(0, 0, 0, 0.15)'
        }}
      >
        <div
          className="h-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: '#640d5F'
          }}
        ></div>
      </div>



      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;