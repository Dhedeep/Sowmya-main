import React, { useState, useEffect } from 'react';
import { X, Mail, RefreshCw } from 'lucide-react';
import { verifyOTP, initiateOTPVerification } from '../src/firebase/services/emailService';

const OTPVerificationModal = ({
  isOpen,
  onClose,
  email,
  onVerificationSuccess,
  onBackToRegister
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(35); // Initialized to 35 seconds as requested
  const [canResend, setCanResend] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }

    setOtp(newOtp);

    // Focus on the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    setTimeout(() => {
      const input = document.getElementById(`otp-${focusIndex}`);
      if (input) input.focus();
    }, 0);
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const otpString = otp.join('');
    console.log('OTP Array:', otp);
    console.log('OTP String:', otpString);
    console.log('OTP Length:', otpString.length);
    console.log('Email for verification:', email);

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyOTP(email, otpString, false);
      if (result.valid) {
        onVerificationSuccess(otpString);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      await initiateOTPVerification(email);
      setTimeLeft(35); // Reset timer to 35 seconds as requested
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setError('');

      // Focus on first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 0);
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full mb-4">
              <Mail className="w-8 h-8 text-brand-primary dark:text-brand-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a 6-digit code to
            </p>
            <p className="font-medium text-gray-900 dark:text-white">{email}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-4 text-center">
                Enter OTP Code
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-brand-primary dark:focus:border-brand-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="mb-4 text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Code expires in <span className="font-medium">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Code has expired
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
              className="text-sm text-brand-primary dark:text-brand-secondary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2"
            >
              <RefreshCw size={16} />
              {canResend ? 'Resend Code' : `Resend available in ${formatTime(timeLeft)}`}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBackToRegister}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Back to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;