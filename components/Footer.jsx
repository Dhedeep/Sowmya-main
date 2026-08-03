import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';
import { Mail, Phone, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <footer className={`py-8 ${theme === 'dark' ? 'bg-black text-gray-300' : 'bg-white text-gray-700'}`}>
      {/* Simple decorative line above footer */}
      <div className={`h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

      <div className="container mx-auto px-4 pt-6" style={{ maxWidth: '1290px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Column 1 - Logo & Description */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center md:justify-start">
              <a href="/" className="inline-block">
                <img
                  src="/images/Logo.png"
                  alt="Sowmya Selections"
                  className="h-auto w-48 lg:w-56"
                />
              </a>
            </div>

            <p className={`text-xs leading-relaxed text-center md:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Receive offers, product alerts, styling inspiration and more. By signing up, you agree to our Privacy Policy.
            </p>
          </div>

          {/* Column 2 - Other Pages */}
          <div className="lg:pl-8">
            <h2 className={`text-sm font-semibold mb-4 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Other Pages</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h2 className={`text-sm font-semibold mb-4 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Support</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/returns-policy" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}>
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Links */}
          <div className="space-y-4">
            <h2 className={`text-sm font-semibold mb-4 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Contact Links</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 group">
                <Instagram size={18} className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} group-hover:text-brand-primary transition-colors`} />
                <a
                  href="https://www.instagram.com/sowmya_selections?igsh=MTJxZHFrcW9manF4NQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}
                >
                  @sowmya_selections
                </a>
              </div>

              <div className="flex items-center space-x-3 group">
                <Mail size={18} className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} group-hover:text-brand-primary transition-colors`} />
                <a
                  href="mailto:sowmyanussetty86@gmail.com"
                  className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}
                >
                  sowmyanussetty86@gmail.com
                </a>
              </div>

              <div className="flex items-center space-x-3 group">
                <Phone size={18} className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} group-hover:text-brand-primary transition-colors`} />
                <a
                  href="tel:+919121006787"
                  className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}
                >
                  +91 9121006787
                </a>
              </div>

              <div className="flex items-center space-x-3 group">
                <Youtube size={18} className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} group-hover:text-brand-primary transition-colors`} />
                <a
                  href="https://www.youtube.com/@sowmyaselections"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}
                >
                  Sowmya Selections
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom line with copyright */}
        <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2025 Sowmya Selections. All rights reserved. | Crafted with passion for timeless fashion
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;