import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, checkIsAdmin } from '../firebase/services/authService';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async ({ user: authUser, userData: authUserData }) => {
      console.log('Auth state changed:', { user: authUser?.email, userData: authUserData });
      setUser(authUser);
      setUserData(authUserData);

      if (authUser) {
        try {
          // Special case for primary admin - always grant admin access
          if (authUser.email === 'admin@sowmyaselections.com') {
            console.log('Primary admin email detected, granting admin access');
            setIsAdmin(true);
          } else {
            // For other users, check admin status
            let adminStatus = false;
            if (authUserData && authUserData.isAdmin !== undefined) {
              adminStatus = authUserData.isAdmin;
            } else {
              adminStatus = await checkIsAdmin(authUser);
            }
            console.log('Admin status for', authUser.email, ':', adminStatus);
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          // For primary admin, still grant access even if there's an error
          if (authUser.email === 'admin@sowmyaselections.com') {
            console.log('Error occurred but primary admin email detected, granting admin access');
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to manually set user (for login modal callback)
  const manualSetUser = (authUser) => {
    setUser(authUser);
  };

  const value = {
    isAdmin,
    isLoading,
    user,
    userData,
    setIsAdmin,
    setUser: manualSetUser
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};