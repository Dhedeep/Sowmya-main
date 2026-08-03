import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import TermsConditionsSection from '../components/TermsConditionsSection';

const TermsConditionsPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`}>
      <TermsConditionsSection />
    </div>
  );
};

export default TermsConditionsPage;