import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCart } from '@/services/userservices';
import { setCart } from '@/store/cartSlice';

/**
 * Hook to initialize and manage cart state
 * Call this in your root layout or app component
 */
export function useCart() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const cart = useSelector((state) => state.cart.cart);

  useEffect(() => {
    // Only run if user is logged in and cart is not already loaded
    if (!isLoggedIn || cart) {
      return;
    }

    // Load cart when user is logged in and cart is not loaded
    const loadCart = async () => {
      try {
        const response = await getCart();
        // Handle ApiResponse structure: response is ApiResponse object from service
        // ApiResponse has: { statusCode, data, message, success }
        // The actual cart data is in response.data
        const cartData = response?.data || response;
        
        // Only dispatch if we have valid cart data and action exists
        if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
          try {
            dispatch(setCart(cartData));
          } catch (dispatchError) {
            console.error('Error dispatching setCart:', dispatchError);
          }
        }
      } catch (error) {
        // Silently fail - cart will be loaded when needed
        console.error('Failed to load cart:', error);
      }
    };
    
    loadCart();
  }, [isLoggedIn, cart, dispatch]);

  return { cart };
}

