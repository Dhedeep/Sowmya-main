import React, { useState, useEffect } from 'react';
import { Instagram, Mail, Phone, MapPin, Send, Youtube } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you! Your message has been sent successfully.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    }, 1500);
  };

  return (
    <div className="bg-white text-gray-900 font-poppins">
      {/* Page Header - Vivid 2-Column Layout */}
      <div className="bg-gray-50 border-b border-gray-100 relative overflow-hidden">
        {/* Subtle decorative elements for a 'cozy' feel */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-primary opacity-[0.02] transform skew-x-12 translate-x-12"></div>

        <div className="container mx-auto px-4 py-12 md:py-20" style={{ maxWidth: '1200px' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="md:w-3/5 text-left z-10">
              <span className="text-brand-secondary text-sm font-bold tracking-[0.2em] uppercase mb-4 block animate-fade-in">Get In Touch</span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-brand-primary mb-6 tracking-tight leading-none">
                Connect With Us
              </h1>
            </div>

            {/* Right Image - Vivid and High-End */}
            <div className="md:w-2/5 z-10 relative">
              <div className="relative group">
                {/* Decorative border behind image */}
                <div className="absolute -inset-4 border border-brand-primary/10 rounded-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500"></div>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-[1.02] border-4 border-white">
                  <img
                    src="/images/Kalamkari Sarees.jpg"
                    alt="Sowmya Selections Model"
                    className="w-full h-[450px] object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Visual accent */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              </div>
            </div>          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10" style={{ maxWidth: '1200px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left Column - Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-8 text-black border-b border-gray-100 pb-4 inline-block">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">

                {/* Office Address */}
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary bg-opacity-5 p-3 rounded-full text-brand-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Our Location</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Sowmya Selections<br />
                      Hyderabad, Telangana<br />
                      India
                    </p>
                  </div>
                </div>

                {/* Email Info */}
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary bg-opacity-5 p-3 rounded-full text-brand-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                    <p className="text-gray-500 text-sm mb-2">Typically responds within 24 hours.</p>
                    <a href="mailto:sowmyanussetty86@gmail.com" className="text-brand-primary hover:text-brand-secondary transition-colors text-sm font-medium">
                      sowmyanussetty86@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone Info */}
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary bg-opacity-5 p-3 rounded-full text-brand-primary">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone Inquiry</h4>
                    <p className="text-gray-500 text-sm mb-2">Available Mon-Sat, 10am to 7pm.</p>
                    <a href="tel:+919121006787" className="text-brand-primary hover:text-brand-secondary transition-colors text-sm font-medium">
                      +91 91210 06787
                    </a>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary bg-opacity-5 p-3 rounded-full text-brand-primary">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Instagram</h4>
                    <p className="text-gray-500 text-sm mb-2">Follow us for latest arrivals and styling tips.</p>
                    <a href="https://www.instagram.com/sowmya_selections?igsh=MTJxZHFrcW9manF4NQ==" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary transition-colors text-sm font-medium">
                      @sowmya_selections
                    </a>
                  </div>
                </div>

                {/* YouTube Info */}
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary bg-opacity-5 p-3 rounded-full text-brand-primary">
                    <Youtube size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">YouTube Channel</h4>
                    <p className="text-gray-500 text-sm mb-2">Subscribe for product sarees and collection details.</p>
                    <a href="https://www.youtube.com/@sowmyaselections" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary transition-colors text-sm font-medium">
                      Sowmya Selections
                    </a>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl z-10">
            <h2 className="text-2xl font-bold mb-2 text-black">Send a Message</h2>
            <p className="text-gray-500 text-sm mb-10">We would love to hear from you. Please fill out the form below.</p>

            {submitMessage && (
              <div className="mb-8 p-4 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm flex items-center space-x-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{submitMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                  <label className="absolute left-0 top-3 text-gray-400 text-xs font-semibold tracking-widest uppercase pointer-events-none transition-all peer-focus:top-[-12px] peer-focus:text-brand-primary peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-brand-primary">
                    Full Name *
                  </label>
                </div>

                {/* Email Field */}
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                  <label className="absolute left-0 top-3 text-gray-400 text-xs font-semibold tracking-widest uppercase pointer-events-none transition-all peer-focus:top-[-12px] peer-focus:text-brand-primary peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-brand-primary">
                    Email Address *
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Field */}
                <div className="relative group">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                  <label className="absolute left-0 top-3 text-gray-400 text-xs font-semibold tracking-widest uppercase pointer-events-none transition-all peer-focus:top-[-12px] peer-focus:text-brand-primary peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-brand-primary">
                    Phone Number
                  </label>
                </div>

                {/* Subject Field */}
                <div className="relative group">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                  <label className="absolute left-0 top-3 text-gray-400 text-xs font-semibold tracking-widest uppercase pointer-events-none transition-all peer-focus:top-[-12px] peer-focus:text-brand-primary peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-brand-primary">
                    Subject *
                  </label>
                </div>
              </div>

              {/* Message Field */}
              <div className="relative group pt-4">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder=" "
                  className="peer w-full bg-transparent border border-gray-100 rounded-xl p-4 focus:border-brand-primary outline-none transition-all text-sm resize-none"
                ></textarea>
                <label className="absolute left-4 top-8 text-gray-400 text-xs font-semibold tracking-widest uppercase pointer-events-none transition-all peer-focus:top-[-4px] peer-focus:bg-white peer-focus:px-2 peer-focus:text-brand-primary peer-not-placeholder-shown:top-[-4px] peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-2 peer-not-placeholder-shown:text-brand-primary">
                  Your Message *
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-[#4a0a46] text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-900/10 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <span className="tracking-widest uppercase text-sm">Processing...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span className="tracking-widest uppercase text-sm">Send Inquiry</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-50 text-center">
              <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-tighter">
                By submitting this form, you agree to our <a href="/privacy-policy" className="underline hover:text-brand-primary">Privacy Policy</a> and <a href="/terms-conditions" className="underline hover:text-brand-primary">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ContactPage;