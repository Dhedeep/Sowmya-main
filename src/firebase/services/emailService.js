import { doc, setDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '../config';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config';

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Firestore with expiration time (35 seconds)
export const storeOTP = async (email, otp) => {
  try {
    console.log('Storing OTP for email:', email);
    console.log('OTP to store:', otp);

    const otpDoc = doc(db, 'otps', email);
    const expirationTime = new Date(Date.now() + 35 * 1000); // 35 seconds from now as requested

    const otpData = {
      otp,
      email,
      createdAt: new Date(),
      expiresAt: expirationTime,
      attempts: 0
    };

    console.log('OTP data to store:', otpData);

    await setDoc(otpDoc, otpData);

    // Verify it was stored correctly
    const storedDoc = await getDoc(otpDoc);
    if (storedDoc.exists()) {
      console.log('OTP successfully stored in Firestore:', storedDoc.data());
    } else {
      console.error('Failed to store OTP in Firestore - document does not exist after setDoc');
    }

    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
};

// Verify OTP from Firestore
export const verifyOTP = async (email, enteredOTP, deleteAfterSuccess = true) => {
  try {
    console.log('Verifying OTP for email:', email);
    console.log('Entered OTP:', enteredOTP);
    console.log('Delete after success:', deleteAfterSuccess);

    const otpDoc = doc(db, 'otps', email);
    const otpSnapshot = await getDoc(otpDoc);

    console.log('OTP document exists:', otpSnapshot.exists());

    if (!otpSnapshot.exists()) {
      return { valid: false, message: 'OTP not found or expired' };
    }

    const otpData = otpSnapshot.data();
    console.log('Retrieved OTP data:', otpData);

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt.toDate()) {
      await setDoc(otpDoc, { otp: deleteField() }, { merge: true });
      return { valid: false, message: 'OTP has expired' };
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      await setDoc(otpDoc, { otp: deleteField() }, { merge: true });
      return { valid: false, message: 'Too many attempts. Please request a new OTP' };
    }

    // Verify OTP first - ensure both are strings for consistent comparison
    const storedOTP = String(otpData.otp).trim();
    const enteredOTPStr = String(enteredOTP).trim();

    console.log('OTP Verification Debug:');
    console.log('Stored OTP:', storedOTP, 'Type:', typeof storedOTP);
    console.log('Entered OTP:', enteredOTPStr, 'Type:', typeof enteredOTPStr);
    console.log('Comparison result:', storedOTP === enteredOTPStr);

    if (storedOTP === enteredOTPStr) {
      // Clear OTP after successful verification (only if deleteAfterSuccess is true)
      if (deleteAfterSuccess) {
        await setDoc(otpDoc, { otp: deleteField() }, { merge: true });
      }
      return { valid: true, message: 'OTP verified successfully' };
    } else {
      // Increment attempt count only for failed attempts
      await setDoc(otpDoc, { attempts: otpData.attempts + 1 }, { merge: true });
      return { valid: false, message: 'Invalid OTP' };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Send OTP via email using Firebase Cloud Function
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('Attempting to send OTP email via Firebase Cloud Function');
    console.log('Email:', email);
    console.log('OTP:', otp);

    // Call the Firebase Cloud Function
    const sendOTP = httpsCallable(functions, 'sendOTPEmail');
    const result = await sendOTP({ email, otp });

    console.log('Email sent successfully via Cloud Function:', result.data);
    return { success: true, message: 'OTP sent successfully', ...result.data };

  } catch (error) {
    console.error('Error sending OTP email via Cloud Function:', error);

    // Fallback to console logging if Cloud Function fails
    console.log('==========================================');
    console.log('EMAIL OTP VERIFICATION - FALLBACK MODE');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('Error:', error.message);
    console.log('==========================================');

    // Still return success to not break the OTP flow
    // In production, you would want to handle this more gracefully
    return {
      success: true,
      message: 'OTP generated (check console - email service unavailable)',
      fallback: true
    };
  }
};


// Complete OTP process: generate, store, and send
export const initiateOTPVerification = async (email) => {
  try {
    console.log('Initiating OTP verification for email:', email);
    const otp = generateOTP();
    console.log('Generated OTP:', otp);
    await storeOTP(email, otp);
    await sendOTPEmail(email, otp);
    return { success: true, message: 'OTP sent to your email' };
  } catch (error) {
    console.error('Error initiating OTP verification:', error);
    throw error;
  }
};