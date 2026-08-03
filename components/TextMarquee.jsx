import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import { Truck, Gift } from 'lucide-react';

const TextMarquee = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' : 'bg-gradient-to-r from-brand-primary to-brand-secondary'} py-2 shadow-md`}>
      <div className="relative">
        {/* Gradient overlays for smooth fade effect */}
        <div className={`absolute left-0 top-0 bottom-0 w-12 z-10 ${theme === 'dark' ? 'bg-gradient-to-r from-brand-primary to-transparent' : 'bg-gradient-to-r from-brand-primary to-transparent'}`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-12 z-10 ${theme === 'dark' ? 'bg-gradient-to-l from-brand-secondary to-transparent' : 'bg-gradient-to-l from-brand-secondary to-transparent'}`}></div>
        
        {/* Scrolling content */}
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex items-center mx-8">
              <Truck className="w-5 h-5 text-brand-accent mr-3 animate-pulse" />
              <span className="text-white font-semibold text-sm md:text-base">
                FREE DELIVERY ACROSS PAN INDIA
              </span>
              <Gift className="w-5 h-5 text-brand-accent ml-3 mr-8 animate-bounce" />
              <span className="text-white font-semibold text-sm md:text-base">
                NO MINIMUM ORDER
              </span>
              <Truck className="w-5 h-5 text-brand-accent ml-3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TextMarquee;