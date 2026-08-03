import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import PrivacyPolicySection from '../components/PrivacyPolicySection';

const PrivacyPolicyPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`}>
      <PrivacyPolicySection />
    </div>
  );
};

export default PrivacyPolicyPage;