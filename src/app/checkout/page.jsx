'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import { ArrowLeft, CreditCard, MapPin, Package, Loader2, Plus, Star, Wallet } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCart, createOrder, payOrder, clearCart, getAllAddresses } from '@/services/userservices';
import { clearCart as clearCartState } from '@/store/cartSlice';
import { loadRazorpayScript, createRazorpayOrder } from '@/lib/razorpay';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const globalCart = useSelector((state) => state.cart.cart);
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to proceed to checkout');
      router.push('/login');
      return;
    }

    if (globalCart) {
      setCart(globalCart);
      setLoading(false);
    } else {
      fetchCart();
    }

    fetchAddresses();
  }, [isLoggedIn, globalCart]);

  const fetchAddresses = async () => {
    try {
      const response = await getAllAddresses();
      const data = response?.data || response;
      const savedAddresses = data?.addresses || [];
      setAddresses(savedAddresses);

      // Set default address if available
      const defaultAddress = savedAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setShippingAddress({
          name: defaultAddress.name,
          email: defaultAddress.email,
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
        });
      } else if (savedAddresses.length > 0) {
        // Use first address if no default
        setSelectedAddressId(savedAddresses[0]._id);
        const firstAddr = savedAddresses[0];
        setShippingAddress({
          name: firstAddr.name,
          email: firstAddr.email,
          phone: firstAddr.phone,
          address: firstAddr.address,
          city: firstAddr.city,
          state: firstAddr.state,
          pincode: firstAddr.pincode,
        });
      } else {
        // No saved addresses, use user data
        setShippingAddress({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: '',
          city: '',
          state: '',
          pincode: '',
        });
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);
    setShippingAddress({
      name: address.name,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setShowAddressForm(false);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      const cartData = response?.data || response;
      setCart(cartData);
    } catch (error) {
      toast.error('Failed to load cart');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.phone) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast.error('Please fill in complete shipping address');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    if (!cart || !cart.products || cart.products.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessing(true);

    try {
      // Create order first
      const orderItems = cart.products.map((item) => ({
        product: item.product?._id || item.product,
        name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.product?.discountPrice > 0 
          ? item.product.discountPrice 
          : item.product?.price,
        image: item.product?.images?.[0] || null,
      }));

      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        itemsPrice: parseFloat(cart.totalPrice || 0),
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: parseFloat(cart.totalPrice || 0),
      };

      const orderResponse = await createOrder(orderData);
      const order = orderResponse?.data?.order || orderResponse?.order;

      if (!order) {
        throw new Error('Failed to create order');
      }

      // Handle COD - no payment processing needed
      if (paymentMethod === 'cod') {
        // Clear cart
        try {
          await clearCart();
        } catch (cartError) {
          console.error('Failed to clear backend cart:', cartError);
        }
        dispatch(clearCartState());
        
        if (typeof window !== 'undefined') {
          try {
            const { clearGuestCart } = await import('@/utils/guestCart');
            clearGuestCart();
          } catch (e) {
            // Ignore guest cart clearing errors
          }
        }

        toast.success('Order placed successfully! Pay on delivery.');
        router.push(`/orders/${order._id}`);
        return;
      }

      // Handle Razorpay payment
      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        toast.error('Failed to load payment gateway');
        setProcessing(false);
        return;
      }

      // Prepare Razorpay payment options
      const amount = parseFloat(cart.totalPrice || 0);
      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        name: 'ShopHub',
        description: `Order #${order._id}`,
        order_id: null, // Razorpay will generate this
        handler: async function (response) {
          try {
            setProcessing(true);
            // Verify payment with backend
            await payOrder(order._id, {
              id: response.razorpay_payment_id,
              status: 'success',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Clear cart from backend
            try {
              await clearCart();
            } catch (cartError) {
              console.error('Failed to clear backend cart:', cartError);
              // Continue even if cart clearing fails - cart might already be empty
            }

            // Clear cart from Redux state
            dispatch(clearCartState());
            
            // Also clear guest cart if it exists (in case user was logged in as guest before)
            if (typeof window !== 'undefined') {
              try {
                const { clearGuestCart } = await import('@/utils/guestCart');
                clearGuestCart();
              } catch (e) {
                // Ignore guest cart clearing errors
              }
            }
            
            toast.success('Payment successful! Order placed.');
            router.push(`/orders/${order._id}`);
          } catch (error) {
            console.error('Payment verification error:', error);
            setProcessing(false);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#FFCBD8',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      // Initialize Razorpay
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
      
      razorpay.on('payment.failed', function (response) {
        setProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

    } catch (error) {
      console.error('Payment error:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to process payment';
      toast.error(message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#FFCBD8]" />
      </div>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <Package className="mx-auto mb-4 size-16 text-neutral-400" />
            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
              Your cart is empty
            </h2>
            <p className="mb-6 text-neutral-600">
              Add some items to your cart before checkout.
            </p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const products = cart.products || [];
  const totalItems = cart.totalItems || 0;
  const totalPrice = parseFloat(cart.totalPrice || 0);

  return (
    <motion.div 
      className="min-h-screen page-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/cart">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Cart
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Shipping & Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-[#FFCBD8]" />
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Shipping Address
                  </h2>
                </div>
                <Link href="/addresses">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="size-4" />
                    Manage Addresses
                  </Button>
                </Link>
              </div>

              {/* Saved Addresses */}
              {addresses.length > 0 && !showAddressForm && (
                <div className="mb-4 space-y-2">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === address._id
                          ? 'border-[#FFCBD8] bg-[#FFCBD8]/20'
                          : 'border-neutral-200 hover:border-[#FFCBD8]/50'
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-neutral-900">
                              {address.name}
                            </span>
                            {address.isDefault && (
                              <Star className="size-4 text-[#FFCBD8] fill-[#FFCBD8]" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600">
                            {address.address}, {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-neutral-600">
                            Phone: {address.phone}
                          </p>
                        </div>
                        {selectedAddressId === address._id && (
                          <div className="ml-2">
                            <div className="size-5 rounded-full border-2 border-[#FFCBD8] bg-[#FFCBD8] flex items-center justify-center">
                              <div className="size-2 rounded-full bg-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressForm(true)}
                    className="w-full"
                  >
                    <Plus className="size-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <div className="mb-4 p-4 border border-neutral-200 rounded-lg">
                  <h3 className="font-semibold text-neutral-900 mb-3">
                    {addresses.length > 0 ? 'Add New Address' : 'Enter Shipping Address'}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={shippingAddress.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingAddress.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={shippingAddress.pincode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                      />
                    </div>
                  </div>
                  {addresses.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressForm(false)}
                      className="mt-3"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}

            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="size-5 text-pink-600" />
                <h2 className="text-xl font-semibold text-neutral-900">
                  Payment Method
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#FFCBD8] bg-[#FFCBD8]/20'
                      : 'border-neutral-200 hover:border-[#FFCBD8]/50'
                  }`}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#FFCBD8] bg-[#FFCBD8]'
                        : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'razorpay' && (
                        <div className="size-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="size-5 text-[#FFCBD8]" />
                        <h3 className="font-semibold text-neutral-900">
                          Online Payment
                        </h3>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">
                        Pay securely with Razorpay
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-[#FFCBD8] bg-[#FFCBD8]/20'
                      : 'border-neutral-200 hover:border-[#FFCBD8]/50'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod'
                        ? 'border-[#FFCBD8] bg-[#FFCBD8]'
                        : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="size-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="size-5 text-[#FFCBD8]" />
                        <h3 className="font-semibold text-neutral-900">
                          Cash on Delivery
                        </h3>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">
                        Pay when you receive
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="size-5 text-[#FFCBD8]" />
                <h2 className="text-xl font-semibold text-neutral-900">
                  Order Items
                </h2>
              </div>

              <div className="space-y-4">
                {products.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
                  const itemTotal = price * item.quantity;

                  return (
                    <div key={item._id || product._id} className="flex gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        <Image
                          src={product.images?.[0] || FALLBACK_IMAGE}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-neutral-900 mt-1">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="size-5 text-pink-600" />
                <h2 className="text-xl font-semibold text-neutral-900">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-3 border-b border-neutral-200 pb-4 mb-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Items ({totalItems})</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold text-neutral-900 mb-6">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4 mr-2" />
                    {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay with Razorpay'}
                  </>
                )}
              </Button>

              <p className="text-xs text-neutral-500 mt-4 text-center">
                Secure payment powered by Razorpay
              </p>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

