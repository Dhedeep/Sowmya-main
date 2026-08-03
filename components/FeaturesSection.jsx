import React, { useContext, useRef, useEffect, useState } from 'react';
import { ThemeContext } from '../App';

const FeaturesSection = ({ features }) => {
  const { theme } = useContext(ThemeContext);
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Default features if none provided
  const defaultFeatures = [
    {
      title: "FREE SHIPPING",
      description: "Free delivery across India on all orders",
      icon: "fas fa-truck"
    },
    {
      title: "CUSTOMER SUPPORT",
      description: "Dedicated WhatsApp & Call assistance",
      icon: "fas fa-headset"
    },
    {
      title: "100% SECURE PAYMENT",
      description: "Safe & hassle-free checkout with trusted gateways",
      icon: "fas fa-lock"
    },
    {
      title: "BEST PRICE PROMISE",
      description: "Value for money on every saree",
      icon: "fas fa-tag"
    },
    {
      title: "EASY PRE-BOOKINGS",
      description: "Reserve your favorite sarees before they sell out",
      icon: "fas fa-calendar-check"
    }
  ];

  const featuresList = features || defaultFeatures;
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationFrameId;
    let lastTime = performance.now();
    const pixelsPerSecond = 30; // Adjust speed as needed

    const animate = (time) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      if (!isPaused && !isDragging && scrollContainer) {
        // Continuous smooth scroll
        const scrollAmount = pixelsPerSecond * deltaTime;
        scrollContainer.scrollLeft += scrollAmount;

        // Loop back to start smoothly
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isDragging]);

  // Handle mouse down for drag functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  // Handle mouse move for drag functionality
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll speed multiplier
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  // Handle mouse leave to stop dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setIsPaused(true);
    const touch = e.touches[0];
    setStartX(touch.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const x = touch.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll speed multiplier
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  return (
    <div className={`py-8 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div
          ref={scrollContainerRef}
          className={`overflow-x-auto scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex space-x-4 md:space-x-6 pb-4" style={{ minWidth: 'max-content' }}>
            {featuresList.map((feature, index) => (
              <div
                key={index}
                className={`${theme === 'dark' ? ' border-gray-800 ' : 'bg-gray-100 border-gray-200'} border rounded-lg p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-1 flex-shrink-0 w-64`}
              >
                <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-brand-primary' : 'bg-brand-primary'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3 className={`font-semibold mb-2 text-sm md:text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {feature.title}
                </h3>
                <p className={`text-xs md:text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Font Awesome for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default FeaturesSection;