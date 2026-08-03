import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import ShippingPolicySection from '../components/ShippingPolicySection';

const ShippingPolicyPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`}>
      <ShippingPolicySection />
    </div>
  );
};

export default ShippingPolicyPage;