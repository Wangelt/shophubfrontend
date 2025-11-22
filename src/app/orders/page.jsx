'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Calendar, MapPin, CreditCard, ChevronRight, Loader2, CheckCircle2, XCircle, Clock, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getMyOrders } from '@/services/userservices';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle2 className="size-4" />;
    case 'cancelled':
      return <XCircle className="size-4" />;
    case 'shipped':
      return <Truck className="size-4" />;
    case 'processing':
      return <Package className="size-4" />;
    default:
      return <Clock className="size-4" />;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to view your orders');
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isLoggedIn, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders({ page, limit });
      const data = response?.data || response;
      setOrders(data?.orders || []);
      setTotalPages(data?.pagination?.pages || 1);
      setTotal(data?.pagination?.total || 0);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load orders';
      toast.error(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#FFCBD8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Orders</h1>
          <p className="text-neutral-600">
            {total > 0 ? `${total} order${total !== 1 ? 's' : ''} found` : 'No orders yet'}
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="mx-auto mb-4 size-16 text-neutral-400" />
            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
              No orders found
            </h2>
            <p className="mb-6 text-neutral-600">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {orders.map((order) => {
                const orderDate = formatDate(order.createdAt);
                const totalItems = order.orderItems?.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                ) || 0;

                return (
                  <Card key={order._id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-neutral-900">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                <span>{orderDate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="size-4" />
                                <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                              </div>
                              {order.isPaid && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="size-4" />
                                  <span>Paid</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-neutral-900">
                              {formatCurrency(order.totalPrice)}
                            </p>
                            {order.isDelivered && order.deliveredAt && (
                              <p className="text-xs text-neutral-500 mt-1">
                                Delivered {formatDate(order.deliveredAt)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="size-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-neutral-600">
                                <p className="font-medium text-neutral-900">
                                  {order.shippingAddress.name}
                                </p>
                                <p>{order.shippingAddress.address}</p>
                                <p>
                                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                                  {order.shippingAddress.pincode}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Items Preview */}
                        <div className="flex gap-2 flex-wrap">
                          {order.orderItems?.slice(0, 4).map((item, index) => {
                            const product = item.product;
                            const imageUrl =
                              product?.images?.[0] ||
                              item.image ||
                              FALLBACK_IMAGE;

                            return (
                              <div
                                key={index}
                                className="relative h-16 w-16 overflow-hidden rounded-lg bg-neutral-100"
                              >
                                <Image
                                  src={imageUrl}
                                  alt={item.name || 'Product'}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                {item.quantity > 1 && (
                                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                                    {item.quantity}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {order.orderItems?.length > 4 && (
                            <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-neutral-100 text-sm font-medium text-neutral-600">
                              +{order.orderItems.length - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:w-48 flex flex-col gap-2">
                        <Link href={`/orders/${order._id}`}>
                          <Button variant="outline" className="w-full" size="sm">
                            View Details
                            <ChevronRight className="size-4 ml-1" />
                          </Button>
                        </Link>
                        {order.status === 'pending' && !order.isPaid && (
                          <Button
                            variant="outline"
                            className="w-full"
                            size="sm"
                            onClick={() => router.push(`/checkout?order=${order._id}`)}
                          >
                            <CreditCard className="size-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                        {order.status === 'pending' && (
                          <Button
                            variant="outline"
                            className="w-full text-red-600 hover:text-red-700"
                            size="sm"
                            onClick={() => {
                              // Handle cancel order
                              toast.info('Cancel order functionality coming soon');
                            }}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
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
                        className={
                          page === pageNum
                            ? 'bg-[#FFCBD8] hover:bg-[#FFCBD8]/80 text-neutral-900'
                            : ''
                        }
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
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="text-center mt-4 text-sm text-neutral-600">
                Page {page} of {totalPages}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

