import React, { useContext } from 'react';
import { ThemeContext } from '../App';

const AboutPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      {/* Hero Header Section */}
      <section className="relative pt-16 pb-8 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Crafting <span className="text-brand-purple italic">Regal</span> Experiences
            </h1>
            <div className={`w-24 h-1.5 mx-auto ${theme === 'dark' ? 'bg-white' : 'bg-brand-purple'} mb-8 opacity-40`}></div>
            <p className={`text-xl md:text-2xl font-light italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              The Art of Exceptional Fashion Without Compromise
            </p>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple opacity-5 blur-3xl -mr-32 -mt-32"></div>
      </section>

      {/* Main Story Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Image Side - Staggered Layout */}
            <div className="md:col-span-6 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-700">
                <img
                  src="/images/Kalamkari Sarees.jpg"
                  alt="About Sowmya Selections"
                  className="w-full h-auto object-cover max-h-[750px]"
                />
              </div>
              {/* Decorative Elements */}
              <div className={`absolute -top-6 -left-6 w-full h-full border-2 ${theme === 'dark' ? 'border-brand-purple/30' : 'border-gray-200'} rounded-2xl -z-10`}></div>
              <div className={`absolute -bottom-10 -right-10 w-40 h-40 border-[15px] ${theme === 'dark' ? 'border-brand-purple/10' : 'border-gray-50'} rounded-full -z-10`}></div>
            </div>

            {/* Content Side */}
            <div className="md:col-span-6 md:pl-12 lg:pl-20 mt-12 md:mt-0">
              <div className="space-y-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-[1px] bg-brand-secondary"></div>
                    <span className="text-sm uppercase tracking-[0.4em] text-brand-secondary font-bold">Our Legacy</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">About Our Company</h2>
                </div>

                <div className="space-y-8 text-lg md:text-xl leading-relaxed font-light">
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Welcome to <span className="font-semibold text-brand-purple">Sowmya Selections</span>, a brand born from a simple yet powerful realization: everyone deserves to wear exceptional clothing that makes them feel confident and regal, without the exorbitant price tag.
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    In an industry where high quality often equals high cost, we set out to redefine the standard.
                  </p>
                  <div className={`pl-6 border-l-4 border-brand-purple italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sowmya Selections bridges the gap between premium fashion and accessible pricing. We believe that stepping into your own era of confidence and style should be a right, not a luxury.
                  </div>
                </div>

                {/* Delivery Badge Card */}
                <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'} backdrop-blur-sm shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all duration-500 mt-12`}>
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-brand-purple text-white shadow-brand-purple/10 shadow-lg' : 'bg-brand-primary text-white shadow-lg shadow-brand-purple/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 34 35" fill="none">
                      <path d="M4.25 30.75C4.25 31.8772 4.69777 32.9582 5.4948 33.7552C6.29183 34.5522 7.37283 35 8.5 35H25.5C26.6272 35 27.7082 34.5522 28.5052 33.7552C29.3022 32.9582 29.75 31.8772 29.75 30.75V22.25H4.25V30.75Z" fill="currentColor"></path>
                      <path d="M32.9375 11.6252H27.8757L23.1497 2.17529C22.8952 1.67569 22.4535 1.29693 21.9209 1.12158C21.3883 0.946218 20.808 0.988465 20.3064 1.23911C19.8049 1.48976 19.4227 1.92849 19.2432 2.4597C19.0637 2.9909 19.1014 3.57153 19.3481 4.07504L23.1243 11.6252H10.8757L14.6497 4.07504C14.7771 3.82515 14.8537 3.55254 14.8751 3.27291C14.8966 2.99327 14.8625 2.71216 14.7747 2.44578C14.687 2.17939 14.5475 1.933 14.3641 1.72082C14.1807 1.50863 13.9571 1.33485 13.7062 1.20948C13.4554 1.08412 13.1822 1.00965 12.9024 0.990376C12.6226 0.971102 12.3417 1.0074 12.0761 1.09719C11.8104 1.18697 11.5651 1.32846 11.3543 1.51349C11.1436 1.69853 10.9715 1.92345 10.8481 2.17529L6.12425 11.6252H1.0625C0.780707 11.6252 0.510456 11.7371 0.311199 11.9364C0.111942 12.1356 0 12.4059 0 12.6877L0 16.9377C0 17.2195 0.111942 17.4897 0.311199 17.689C0.510456 17.8882 0.780707 18.0002 1.0625 18.0002H32.9375C33.2193 18.0002 33.4895 17.8882 33.6888 17.689C33.8881 17.4897 34 17.2195 34 16.9377V12.6877C34 12.4059 33.8881 12.1356 33.6888 11.9364C33.4895 11.7371 33.2193 11.6252 32.9375 11.6252Z" fill="currentColor"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1 tracking-tight">On-Time Product Delivery</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      It was not possible to renovate the two little houses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            {/* Features Content Side */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-[1px] bg-brand-gold"></div>
                  <span className="text-sm uppercase tracking-[0.4em] text-brand-gold font-bold">Our Promise</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-bold mb-8 italic tracking-tight">Why Choose Us</h3>
                <p className={`text-xl font-light max-w-2xl leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Our brand is built on <span className="text-brand-purple font-medium underline underline-offset-8 decoration-1">three pillars</span> that define everything we do.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
                {[
                  {
                    title: "Uncompromising Quality",
                    text: "Every garment is made with durable, high-grade fabrics and expert craftsmanship. We focus on details that keep your clothes looking sharp and lasting longer."
                  },
                  {
                    title: "The Premium Look",
                    text: "Each piece reflects elegance and confidence. From fabric drape to finishing touches, our designs bring a high-end aesthetic to your everyday style."
                  },
                  {
                    title: "Accessible Affordability",
                    text: "We believe luxury should be attainable. By keeping our process efficient, we offer premium fashion without the inflated price tag."
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-8 group">
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 rounded-2xl border ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} shadow-sm flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white group-hover:border-brand-purple transition-all duration-500`}>
                        <span className="text-xl font-bold tracking-tighter">0{idx + 1}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-2xl font-bold mb-4 group-hover:text-brand-purple transition-colors duration-300 tracking-tight">{feature.title}</h4>
                      <p className={`text-lg leading-relaxed font-light ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feature.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Feature Image Side */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="sticky top-12">
                <div className="relative group">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                    <img
                      src="/images/Kota Doria Sarees.jpg"
                      alt="Why Choose Sowmya Selections"
                      className="w-full h-auto object-cover max-h-[850px] transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  {/* Abstract Accents */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
                  <div className={`absolute -bottom-6 -left-6 w-32 h-32 border-2 ${theme === 'dark' ? 'border-brand-secondary/40' : 'border-brand-secondary/20'} rounded-3xl -z-10 transform -rotate-12`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
