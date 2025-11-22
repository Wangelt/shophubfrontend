'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAuthFromStorage } from '@/store/authSlice';
import { mergeGuestCartToUserCart } from '@/utils/mergeCart';

/**
 * Component to initialize auth state on app load
 * This ensures auth state is checked from localStorage on client mount
 */
export default function AuthInitializer() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Check authentication status from localStorage on client mount
    dispatch(refreshAuthFromStorage());
  }, [dispatch]);

  // Merge guest cart when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Small delay to ensure cart is loaded first
      const timer = setTimeout(() => {
        mergeGuestCartToUserCart().catch(err => {
          console.error('Failed to merge guest cart:', err);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  return null;
}

