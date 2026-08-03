import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../App';
import { Page } from '../types';
import { useAdmin } from '../src/contexts/AdminContext';
import { signOutUser } from '../src/firebase/services/authService';
import { Search, User, Heart, ShoppingCart, Menu, X, Sun, Moon, Bell, Settings } from 'lucide-react';

const Header = ({ navigateTo, openLoginModal, openWishlist, wishlistCount, cartCount = 0, user, setUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isAdmin } = useAdmin();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'New Arrivals', path: '/shop?category=new-arrivals' },
    { name: 'Contact', path: '/contact' },
  ];


  const accountLinks = user ? [
    ...(isAdmin ? [
      { name: 'Admin Dashboard', path: '/admin' },

    ] : [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Orders', path: '/orders' },
      { name: 'Addresses', path: '/addresses' },
      { name: 'Account details', path: '/account-details' },
    ]),
    { name: 'Log out', path: 'logout' },
  ] : [
    { name: 'Login', path: '/login' },
    { name: 'Create Account', path: '/register' },
  ];

  return (
    <>

      {/* Main Header */}
      <header className={`${theme === 'dark' ? 'bg-black text-white border-gray-700' : 'bg-white text-black border-gray-200'} sticky top-0 z-40 shadow-sm`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center py-1">
            {/* Mobile: Hamburger on the far left */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-800"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo - left on desktop, center on mobile */}
            <div className="flex-1 flex items-center justify-center lg:justify-start">
              <Link to="/" className="cursor-pointer">
                <img
                  src="/images/Logo.png"
                  alt="Sowmya Selections"
                  className="h-16 lg:h-28 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation links centered perfectly */}
            <nav className="hidden lg:flex items-center justify-center space-x-10">
              {navLinks.map(link => (
                <div
                  key={link.name}
                  className="relative group"
                >
                  <Link
                    to={link.path}
                    className={`text-[16px] font-semibold uppercase tracking-widest transition-all duration-300 flex items-center py-2 ${(location.pathname + location.search === link.path || location.pathname === link.path)
                      ? 'text-brand-primary'
                      : 'text-gray-800 hover:text-brand-primary'
                      }`}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Actions on the right */}
            <div className="flex-1 flex items-center justify-end space-x-2 lg:space-x-5">

              <button onClick={openWishlist} className={`relative p-2 rounded-full hover:bg-gray-100 text-gray-800`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 17 15" fill="none" className="text-current">
                  <path d="M15.3125 1.03117C17.6563 2.99992 17.3125 6.21867 15.6563 7.93742L10.1563 13.5312C9.84377 13.8437 9.43752 14.0312 9.00002 14.0312C8.53127 14.0312 8.12502 13.8437 7.81252 13.5312L2.34377 7.93742C0.656273 6.21867 0.312523 2.99992 2.65627 1.03117C4.46877 -0.500077 7.25002 -0.281327 9.00002 1.49992C10.7188 -0.281327 13.5 -0.500077 15.3125 1.03117ZM14.5625 6.87492C15.7188 5.71867 15.9375 3.53117 14.3438 2.15617C13.125 1.15617 11.25 1.31242 10.0938 2.49992L9.00002 3.62492L7.90627 2.49992C6.71877 1.31242 4.84377 1.15617 3.62502 2.18742C2.03127 3.53117 2.25002 5.71867 3.40627 6.87492L8.87502 12.4687C8.96877 12.5312 9.03127 12.5312 9.09377 12.4687L14.5625 6.87492Z" fill="currentColor"></path>
                </svg>
                {wishlistCount > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-brand-secondary text-white text-xs rounded-full flex items-center justify-center">{wishlistCount}</span>}
              </button>

              <button
                onClick={() => navigateTo('checkout')}
                className={`relative p-2 rounded-full hover:bg-gray-100 text-gray-800`}
                title="View Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 18 14" fill="none" className="text-current">
                  <path d="M17.625 4.99992C17.8125 4.99992 18 5.18742 18 5.37492V6.12492C18 6.34367 17.8125 6.49992 17.625 6.49992H17.0312L16.1562 12.7187C16.0625 13.4687 15.4375 13.9999 14.6875 13.9999H3.28125C2.53125 13.9999 1.90625 13.4687 1.8125 12.7187L0.9375 6.49992H0.375C0.15625 6.49992 0 6.34367 0 6.12492V5.37492C0 5.18742 0.15625 4.99992 0.375 4.99992H2.625L6.65625 0.281169C6.9375 -0.0313314 7.40625 -0.0625814 7.71875 0.187419C8.03125 0.468669 8.0625 0.937419 7.8125 1.24992L4.59375 4.99992H13.375L10.1562 1.24992C9.90625 0.937419 9.9375 0.468669 10.25 0.187419C10.5625 -0.0625814 11.0312 -0.0313314 11.3125 0.281169L15.3438 4.99992H17.625ZM14.6875 12.4999L15.5 6.49992H2.46875L3.28125 12.4999H14.6875ZM9.75 8.24992V10.7499C9.75 11.1874 9.40625 11.4999 9 11.4999C8.5625 11.4999 8.25 11.1874 8.25 10.7499V8.24992C8.25 7.84367 8.5625 7.49992 9 7.49992C9.40625 7.49992 9.75 7.84367 9.75 8.24992ZM13.25 8.24992V10.7499C13.25 11.1874 12.9062 11.4999 12.5 11.4999C12.0625 11.4999 11.75 11.1874 11.75 10.7499V8.24992C11.75 7.84367 12.0625 7.49992 12.5 7.49992C12.9062 7.49992 13.25 7.84367 13.25 8.24992ZM6.25 8.24992V10.7499C6.25 11.1874 5.90625 11.4999 5.5 11.4999C5.0625 11.4999 4.75 11.1874 4.75 10.7499V8.24992C4.75 7.84367 5.0625 7.49992 5.5 7.49992C5.90625 7.49992 6.25 7.84367 6.25 8.24992Z" fill="currentColor"></path>
                </svg>
                <span className={`absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full flex items-center justify-center border bg-brand-primary text-white border-brand-primary`}>{cartCount}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className={`text-gray-900 hover:text-brand-primary transition-colors flex items-center space-x-1`}
                >
                  <User size={24} />

                </button>
                {isAccountMenuOpen && (
                  <div className={`absolute top-full right-0 mt-1 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-md shadow-lg z-50 min-w-[200px]`}>
                    {user && (
                      <div className="px-4 py-2 border-b text-sm border-gray-200 text-gray-600">
                        {user.email}
                      </div>
                    )}
                    {accountLinks.map((link, index) => {
                      if (link.page === 'separator') {
                        return <hr key={index} className="my-1 border-gray-200" />;
                      }

                      return (
                        <button
                          key={link.name}
                          onClick={async () => {
                            if (link.path === 'logout') {
                              try {
                                setIsAccountMenuOpen(false);
                                onLogout();
                              } catch (error) {
                                console.error('Logout error:', error);
                              }
                            } else if (link.path === '/login' || link.path === '/register') {
                              setIsAccountMenuOpen(false);
                              openLoginModal();
                            } else {
                              navigateTo(link.path.replace('/', ''));
                              setIsAccountMenuOpen(false);
                            }
                          }}
                          className={`block w-full text-left px-4 py-2 transition-colors hover:bg-gray-100 ${isAdmin && (link.name.includes('Manage') || link.name.includes('Admin Dashboard'))
                            ? 'text-brand-primary font-medium'
                            : ''
                            }`}
                        >
                          {link.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>


            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden pb-4">
              <div className="relative mb-4">
                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none bg-white text-gray-900 border-gray-300 focus:border-brand-primary" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <nav className="flex flex-col space-y-2">
                {navLinks.map(link => (
                  <div key={link.name}>
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-left block py-2 px-3 rounded-md text-[16px] text-gray-800 hover:bg-gray-100 ${(location.pathname + location.search === link.path || location.pathname === link.path) ? 'font-bold text-brand-primary' : ''
                        }`}
                    >
                      {link.name}
                    </Link>
                  </div>
                ))}
              </nav>
              <div className="border-t mt-4 pt-4 flex space-x-4 border-gray-200">
                <button onClick={openLoginModal} className="flex-1 py-2 px-4 border rounded-md border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors">Login / Signup</button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;