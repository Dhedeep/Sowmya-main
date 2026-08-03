import React, { useContext } from 'react';
import { ThemeContext } from '../App';

const PrivacyPolicySection = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`} style={{ fontFamily: "'Poppins', sans-serif", lineHeight: '1.6', padding: '20px' }}>
      <div className="container mx-auto" style={{ maxWidth: '1000px', padding: '20px' }}>
        <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', textAlign: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: `2px solid ${theme === 'dark' ? 'var(--brand-primary)' : 'var(--brand-secondary)'}` }}>
          Privacy Policy – Sowmya Selections
        </h1>

        <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
          At Sowmya Selections, we respect your privacy and are committed to protecting the personal information you share with us. All data collected through our website is handled securely and used only to provide a safe and smooth shopping experience.
        </p>

        <div className="section" style={{ marginBottom: '40px' }}>
          <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.7rem, 4vw, 2rem)', marginTop: '30px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${theme === 'dark' ? 'var(--brand-primary)' : 'var(--brand-secondary)'}` }}>
            Key Points:
          </h2>

          <ul style={{ paddingLeft: '25px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>SSL Encryption:</span>
              All personal and payment information is protected using SSL encryption
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Authorized Access Only:</span>
              Customer data is accessible only to authorized personnel
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Data Collection:</span>
              We collect details like name, contact number, email, address, and payment method only to process orders
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Trusted Partners:</span>
              Information may be shared with trusted partners (payment gateways, delivery services) strictly for order fulfillment
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Marketing Communications:</span>
              With your consent, we may contact you regarding orders or promotions (opt-out anytime)
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Cookies:</span>
              Cookies are used to improve website functionality and user experience
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Analytics:</span>
              Anonymous server data may be collected for analytics and service improvement
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Third-Party Websites:</span>
              We are not responsible for privacy practices of third-party websites
            </li>
            <li style={{ marginBottom: '15px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Policy Updates:</span>
              Policy updates will be posted on this page as needed
            </li>
          </ul>
        </div>

        <div className="section" style={{ marginBottom: '40px' }}>
          <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.7rem, 4vw, 2rem)', marginTop: '30px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${theme === 'dark' ? 'var(--brand-primary)' : 'var(--brand-secondary)'}` }}>
            Contact Us:
          </h2>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ marginBottom: '10px' }}>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Email:</span>
              <a href="mailto:sowmyanusetty86@gmail.com" style={{ color: theme === 'dark' ? 'var(--brand-accent)' : 'var(--brand-primary)', textDecoration: 'none', marginLeft: '8px' }}>
                sowmyanusetty86@gmail.com
              </a>
            </p>
            <p>
              <span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Phone:</span>
              <a href="tel:+919121006787" style={{ color: theme === 'dark' ? 'var(--brand-accent)' : 'var(--brand-primary)', textDecoration: 'none', marginLeft: '8px' }}>
                +91-9121006787
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicySection;