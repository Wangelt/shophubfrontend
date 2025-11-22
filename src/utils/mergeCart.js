/**
 * Merge guest cart with user cart
 * This function merges items from guest cart into the user's account cart
 */

import { getGuestCartItems, clearGuestCartAfterMerge } from './guestCart';
import { addItemToCart } from '@/services/userservices';

/**
 * Merge guest cart items into user cart
 * @returns {Promise<boolean>} Success status
 */
export const mergeGuestCartToUserCart = async () => {
  try {
    const guestItems = getGuestCartItems();
    
    if (!guestItems || guestItems.length === 0) {
      return true; // No items to merge
    }

    // Add each guest cart item to user cart
    for (const item of guestItems) {
      try {
        await addItemToCart({
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (error) {
        console.error(`Failed to add product ${item.productId} to cart:`, error);
        // Continue with other items even if one fails
      }
    }

    // Clear guest cart after successful merge
    clearGuestCartAfterMerge();
    
    return true;
  } catch (error) {
    console.error('Error merging guest cart:', error);
    return false;
  }
};

