'use client';

import { useCart } from '@/hooks/useCart';

/**
 * Component to initialize cart on app load
 * This ensures cart is loaded when user is logged in
 */
export default function CartInitializer() {
  useCart();
  return null;
}

