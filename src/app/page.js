'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ScrollReveal from '@/components/ScrollReveal';
import { motion } from 'framer-motion';
import {
	getAllProducts as fetchAllProducts,
	getAllCategories as fetchCategories,
	addItemToCart,
	getCart,
	updateCartItemQuantity,
	removeCartItem,
} from '@/services/userservices';
import { setCart } from '@/store/cartSlice';

const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const extractCategoryKey = (product) => {
  const category = product?.category;
  if (!category) return undefined;
  return category.slug || category._id || category.name;
};

const ProductCard = ({ product }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const cart = useSelector((state) => state.cart.cart);
  const [loading, setLoading] = useState(false);

  const imageUrl = product?.images?.[0] || FALLBACK_PRODUCT_IMAGE;
  const ratingValue = Number(product?.ratings?.average ?? 0);
  const ratingCount = product?.ratings?.count ?? 0;
  const hasDiscount =
    product?.discountPrice && product.discountPrice < product.price;

  // Get current quantity of this product in cart
  const cartItem = cart?.products?.find((item) => {
    const productId = item.product?._id || item.product;
    return productId === product?._id || productId?.toString() === product?._id?.toString();
  });
  const currentQuantity = cartItem?.quantity || 0;
  const isInCart = currentQuantity > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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
        const { addToGuestCart, getGuestCart } = await import('@/utils/guestCart');
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

    setLoading(true);

    try {
      const response = await addItemToCart({ productId: product._id, quantity: 1 });
      
      const cartData = response?.data || response;
      
      if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
        try {
          dispatch(setCart(cartData));
        } catch (dispatchError) {
          console.error('Error dispatching setCart:', dispatchError);
        }
      } else {
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

      toast.success('Product added to cart');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to add product to cart.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (e, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product?._id) return;

    // Handle guest cart
    if (!isLoggedIn) {
      if (newQuantity < 1) {
        try {
          setLoading(true);
          const { removeFromGuestCart, getGuestCart } = await import('@/utils/guestCart');
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
        } catch (error) {
          toast.error('Failed to remove item');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (newQuantity > product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }

      try {
        setLoading(true);
        const { updateGuestCartItem, getGuestCart } = await import('@/utils/guestCart');
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
      } catch (error) {
        toast.error('Failed to update quantity');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (newQuantity < 1) {
      try {
        setLoading(true);
        await removeCartItem(product._id);
        const cartResponse = await getCart();
        const cartData = cartResponse?.data || cartResponse;
        if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
          dispatch(setCart(cartData));
        }
        toast.success('Item removed from cart');
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to remove item';
        toast.error(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    try {
      setLoading(true);
      await updateCartItemQuantity(product._id, newQuantity);
      const cartResponse = await getCart();
      const cartData = cartResponse?.data || cartResponse;
      if (cartData && typeof cartData === 'object' && cartData !== null && setCart && typeof dispatch === 'function') {
        dispatch(setCart(cartData));
      }
      toast.success('Cart updated');
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update quantity';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="group flex flex-col w-[300px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    >
      <Link href={`/product/${product?._id ?? product?.slug ?? ''}`} className="relative h-56 overflow-hidden bg-neutral-100">
        <Image
          src={imageUrl}
          alt={product?.name ?? 'Product'}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          unoptimized
        />
        {product?.isFeatured ? (
          <div className="absolute left-4 top-4 rounded-full bg-[#FFCBD8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-900 shadow">
            Featured
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {product?.category?.name ?? 'Category'}
            </p>
            <Link href={`/product/${product?._id ?? product?.slug ?? ''}`}>
              <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-neutral-900 hover:underline">
                {product?.name ?? 'Product name'}
              </h3>
            </Link>
          </div>
          <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            {product?.brand ?? 'New'}
          </div>
        </div>

        <p className="line-clamp-3 text-sm text-neutral-500">
          {product?.description ?? 'Discover premium quality products curated for modern living.'}
        </p>

        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={cn(
                'size-4 transition-colors',
                index < Math.round(ratingValue)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-neutral-200'
              )}
            />
          ))}
          <span className="text-sm text-neutral-500">
            {ratingValue.toFixed(1)} • {ratingCount} reviews
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xl font-semibold text-[#FFCBD8]">
              {formatCurrency(
                hasDiscount ? product.discountPrice : product?.price
              )}
            </span>
            {hasDiscount ? (
              <span className="ml-2 text-sm text-neutral-400 line-through">
                {formatCurrency(product?.price)}
              </span>
            ) : null}
          </div>
          {isInCart ? (
            <div className="flex items-center gap-1 border border-neutral-300 rounded-lg overflow-hidden">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-0 h-8 w-8 p-0"
                disabled={loading}
                onClick={(e) => handleQuantityChange(e, currentQuantity - 1)}
              >
                <Minus className="size-3" />
              </Button>
              <span className="min-w-[2rem] text-center text-sm font-semibold">
                {currentQuantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-0 h-8 w-8 p-0"
                disabled={loading || currentQuantity >= product?.stock}
                onClick={(e) => handleQuantityChange(e, currentQuantity + 1)}
              >
                <Plus className="size-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1"
              disabled={loading || product?.stock <= 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-4" />
              {loading ? 'Adding...' : 'Add to Cart'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [categories, setCategories] = useState([]);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Load categories once
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const res = await fetchCategories();
				const list = Array.isArray(res?.data?.categories) ? res.data.categories : [];
				setCategories(list);
			} catch {
				// non-blocking
			}
		};
		loadCategories();
	}, []);

	// Load products when filters change
	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			setError('');
			try {
				const params = {
					limit: 12,
					sort: '-createdAt',
					isActive: true,
					page,
				};
				if (selectedCategory !== 'all') {
					params.category = selectedCategory;
				}
				if (search.trim()) {
					params.search = search.trim();
				}
				const response = await fetchAllProducts(params);
				const responseData = response?.data ?? {};
				const productList = Array.isArray(responseData?.products)
					? responseData.products
					: [];
				setProducts(productList);
				const pagesFromApi = Number(responseData?.pagination?.pages ?? 1);
				setTotalPages(pagesFromApi > 0 ? pagesFromApi : 1);
			} catch (err) {
				const message =
					err?.response?.data?.message ??
					err?.message ??
					'Something went wrong while loading products.';
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [selectedCategory, search, page]);

	// Prefer API categories; fallback to deriving from products if categories missing
	const categoryFilters = useMemo(() => {
		if (Array.isArray(categories) && categories.length > 0) {
			return categories.map((c) => ({
				key: c.slug || c._id || c.name,
				label: c.name ?? 'Category',
			}));
		}
		const map = new Map();
		products.forEach((product) => {
			const key = extractCategoryKey(product);
			if (!key) return;
			if (!map.has(key)) {
				map.set(key, {
					key,
					label: product?.category?.name ?? 'Category',
				});
			}
		});
		return Array.from(map.values());
	}, [categories, products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(
      (product) => extractCategoryKey(product) === selectedCategory
    );
  }, [products, selectedCategory]);

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product?.isFeatured);
    if (featured.length > 0) {
      return featured.slice(0, 3);
    }
    return products.slice(0, 3);
  }, [products]);

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => (b?.sold ?? 0) - (a?.sold ?? 0))
      .slice(0, 3);
  }, [products]);

  return (
    <div className="min-h-screen w-full page-gradient text-neutral-900">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FFCBD8]/20 via-[#EEEEEC] to-[#FFCBD8]/10"
          aria-hidden="true"
        />

        <section className="relative w-full px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <ScrollReveal>
            <div className="space-y-8">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-[#FFCBD8]">
                New Arrivals
              </span>
              <h1 className="text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Shop what you love
              </h1>
              <p className="max-w-2xl text-base text-neutral-600">
                Find everything you need in one place. Quality products, great prices, and fast delivery.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="px-6 py-5 text-base">
                  <Link href="#catalog" className="flex items-center gap-2">
                    Shop the collection <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="px-6 py-5 text-base">
                  <Link href="/login" className="flex items-center gap-2">
                    Member login
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex gap-6 flex-wrap">
                {[
                  { value: '500+', label: 'Products' },
                  { value: 'Fast', label: 'Delivery' },
                  { value: '4.9/5', label: 'Rating' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg bg-white px-4 py-2 border border-neutral-200"
                  >
                    <p className="text-lg font-semibold text-neutral-900">
                      {item.value}
                    </p>
                    <p className="text-xs text-neutral-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            </ScrollReveal>

            <ScrollReveal>
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Featured Products
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Check out our top picks
                </p>

        <div className="mt-6 grid gap-4">
          {featuredProducts.map((product) => {
                    const imageUrl = product?.images?.[0] || FALLBACK_PRODUCT_IMAGE;
                    return (
              <Link
                href={`/product/${product?._id ?? product?.slug ?? ''}`}
                        key={product?._id ?? product?.slug ?? product?.name}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3 transition hover:bg-neutral-50"
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-neutral-100">
                          <Image
                            src={imageUrl}
                            alt={product?.name ?? 'Featured product'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-neutral-900">
                            {product?.name ?? 'Product'}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-neutral-400">
                            {product?.category?.name ?? 'Category'}
                          </p>
                          <p className="text-sm font-semibold text-[#FFCBD8]">
                            {formatCurrency(product?.discountPrice ?? product?.price)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon-sm">
                          <ArrowRight className="size-4" />
                        </Button>
              </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>
      </div>

      <section
        id="catalog"
        className="w-full px-4 pb-24 sm:px-6 lg:px-8"
      >
        <ScrollReveal>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 className="text-2xl font-bold text-neutral-900">
							All Products
						</h2>
						<p className="mt-2 text-sm text-neutral-500">
							Browse our complete collection
						</p>
					</div>
					<div className="flex w-full flex-col items-stretch gap-3 md:w-auto lg:flex-row md:items-center">
						<div className="flex flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 md:min-w-[320px]">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="size-4 text-neutral-400"
							>
								<path d="m21 21-4.3-4.3" />
								<circle cx="11" cy="11" r="7" />
							</svg>
							<input
								type="text"
								placeholder="Search products"
								value={search}
								onChange={(e) => {
									setPage(1);
									setSearch(e.target.value);
								}}
								className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
							/>
						</div>
						<div className="flex  gap-3">
							<Button
								variant={selectedCategory === 'all' ? 'default' : 'outline'}
								className={cn(
									'rounded-full px-5 py-2 text-sm',
									selectedCategory === 'all' && 'shadow-md'
								)}
								onClick={() => {
									setPage(1);
									setSelectedCategory('all');
								}}
							>
								All
							</Button>
							{categoryFilters.map((category) => (
								<Button
									key={category.key}
									variant={selectedCategory === category.key ? 'default' : 'outline'}
									className={cn(
										'rounded-full px-5 py-2 text-sm capitalize',
										selectedCategory === category.key && 'shadow-md'
									)}
									onClick={() => {
										setPage(1);
										setSelectedCategory(category.key);
									}}
								>
									{category.label}
								</Button>
							))}
						</div>
					</div>
				</div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
            <p className="font-semibold">We couldn&apos;t load products.</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-2xl bg-white/70"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 gap-y-10">
            {filteredProducts.length === 0 ? (
              <div className=" w-[500px] rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center text-neutral-500">
                <p className="text-lg font-semibold text-neutral-700">
                  No products found in this category.
                </p>
                <p className="mt-2 text-sm">
                  Try selecting a different category or reset the filters.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product?._id ?? product?.slug ?? product?.name}
                  product={product}
                />
              ))
            )}
          </div>
        )}

				{/* Pagination */}
				{!loading && filteredProducts.length > 0 ? (
					<div className="mt-10 flex items-center justify-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Prev
						</Button>
						<span className="px-3 text-sm text-neutral-600">
							Page {page} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						>
							Next
						</Button>
					</div>
				) : null}
        </ScrollReveal>
      </section>

      {bestSellers.length > 0 ? (
        <ScrollReveal>
        <section className="border-t border-neutral-200 bg-white">
          <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Best Sellers
                </h2>
                <p className="text-sm text-neutral-500">
                  Most popular items
                </p>
              </div>
              <Button asChild variant="link" className="px-0 text-sm font-semibold">
                <Link href="#catalog" className="flex items-center gap-2">
                  View full collection <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {bestSellers.map((product) => {
                const imageUrl = product?.images?.[0] || FALLBACK_PRODUCT_IMAGE;
                return (
                  <div
                    key={product?._id ?? product?.slug ?? product?.name}
                    className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 transition hover:shadow-md"
                  >
                    <div className="relative h-52 overflow-hidden rounded-2xl bg-neutral-100">
                      <Image
                        src={imageUrl}
                        alt={product?.name ?? 'Bestseller product'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-[#FFCBD8]">
                        Bestseller
                      </p>
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {product?.name ?? 'Product'}
                      </h3>
                      <p className="line-clamp-2 text-sm text-neutral-500">
                        {product?.description ??
                          'Timeless style that effortlessly complements your wardrobe.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-[#FFCBD8]">
                        {formatCurrency(product?.discountPrice ?? product?.price)}
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link href="#catalog" className="flex items-center gap-2">
                          Shop now <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        </ScrollReveal>
      ) : null}
    </div>
  );
}
