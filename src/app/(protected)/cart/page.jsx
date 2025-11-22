'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getProductById,
} from '@/services/userservices';
import { setCart as setCartAction, clearCart as clearCartState } from '@/store/cartSlice';
import {
  getGuestCart,
  saveGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
} from '@/utils/guestCart';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const globalCart = useSelector((state) => state.cart.cart);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      // Load guest cart
      loadGuestCart();
    }
  }, [isLoggedIn]);

  const loadGuestCart = async () => {
    try {
      setLoading(true);
      const guestCart = getGuestCart();
      
      if (guestCart && guestCart.products && guestCart.products.length > 0) {
        // Fetch product details for guest cart items
        const productsWithDetails = await Promise.all(
          guestCart.products.map(async (item) => {
            try {
              const productResponse = await getProductById(item.productId);
              const product = productResponse?.data?.product || productResponse?.product;
              return {
                ...item,
                product: product || item.product,
              };
            } catch (error) {
              console.error(`Failed to load product ${item.productId}:`, error);
              return item;
            }
          })
        );
        
        const cartData = {
          ...guestCart,
          products: productsWithDetails,
        };
        
        setCart(cartData);
        dispatch(setCartAction(cartData));
      } else {
        setCart({ products: [], totalItems: 0, totalPrice: 0 });
        dispatch(setCartAction({ products: [], totalItems: 0, totalPrice: 0 }));
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
      setCart({ products: [], totalItems: 0, totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      // Handle ApiResponse structure: response is ApiResponse object from service
      // ApiResponse has: { statusCode, data, message, success }
      // The actual cart data is in response.data
      const cartData = response?.data || response;
      
      // Only update if we have valid cart data (not undefined or null)
      if (cartData && typeof cartData === 'object' && cartData !== null) {
        setCart(cartData);
        // Update global cart state
        try {
          dispatch(setCartAction(cartData));
        } catch (dispatchError) {
          console.error('Error dispatching setCart:', dispatchError);
        }
      }
    } catch (error) {
      const message =
        error?.message || error?.response?.data?.message || 'Failed to load cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      setUpdating((prev) => ({ ...prev, [productId]: true }));
      
      if (isLoggedIn) {
        await updateCartItemQuantity(productId, newQuantity);
        await fetchCart();
      } else {
        const updatedCart = updateGuestCartItem(productId, newQuantity);
        if (updatedCart) {
          await loadGuestCart();
        }
      }
      toast.success('Cart updated');
    } catch (error) {
      const message =
        error?.message || error?.response?.data?.message || 'Failed to update quantity';
      toast.error(message);
    } finally {
      setUpdating((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setUpdating((prev) => ({ ...prev, [productId]: true }));
      
      if (isLoggedIn) {
        await removeCartItem(productId);
        await fetchCart();
      } else {
        const updatedCart = removeFromGuestCart(productId);
        if (updatedCart) {
          await loadGuestCart();
        }
      }
      toast.success('Item removed from cart');
    } catch (error) {
      const message =
        error?.message || error?.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    } finally {
      setUpdating((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      setLoading(true);
      
      if (isLoggedIn) {
        await clearCart();
      } else {
        clearGuestCart();
      }
      
      setCart({ products: [], totalItems: 0, totalPrice: 0 });
      dispatch(clearCartState());
      toast.success('Cart cleared');
    } catch (error) {
      const message =
        error?.message || error?.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const products = cart?.products || [];
  const totalItems = cart?.totalItems || 0;
  const totalPrice = parseFloat(cart?.totalPrice || 0);

  if (loading) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen page-gradient"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">Shopping Cart</h1>
          {products.length > 0 && (
            <Button variant="outline" onClick={handleClearCart} disabled={loading}>
              <Trash2 className="mr-2 size-4" />
              Clear Cart
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="mx-auto mb-4 size-16 text-neutral-400" />
            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
              Your cart is empty
            </h2>
            <p className="mb-6 text-neutral-600">
              Start adding items to your cart to see them here.
            </p>
            <Button asChild>
              <Link href="/">Browse Products</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {products.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const isUpdating = updating[product._id];
                  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
                  const itemTotal = price * item.quantity;
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <Card key={item._id || product._id} className="p-4">
                      <div className="flex gap-4">
                        <Link href={`/product/${product._id}`}>
                          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            <Image
                              src={product.images?.[0] || FALLBACK_IMAGE}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link href={`/product/${product._id}`}>
                              <h3 className="text-lg font-semibold text-neutral-900 hover:text-neutral-600">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-neutral-600">
                              Stock: {product.stock} available
                            </p>
                            {isOutOfStock && (
                              <p className="text-sm font-medium text-red-600">
                                Out of Stock
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(product._id, item.quantity - 1)
                                }
                                disabled={isUpdating || item.quantity <= 1}
                              >
                                <Minus className="size-4" />
                              </Button>
                              <span className="min-w-[3rem] text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(product._id, item.quantity + 1)
                                }
                                disabled={
                                  isUpdating ||
                                  isOutOfStock ||
                                  item.quantity >= product.stock
                                }
                              >
                                <Plus className="size-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-semibold text-neutral-900">
                                  {formatCurrency(itemTotal)}
                                </p>
                                {product.discountPrice > 0 && (
                                  <p className="text-sm text-neutral-500 line-through">
                                    {formatCurrency(product.price * item.quantity)}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(product._id)}
                                disabled={isUpdating}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4 p-6">
                <h2 className="mb-4 text-xl font-semibold text-neutral-900">
                  Order Summary
                </h2>
                <div className="space-y-3 border-b border-neutral-200 pb-4">
                  <div className="flex justify-between text-neutral-600">
                    <span>Items ({totalItems})</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-lg font-semibold text-neutral-900">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <Button
                  className="mt-6 w-full"
                  size="lg"
                  onClick={() => {
                    if (!isLoggedIn) {
                      toast.error('Please login to proceed to checkout');
                      router.push('/login');
                    } else {
                      router.push('/checkout');
                    }
                  }}
                  disabled={products.length === 0}
                >
                  {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

