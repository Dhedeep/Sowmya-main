import React, { useContext } from 'react';
import { ThemeContext } from '../App';

const TermsConditionsSection = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`} style={{ fontFamily: "'Poppins', sans-serif", lineHeight: '1.6', padding: '20px' }}>
      <div className="container mx-auto" style={{ maxWidth: '1000px', padding: '20px' }}>
        <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', textAlign: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: `2px solid ${theme === 'dark' ? 'var(--brand-primary)' : 'var(--brand-secondary)'}` }}>
          Sowmya Selections Terms & Conditions
        </h1>
        <p style={{ marginBottom: '40px' }}>By accessing or using this website, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before placing an order.</p>

        <div className="section" style={{ marginBottom: '40px' }}>
          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              General
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Pricing:</span> All prices are listed in INR and may change without prior notice</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Order Rights:</span> We reserve the right to refuse or cancel any order at our discretion</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Legal Eligibility:</span> By using this website, you confirm that you are legally eligible to enter into a binding contract</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Products & Pricing
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Handcrafted Nature:</span> Products are handcrafted or hand-finished; minor variations in color, weave, or print are natural and not defects</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Product Images:</span> Product images are for reference only; actual colors may vary due to lighting or screen settings</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Availability:</span> Availability and pricing are subject to change without notice</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Orders & Payments
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Order Confirmation:</span> Orders are confirmed only after successful payment</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Payment Processing:</span> Payments are processed securely through trusted third-party payment gateways</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Payment Issues:</span> We are not responsible for payment failures or technical issues caused by payment providers</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Transparent Pricing:</span> All product prices are displayed clearly on the website with no hidden charges</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Netbanking Availability:</span> Netbanking payment option is available for all orders</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Payment Methods:</span> We accept all major payment methods including:
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  <li style={{ marginBottom: '5px' }}>UPI</li>
                  <li style={{ marginBottom: '5px' }}>Netbanking (All major banks)</li>
                  <li style={{ marginBottom: '5px' }}>Debit & Credit Cards</li>
                  <li style={{ marginBottom: '5px' }}>Wallets (Paytm, PhonePe, Amazon Pay, etc.)</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Shipping & Delivery
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Delivery Timelines:</span> Delivery timelines are estimates and may vary due to courier delays, weather conditions, or unforeseen circumstances</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Delay Responsibility:</span> Sowmya Selections is not responsible for delays beyond our control</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Returns, Refunds & Cancellations
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Return Policy:</span> Returns are accepted only for damaged or defective items, as per our Return & Refund Policy</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Damage Claims:</span> Parcel opening video is mandatory for any damage claim</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Cancellation Policy:</span> No cancellations are allowed once the order is placed</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Intellectual Property
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Content Ownership:</span> All content on this website, including images, text, logos, and designs, is the property of Sowmya Selections</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Usage Restrictions:</span> Unauthorized use, reproduction, or distribution is strictly prohibited</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Limitation of Liability
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Indirect Damages:</span> We are not liable for any indirect, incidental, or consequential damages arising from the use of our website or products</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Maximum Liability:</span> Our maximum liability is limited to the total amount paid for the order</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Governing Law
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Applicable Law:</span> These Terms & Conditions are governed by the laws of India</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Jurisdiction:</span> Any disputes shall be subject to the jurisdiction of Indian courts</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Changes to Terms
            </h3>
            <ul style={{ paddingLeft: '25px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Updates:</span> We may update these Terms & Conditions at any time without prior notice</li>
              <li style={{ marginBottom: '10px' }}><span className="highlight" style={{ color: 'var(--brand-accent)', fontWeight: 'bold' }}>Acceptance:</span> Continued use of the website implies acceptance of the updated terms</li>
            </ul>
          </div>

          <div className="subsection" style={{ marginBottom: '25px' }}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginTop: '30px', marginBottom: '20px' }}>
              Contact Us
            </h3>
            <p style={{ marginBottom: '15px' }}>For any questions or concerns, please contact us at:</p>
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

export default TermsConditionsSection;