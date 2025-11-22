/**
 * Razorpay Configuration
 * Load Razorpay script and initialize payment
 */

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (amount, orderId, userInfo) => {
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    name: 'ShopHub',
    description: `Order #${orderId}`,
    order_id: null, // Will be set from backend
    handler: async function (response) {
      // This will be handled in the checkout page
      return response;
    },
    prefill: {
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      contact: userInfo?.phone || '',
    },
    theme: {
      color: '#ec4899', // Pink color matching your theme
    },
    modal: {
      ondismiss: function () {
        // Handle payment cancellation
        console.log('Payment cancelled');
      },
    },
  };

  return options;
};

