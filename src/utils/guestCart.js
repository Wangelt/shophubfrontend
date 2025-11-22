/**
 * Guest Cart Utility
 * Handles cart operations for non-logged-in users using localStorage
 */

const GUEST_CART_KEY = 'guest_cart';

/**
 * Get guest cart from localStorage
 */
export const getGuestCart = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY);
    if (!cartData) return null;
    return JSON.parse(cartData);
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return null;
  }
};

/**
 * Save guest cart to localStorage
 */
export const saveGuestCart = (cart) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (cart && typeof cart === 'object') {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

/**
 * Add item to guest cart
 */
export const addToGuestCart = (productId, quantity = 1, productData = null) => {
  const cart = getGuestCart() || { products: [], totalItems: 0, totalPrice: 0 };
  
  const existingItemIndex = cart.products.findIndex(
    item => item.productId === productId
  );
  
  if (existingItemIndex > -1) {
    cart.products[existingItemIndex].quantity += quantity;
  } else {
    cart.products.push({
      productId,
      quantity,
      product: productData, // Store product data for display
    });
  }
  
  // Recalculate totals
  cart.totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.products.reduce((sum, item) => {
    const product = item.product;
    if (!product) return sum;
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    return sum + (price * item.quantity);
  }, 0);
  
  saveGuestCart(cart);
  return cart;
};

/**
 * Update item quantity in guest cart
 */
export const updateGuestCartItem = (productId, quantity) => {
  const cart = getGuestCart();
  if (!cart) return null;
  
  if (quantity <= 0) {
    return removeFromGuestCart(productId);
  }
  
  const itemIndex = cart.products.findIndex(item => item.productId === productId);
  if (itemIndex > -1) {
    cart.products[itemIndex].quantity = quantity;
    
    // Recalculate totals
    cart.totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.products.reduce((sum, item) => {
      const product = item.product;
      if (!product) return sum;
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    saveGuestCart(cart);
    return cart;
  }
  
  return cart;
};

/**
 * Remove item from guest cart
 */
export const removeFromGuestCart = (productId) => {
  const cart = getGuestCart();
  if (!cart) return null;
  
  cart.products = cart.products.filter(item => item.productId !== productId);
  
  // Recalculate totals
  cart.totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.products.reduce((sum, item) => {
    const product = item.product;
    if (!product) return sum;
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    return sum + (price * item.quantity);
  }, 0);
  
  saveGuestCart(cart);
  return cart;
};

/**
 * Clear guest cart
 */
export const clearGuestCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
};

/**
 * Get guest cart total items count
 */
export const getGuestCartTotalItems = () => {
  const cart = getGuestCart();
  if (!cart || !cart.products) return 0;
  return cart.products.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Merge guest cart with user cart
 * Returns the guest cart items that need to be added to user cart
 */
export const getGuestCartItems = () => {
  const cart = getGuestCart();
  if (!cart || !cart.products || cart.products.length === 0) return [];
  return cart.products.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
  }));
};

/**
 * Clear guest cart after merging
 */
export const clearGuestCartAfterMerge = () => {
  clearGuestCart();
};

