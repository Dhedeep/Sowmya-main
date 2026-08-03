import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import ReturnsPolicySection from '../components/ReturnsPolicySection';

const ReturnsPolicyPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`}>
      <ReturnsPolicySection />
    </div>
  );
};

export default ReturnsPolicyPage;