import React, { useContext } from 'react';
import { ThemeContext } from '../App';

const ReturnsPolicySection = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`} style={{ fontFamily: "'Poppins', sans-serif", lineHeight: '1.6', padding: '20px' }}>
      <div className="container mx-auto" style={{ maxWidth: '1000px', padding: '20px' }}>
        <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', textAlign: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: `2px solid ${theme === 'dark' ? 'var(--brand-primary)' : 'var(--brand-secondary)'}` }}>
          Sowmya Selections Return & Refund Policy
        </h1>
        <p style={{ marginBottom: '40px' }}>At Sowmya Selections, we take great care in delivering quality products. Due to the nature of handcrafted and curated items, slight variations in color, weave, or finish are natural and not considered defects.</p>

        <div className="section" style={{ marginBottom: '40px' }}>
          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Returns & Refunds
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Returns:</span> Returns are accepted only for defective or physically damaged products</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Video Requirement:</span> An uncut parcel opening video is mandatory for any damage claim</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Time Limit:</span> Claims must be raised within 48 hours of delivery</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Video Policy:</span> Requests without an opening video will not be accepted</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Refund Timeline:</span> Refunds are processed to the original payment method within 7–10 business days after inspection</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Exchanges
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Product Restrictions:</span> No exchanges for sarees, fabrics, or unstitched products</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Size Exchange:</span> Size exchange allowed only for ready-made suits</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Time Limit:</span> Exchange request must be raised within 48 hours</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Return Charge:</span> A ₹100 return charge applies</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Stock Availability:</span> Exchanges are subject to stock availability (alternative or store credit may be offered)</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Non-Returnable Items
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Sale Items:</span> Sale or clearance items</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Custom Products:</span> Customized or made-to-order products</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Used Items:</span> Used, altered, or washed items</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Cancellations
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Cancellation Policy:</span> Orders cannot be cancelled once placed</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              International Orders
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Return Conditions:</span> Returns accepted only for defective or damaged items</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Shipping Cost:</span> Return shipping must be borne by the customer</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Refund Process:</span> Refunds initiated after inspection</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Contact Us
            </h3>
            <p style={{ marginBottom: '15px' }}>For return or refund requests, contact us at:</p>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Email:</span> sowmyanussetty86@gmail.com</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Phone:</span> +91-9121006787</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicySection;