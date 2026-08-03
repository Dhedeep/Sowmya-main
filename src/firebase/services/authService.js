import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config';
import { verifyOTP } from './emailService';

// Sign in user
export const signInUser = async (email, password) => {
  try {
    console.log('Attempting to sign in user:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User authenticated successfully:', user.uid);

    // Get user data from Firestore with timeout
    try {
      const userDoc = await Promise.race([
        getDoc(doc(db, 'users', user.uid)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 3000)
        )
      ]);
      const userData = userDoc.data();
      console.log('User data retrieved:', userData);
      return { user, userData };
    } catch (firestoreError) {
      console.warn('Could not retrieve user data from Firestore:', firestoreError.message);
      // Return user without userData if Firestore fails
      return { user, userData: null };
    }
  } catch (error) {
    console.error('Sign in error:', error.code, error.message);
    throw error;
  }
};

// Register new user with OTP verification
export const registerUserWithOTP = async (email, password, displayName, otp, isAdmin = false) => {
  try {
    console.log('registerUserWithOTP called with:', { email, displayName, otp, otpLength: otp?.length });
    // First verify the OTP and delete it after successful verification
    const otpVerification = await verifyOTP(email, otp, true);
    console.log('OTP verification result:', otpVerification);
    if (!otpVerification.valid) {
      throw new Error(otpVerification.message);
    }

    // If OTP is valid, proceed with registration
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Save user data to Firestore with email verified flag
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      displayName,
      isAdmin,
      emailVerified: true,
      createdAt: new Date(),
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });

    return { user, isAdmin };
  } catch (error) {
    throw error;
  }
};

// Register new user (legacy function without OTP)
export const registerUser = async (email, password, displayName, isAdmin = false) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      displayName,
      isAdmin,
      createdAt: new Date(),
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });

    return { user, isAdmin };
  } catch (error) {
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Monitor auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed in onAuthStateChange:', user ? user.email : 'No user');
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        console.log('User data from Firestore:', userData);

        // Special case for primary admin user - ensure document exists with admin status
        if (user.email === 'admin@sowmyaselections.com') {
          if (!userDoc.exists() || !userData?.isAdmin) {
            console.log('Creating/updating primary admin user document in Firestore');
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: userData?.displayName || 'Admin User',
              isAdmin: true,
              createdAt: userData?.createdAt || new Date(),
              memberSince: userData?.memberSince || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              updatedAt: new Date()
            }, { merge: true });

            // Get the updated document
            const updatedDoc = await getDoc(doc(db, 'users', user.uid));
            callback({ user, userData: updatedDoc.data() });
            return;
          }
        }

        callback({ user, userData });
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback({ user, userData: null });
      }
    } else {
      console.log('User signed out');
      callback({ user: null, userData: null });
    }
  });
};

// Update user password
export const updateUserPassword = async (user, currentPassword, newPassword) => {
  try {
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    // Create credential with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    // Re-authenticate user with current password
    await reauthenticateWithCredential(user, credential);

    // Update password with new password
    await updatePassword(user, newPassword);

    console.log('Password updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);

    // Handle specific error cases
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Please choose a stronger password');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later');
    } else {
      throw new Error('Failed to update password. Please try again');
    }
  }
};

// Check if current user is admin
export const checkIsAdmin = async (user) => {
  if (!user) return false;

  // Special case for primary admin - always return true
  if (user.email === 'admin@sowmyaselections.com') {
    console.log('Primary admin email detected in checkIsAdmin, returning true');
    return true;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    return userData?.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};