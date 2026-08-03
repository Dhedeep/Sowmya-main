import React from 'react';

const WhatsAppWidget = () => {
  const phoneNumber = "919121006787";
  const message = "Hi Sowmya Selections, I'm interested in your collection!";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group pointer-events-auto"
        aria-label="Contact us on WhatsApp"
      >
        <div className="relative">
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gray-200 rounded-full blur-md opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-300"></div>

          {/* Main Icon Container - Now White and More Compact */}
          <div className="whatsapp-button relative flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] transition-all duration-300 transform group-hover:scale-110 active:scale-95 border border-gray-100 overflow-hidden">
            <img
              src="/images/whatsapp.png"
              alt="WhatsApp"
              className="w-9 h-9 object-contain"
            />
          </div>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-sm font-medium rounded-lg opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap hidden md:block border border-white/10 shadow-xl">
            Chat with us
            <div className="absolute top-1/2 -translate-y-1/2 left-full -ml-[1px] border-[6px] border-transparent border-l-black/80"></div>
          </div>
        </div>
      </a>

      <style jsx>{`
        .whatsapp-button {
          animation: float 4s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        /* 60fps smoothing for transforms */
        .whatsapp-button, .whatsapp-button img {
          backface-visibility: hidden;
          -webkit-font-smoothing: subpixel-antialiased;
        }
      `}</style>
    </>
  );
};

export default WhatsAppWidget;
