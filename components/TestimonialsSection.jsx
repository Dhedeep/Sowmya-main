import React, { useState, useEffect } from 'react';
import { testimonials } from '../data/testimonials';
import { ThemeContext } from '../App';
import { useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection = () => {
  const { theme } = useContext(ThemeContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToTestimonial = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className={`py-8 md:py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-12">
          <div className="flex items-center justify-center mb-3 md:mb-4">

          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-brand-primary">From Our Client's Hearts</h2>
          <div className="w-16 md:w-20 h-1 bg-brand-secondary mx-auto"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2 md:px-4">
                  <div className={`text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-5 md:p-12 mx-1 md:mx-8`}>
                    <div className="flex justify-center mb-3 md:mb-6">
                      <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden p-1 shadow-sm">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.avatarAlt}
                          className="w-full h-full rounded-full object-contain"
                        />
                      </div>
                    </div>
                    <blockquote className={`mb-3 md:mb-6 text-sm md:text-lg italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p>"{testimonial.text}"</p>
                    </blockquote>
                    <cite className={`not-italic text-sm md:text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      <span className="font-semibold">{testimonial.name}</span>
                      <span className={`block text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.title}</span>
                    </cite>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 md:-translate-x-4 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-black'} rounded-full p-1.5 md:p-2 shadow-lg transition-colors duration-200`}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={nextTestimonial}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 md:translate-x-4 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-black'} rounded-full p-1.5 md:p-2 shadow-lg transition-colors duration-200`}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 md:mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${currentIndex === index
                ? theme === 'dark' ? 'bg-white' : 'bg-black'
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
                }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;