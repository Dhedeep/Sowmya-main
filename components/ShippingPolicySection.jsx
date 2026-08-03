import React, { useContext } from 'react';
import { ThemeContext } from '../App';

const ShippingPolicySection = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`} style={{ fontFamily: "'Poppins', sans-serif", lineHeight: '1.6', padding: '20px' }}>
      <div className="container mx-auto" style={{ maxWidth: '1000px', padding: '20px' }}>
        <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', textAlign: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: `2px solid ${theme === 'dark' ? '#444' : '#ddd'}` }}>
          Delivery / Shipping Policy – Sowmya Selections
        </h1>
        <p style={{ marginBottom: '40px' }}>At Sowmya Selections, we aim to deliver your orders safely and on time.</p>

        <div className="section" style={{ marginBottom: '40px' }}>
          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Domestic Shipping (India)
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}>We offer FREE delivery across India</li>
              <li style={{ marginBottom: '10px' }}>Orders are usually delivered within 7–10 working days after dispatch</li>
              <li style={{ marginBottom: '10px' }}>Delivery timelines may vary based on location and courier service availability</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              International Shipping
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}>We ship worldwide</li>
              <li style={{ marginBottom: '10px' }}>International shipping charges are calculated based on destination country and package weight, as charged by our delivery partners</li>
              <li style={{ marginBottom: '10px' }}>Overseas orders are usually delivered within 1–2 weeks after dispatch (may vary due to customs and location)</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Delivery Partners
            </h3>
            <p style={{ marginBottom: '15px' }}>Our primary delivery partners are:</p>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}>DTDC</li>
              <li style={{ marginBottom: '10px' }}>Indian Speed Post</li>
            </ul>
            <p style={{ marginBottom: '15px' }}>Courier partner selection depends on the customer's location and service availability.</p>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Tracking & Delivery Support
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}>Tracking details will be shared once the order is shipped</li>
              <li style={{ marginBottom: '10px' }}>If you do not receive your order within the estimated time after dispatch, please:</li>
            </ul>
            <ul style={{ paddingLeft: '45px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}>Check the tracking number, or</li>
              <li style={{ marginBottom: '10px' }}>Contact our support team</li>
            </ul>
            <p style={{ marginBottom: '15px' }}>We will take responsibility and assist you in resolving the issue.</p>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Contact Us
            </h3>
            <p style={{ marginBottom: '15px' }}>For any delivery-related queries, please contact us at:</p>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}>Email: sowmyanussetty86@gmail.com</li>
              <li style={{ marginBottom: '10px' }}>Phone: +91-9121006787</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicySection;