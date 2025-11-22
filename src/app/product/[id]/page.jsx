'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addItemToCart, getProductById, getCart, updateCartItemQuantity, removeCartItem } from '@/services/userservices';
import { setCart } from '@/store/cartSlice';
import { addToGuestCart, getGuestCart, updateGuestCartItem, removeFromGuestCart } from '@/utils/guestCart';

const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export default function ProductDetailPage({ params }) {
  const { id } = params || {};
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const cart = useSelector((state) => state.cart.cart);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartState, setCartState] = useState({
    loading: false,
    message: '',
    error: '',
  });

  // Get current quantity of this product in cart
  const cartItem = cart?.products?.find((item) => {
    const productId = item.product?._id || item.product;
    return productId === id || productId?.toString() === id?.toString();
  });
  const currentQuantity = cartItem?.quantity || 0;
  const isInCart = currentQuantity > 0;

  useEffect(() => {
    if (!id) {
      setProduct(null);
      return;
    }
    
    // Clear previous product data when ID changes
    setProduct(null);
    setSelectedImageIndex(0);
    
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getProductById(id);
        const loadedProduct = res?.data?.product ?? null;
        
        // Verify the product ID matches the requested ID
        if (loadedProduct && loadedProduct._id?.toString() !== id?.toString()) {
          console.warn('Product ID mismatch:', loadedProduct._id, 'vs', id);
          setError('Product data mismatch');
          setProduct(null);
          return;
        }
        
        // Only set product if it matches the current ID (prevent race conditions)
        if (loadedProduct && loadedProduct._id?.toString() === id?.toString()) {
          setProduct(loadedProduct);
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ??
          err?.message ??
          'Unable to load product.';
        setError(message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Refresh cart when component mounts if user is logged in
  useEffect(() => {
    if (isLoggedIn && !cart) {
      const loadCart = async () => {
        try {
          const cartResponse = await getCart();
          const cartData = cartResponse?.data || cartResponse;
          if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
            dispatch(setCart(cartData));
          }
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      };
      loadCart();
    }
  }, [isLoggedIn, cart, dispatch]);

  const ratingValue = Number(product?.ratings?.average ?? 0);
  const hasDiscount =
    product?.discountPrice && product.discountPrice < product.price;

  const imageList = useMemo(() => {
    // Ensure we have a valid product with matching ID
    if (!product || !product._id || product._id.toString() !== id?.toString()) {
      return [FALLBACK_PRODUCT_IMAGE];
    }

    // Only use images from this specific product
    const imgs = Array.isArray(product.images) ? product.images : [];
    
    // Filter out duplicates, invalid images, and ensure they're valid URLs
    const uniqueImgs = imgs.filter((img, index, self) => {
      if (!img || typeof img !== 'string') return false;
      const trimmed = img.trim();
      if (trimmed === '') return false;
      // Check for duplicates
      if (self.findIndex(i => i === img) !== index) return false;
      // Basic URL validation (must start with http:// or https://)
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
      return true;
    });

    if (uniqueImgs.length === 0) return [FALLBACK_PRODUCT_IMAGE];
    return uniqueImgs;
  }, [product, id]);

  // Reset selected image when product changes
  useEffect(() => {
    if (product?._id && product._id.toString() === id?.toString()) {
      setSelectedImageIndex(0);
    }
  }, [product?._id, id]);

  // Carousel navigation functions
  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (imageList.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev + 1) % imageList.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [imageList.length]);

  const handleAddToCart = async () => {
    // If not logged in, add to guest cart
    if (!isLoggedIn) {
      if (!product?._id) {
        toast.error('Product information is missing.');
        return;
      }

      if (product?.stock <= 0) {
        toast.error('Product is out of stock');
        return;
      }

      try {
        addToGuestCart(product._id, 1, product);
        
        // Update Redux state to reflect guest cart
        const guestCart = getGuestCart();
        if (guestCart) {
          dispatch(setCart({
            products: guestCart.products.map(item => ({
              product: item.product,
              quantity: item.quantity,
            })),
            totalItems: guestCart.totalItems,
            totalPrice: guestCart.totalPrice,
          }));
        }
        
        toast.success('Product added to cart');
      } catch (error) {
        console.error('Error adding to guest cart:', error);
        toast.error('Failed to add product to cart');
      }
      return;
    }

    if (!product?._id) {
      toast.error('Product information is missing.');
      return;
    }

    if (product?.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    setCartState({
      loading: true,
      message: '',
      error: '',
    });

    try {
      const response = await addItemToCart({ productId: product._id, quantity: 1 });
      
      // Update global cart state - response is ApiResponse object from service
      // ApiResponse structure: { statusCode, data, message, success }
      // The actual cart data is in response.data
      const cartData = response?.data || response;
      
      // Only dispatch if we have valid cart data and dispatch function exists
      if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
        try {
          dispatch(setCart(cartData));
        } catch (dispatchError) {
          console.error('Error dispatching setCart:', dispatchError);
        }
      } else {
        // If cart data not in response, fetch it
        try {
          const cartResponse = await getCart();
          const fetchedCartData = cartResponse?.data || cartResponse;
          if (fetchedCartData && typeof fetchedCartData === 'object' && fetchedCartData !== null && setCart && typeof dispatch === 'function') {
            dispatch(setCart(fetchedCartData));
          }
        } catch (cartError) {
          console.error('Failed to refresh cart:', cartError);
        }
      }

      const successMessage =
        response?.message || 'Product added to cart successfully.';
      
      toast.success(successMessage);
      
      setCartState({
        loading: false,
        message: successMessage,
        error: '',
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to add product to cart.';
      
      toast.error(message);
      
      setCartState({
        loading: false,
        message: '',
        error: message,
      });
    }
  };

  const handleQuantityChange = async (newQuantity) => {
    if (!product?._id) return;

    // Handle guest cart
    if (!isLoggedIn) {
      if (newQuantity < 1) {
        try {
          setCartState({ loading: true, message: '', error: '' });
          removeFromGuestCart(product._id);
          const guestCart = getGuestCart();
          if (guestCart) {
            dispatch(setCart({
              products: guestCart.products.map(item => ({
                product: item.product,
                quantity: item.quantity,
              })),
              totalItems: guestCart.totalItems,
              totalPrice: guestCart.totalPrice,
            }));
          }
          toast.success('Item removed from cart');
          setCartState({ loading: false, message: '', error: '' });
        } catch (error) {
          toast.error('Failed to remove item');
          setCartState({ loading: false, message: '', error: 'Failed to remove item' });
        }
        return;
      }

      if (newQuantity > product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }

      try {
        setCartState({ loading: true, message: '', error: '' });
        updateGuestCartItem(product._id, newQuantity);
        const guestCart = getGuestCart();
        if (guestCart) {
          dispatch(setCart({
            products: guestCart.products.map(item => ({
              product: item.product,
              quantity: item.quantity,
            })),
            totalItems: guestCart.totalItems,
            totalPrice: guestCart.totalPrice,
          }));
        }
        toast.success('Cart updated');
        setCartState({ loading: false, message: '', error: '' });
      } catch (error) {
        toast.error('Failed to update quantity');
        setCartState({ loading: false, message: '', error: 'Failed to update quantity' });
      }
      return;
    }

    // Handle logged-in user cart
    if (newQuantity < 1) {
      // Remove from cart if quantity is 0
      try {
        setCartState({ loading: true, message: '', error: '' });
        await removeCartItem(product._id);
        const cartResponse = await getCart();
        const cartData = cartResponse?.data || cartResponse;
        if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
          dispatch(setCart(cartData));
        }
        toast.success('Item removed from cart');
        setCartState({ loading: false, message: '', error: '' });
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to remove item';
        toast.error(message);
        setCartState({ loading: false, message: '', error: message });
      }
      return;
    }

    if (newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    try {
      setCartState({ loading: true, message: '', error: '' });
      await updateCartItemQuantity(product._id, newQuantity);
      const cartResponse = await getCart();
      const cartData = cartResponse?.data || cartResponse;
      if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
        dispatch(setCart(cartData));
      }
      toast.success('Cart updated');
      setCartState({ loading: false, message: '', error: '' });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update quantity';
      toast.error(message);
      setCartState({ loading: false, message: '', error: message });
    }
  };

  return (
    <motion.div 
      className="min-h-screen page-gradient text-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Back to home
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="h-[420px] animate-pulse rounded-2xl bg-white" />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
            <p className="font-semibold">We couldn&apos;t load this product.</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : !product ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center text-neutral-500">
            Product not found.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative h-[420px] overflow-hidden rounded-2xl bg-neutral-100 group">
                <Image
                  src={imageList[selectedImageIndex] || FALLBACK_PRODUCT_IMAGE}
                  alt={product?.name ?? 'Product image'}
                  fill
                  className="object-cover transition-opacity duration-300"
                  unoptimized
                />
                {imageList.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="size-5 text-neutral-700" />
                    </button>
                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="size-5 text-neutral-700" />
                    </button>
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                      {selectedImageIndex + 1} / {imageList.length}
                    </div>
                  </>
                )}
              </div>
              {imageList.length > 1 ? (
                <div className="grid grid-cols-4 gap-3">
                  {imageList.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={cn(
                        "relative h-24 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer",
                        selectedImageIndex === i
                          ? "border-[#FFCBD8] ring-2 ring-[#FFCBD8]/30 scale-105"
                          : "border-transparent hover:border-neutral-300 hover:scale-105"
                      )}
                      aria-label={`View image ${i + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`${product?.name ?? 'Product'} ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  {product?.category?.name ?? 'Category'}
                </p>
                <h1 className="mt-1 text-3xl font-semibold">{product?.name}</h1>
              </div>

              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      'size-4',
                      index < Math.round(ratingValue)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-neutral-200'
                    )}
                  />
                ))}
                <span className="text-sm text-neutral-500">
                  {ratingValue.toFixed(1)} • {product?.ratings?.count ?? 0} reviews
                </span>
              </div>

              <div>
                <span className="text-3xl font-semibold text-[#FFCBD8]">
                  {formatCurrency(
                    hasDiscount ? product?.discountPrice : product?.price
                  )}
                </span>
                {hasDiscount ? (
                  <span className="ml-3 text-base text-neutral-400 line-through">
                    {formatCurrency(product?.price)}
                  </span>
                ) : null}
              </div>

              {product?.stock > 0 ? (
                <p className="text-sm text-green-600">In stock</p>
              ) : (
                <p className="text-sm text-red-600">Out of stock</p>
              )}

              <p className="text-neutral-600">{product?.description}</p>

              <div className="flex flex-col gap-2">
                {isInCart ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-neutral-300 rounded-lg overflow-hidden">
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-none border-0 h-12 w-12"
                        disabled={cartState.loading}
                        onClick={() => handleQuantityChange(currentQuantity - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="min-w-[3rem] text-center font-semibold text-lg">
                        {currentQuantity}
                      </span>
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-none border-0 h-12 w-12"
                        disabled={cartState.loading || currentQuantity >= product?.stock}
                        onClick={() => handleQuantityChange(currentQuantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={cartState.loading}
                      onClick={() => handleQuantityChange(0)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      className="gap-2"
                      disabled={cartState.loading || product?.stock <= 0}
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="size-4" />
                      {cartState.loading ? 'Adding...' : 'Add to cart'}
                    </Button>
                    <Button variant="outline" size="lg">
                      Save for later
                    </Button>
                  </div>
                )}
                {cartState.message ? (
                  <p className="text-sm text-green-600">{cartState.message}</p>
                ) : null}
                {cartState.error ? (
                  <p className="text-sm text-red-600">{cartState.error}</p>
                ) : null}
              </div>

            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

