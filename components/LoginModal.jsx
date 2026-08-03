import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { signInUser, registerUserWithOTP } from '../src/firebase/services/authService';
import { initiateOTPVerification } from '../src/firebase/services/emailService';
import { useAdmin } from '../src/contexts/AdminContext';
import OTPVerificationModal from './OTPVerificationModal';

const LoginModal = ({ isOpen, onClose, onLoginSuccess, navigateTo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const { user } = useAdmin();

  if (!isOpen || user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await signInUser(email, password);
        console.log('Login successful:', result);

        // Check if this is the admin account
        if (email === 'admin@sowmyaselections.com') {
          console.log('Admin user detected, redirecting to admin dashboard');
          // Close modal immediately after successful authentication
          onClose();
          // Navigate to admin dashboard
          if (navigateTo) {
            navigateTo('admin');
          }
        } else {
          // Close modal immediately after successful authentication
          onClose();
          // Navigate to user dashboard for regular users
          if (navigateTo) {
            navigateTo('dashboard');
          }
        }

        // Notify parent component of successful login
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } else {
        // For registration, first send OTP and show verification modal
        try {
          await initiateOTPVerification(email);
          // Store registration data for after OTP verification
          setPendingRegistration({ email, password, displayName });
          setShowOTPModal(true);
        } catch (otpError) {
          setError('Failed to send verification email. Please try again.');
          console.error('OTP sending error:', otpError);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async (otp) => {
    if (!pendingRegistration) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await registerUserWithOTP(
        pendingRegistration.email,
        pendingRegistration.password,
        pendingRegistration.displayName,
        otp
      );

      console.log('Registration with OTP successful:', result);
      setShowOTPModal(false);
      setPendingRegistration(null);

      // Close modal after successful registration
      onClose();

      // Navigate to user dashboard for regular users
      if (navigateTo) {
        navigateTo('dashboard');
      }

      // Notify parent component of successful registration
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (error) {
      console.error('Registration with OTP error:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setShowOTPModal(false);
    setPendingRegistration(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <X size={24} />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={pendingRegistration?.email || ''}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onBackToRegister={handleBackToRegister}
      />
    </div>
  );
};

export default LoginModal;