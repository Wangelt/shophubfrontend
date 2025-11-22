'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAllProducts } from '@/services/userservices';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const pageNum = Number(searchParams.get('page')) || 1;
    setSearchQuery(query);
    setPage(pageNum);
    
    if (query.trim()) {
      fetchProducts(query, pageNum);
    } else {
      setProducts([]);
      setTotalPages(1);
      setTotal(0);
    }
  }, [searchParams]);

  const fetchProducts = async (query, pageNum = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await getAllProducts({
        search: query,
        page: pageNum,
        limit: limit,
      });
      
      const data = response?.data || response;
      setProducts(data?.products || []);
      setTotalPages(data?.pagination?.pages || 1);
      setTotal(data?.pagination?.total || 0);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to search products';
      setError(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=1`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&page=${newPage}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.push('/search');
  };

  return (
    <div className="min-h-screen page-gradient">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">Search Products</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8] focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="size-5" />
                  </button>
                )}
              </div>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error && (
          <Card className="p-6 mb-6 border-red-200 bg-red-50">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {searchQuery && !loading && (
          <div className="mb-6">
            <p className="text-neutral-600">
              {total > 0 ? (
                <>
                  Found <span className="font-semibold text-neutral-900">{total}</span> product{total !== 1 ? 's' : ''} for &quot;
                  <span className="font-semibold text-neutral-900">{searchQuery}</span>&quot;
                </>
              ) : (
                <>No products found for &quot;<span className="font-semibold">{searchQuery}</span>&quot;</>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-[#FFCBD8]" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => {
                const ratingValue = Number(product?.ratings?.average ?? 0);
                const hasDiscount =
                  product?.discountPrice && product.discountPrice < product.price;
                const imageUrl = product?.images?.[0] || FALLBACK_PRODUCT_IMAGE;

                return (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="group flex flex-col w-full overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-56 overflow-hidden bg-neutral-100">
                      <Image
                        src={imageUrl}
                        alt={product?.name ?? 'Product'}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                        unoptimized
                      />
                      {product?.isFeatured && (
                        <div className="absolute left-4 top-4 rounded-full bg-[#FFCBD8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-900 shadow">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                          {product?.category?.name ?? 'Category'}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-neutral-900 group-hover:underline">
                          {product?.name ?? 'Product name'}
                        </h3>
                      </div>

                      <p className="line-clamp-2 text-sm text-neutral-500">
                        {product?.description ?? 'Discover premium quality products.'}
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
                          {ratingValue.toFixed(1)} • {product?.ratings?.count ?? 0} reviews
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-semibold text-[#FFCBD8]">
                            {formatCurrency(
                              hasDiscount ? product.discountPrice : product?.price
                            )}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-neutral-400 line-through">
                              {formatCurrency(product?.price)}
                            </span>
                          )}
                        </div>
                        {product?.stock <= 0 && (
                          <p className="text-sm text-red-600 mt-1">Out of Stock</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={cn(
                          'min-w-[2.5rem]',
                          page === pageNum && 'bg-[#FFCBD8] hover:bg-[#FFCBD8]/80 text-neutral-900'
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center mt-4 text-sm text-neutral-600">
                Page {page} of {totalPages}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && searchQuery && products.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="mx-auto mb-4 size-16 text-neutral-400" />
            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
              No products found
            </h2>
            <p className="mb-6 text-neutral-600">
              Try adjusting your search terms or browse our categories.
            </p>
            <Button asChild>
              <Link href="/">Browse All Products</Link>
            </Button>
          </Card>
        )}

        {/* Initial State */}
        {!searchQuery && !loading && (
          <Card className="p-12 text-center">
            <Search className="mx-auto mb-4 size-16 text-neutral-400" />
            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
              Start Your Search
            </h2>
            <p className="mb-6 text-neutral-600">
              Enter a product name, category, or keyword to find what you're looking for.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

