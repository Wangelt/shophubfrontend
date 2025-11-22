'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOrderById } from '@/services/userservices';

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to view order details');
      router.push('/login');
      return;
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, isLoggedIn]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      const orderData = response?.data?.order || response?.order;
      setOrder(orderData);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load order';
      toast.error(message);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen page-gradient flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#FFCBD8]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <Package className="mx-auto mb-4 size-16 text-neutral-400" />
            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
              Order not found
            </h2>
            <Button asChild className="mt-4">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const orderDate = formatDate(order.createdAt);
  const totalItems = order.orderItems?.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <span>Placed on {orderDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="size-4" />
                  <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
              <p className="text-2xl font-bold text-neutral-900 mt-2">
                {formatCurrency(order.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => {
                  const product = item.product;
                  const imageUrl =
                    product?.images?.[0] || item.image || FALLBACK_IMAGE;
                  const itemTotal = item.price * item.quantity;

                  return (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0"
                    >
                      <Link
                        href={`/product/${product?._id || item.product}`}
                        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100"
                      >
                        <Image
                          src={imageUrl}
                          alt={item.name || 'Product'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/product/${product?._id || item.product}`}>
                          <h3 className="font-semibold text-neutral-900 hover:text-[#FFCBD8] transition-colors">
                            {item.name || product?.name || 'Product'}
                          </h3>
                        </Link>
                        <p className="text-sm text-neutral-600 mt-1">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-lg font-semibold text-neutral-900 mt-2">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Payment Information */}
            {order.paymentResult && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="size-5 text-[#FFCBD8]" />
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Payment Information
                  </h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Payment ID:</span>
                    <span className="font-medium text-neutral-900">
                      {order.paymentResult.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <span className="font-medium text-green-600 capitalize">
                      {order.paymentResult.status}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Paid on:</span>
                      <span className="font-medium text-neutral-900">
                        {formatDate(order.paidAt)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-6 space-y-6">
              {/* Shipping Address */}
              {order.shippingAddress && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-5 text-[#FFCBD8]" />
                    <h3 className="font-semibold text-neutral-900">
                      Shipping Address
                    </h3>
                  </div>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p className="font-medium text-neutral-900">
                      {order.shippingAddress.name}
                    </p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p>Pincode: {order.shippingAddress.pincode}</p>
                    {order.shippingAddress.phone && (
                      <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                    )}
                    {order.shippingAddress.email && (
                      <p>Email: {order.shippingAddress.email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="font-semibold text-neutral-900 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Items ({totalItems})</span>
                    <span>{formatCurrency(order.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax</span>
                    <span>{formatCurrency(order.taxPrice)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold text-neutral-900">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="font-semibold text-neutral-900 mb-3">
                  Order Status
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    {order.isPaid ? (
                      <CheckCircle2 className="size-4 text-green-600" />
                    ) : (
                      <Clock className="size-4 text-neutral-400" />
                    )}
                    <span className={order.isPaid ? 'text-neutral-900' : 'text-neutral-400'}>
                      Payment {order.isPaid ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {['processing', 'shipped', 'delivered'].includes(order.status) ? (
                      <CheckCircle2 className="size-4 text-green-600" />
                    ) : (
                      <Clock className="size-4 text-neutral-400" />
                    )}
                    <span
                      className={
                        ['processing', 'shipped', 'delivered'].includes(order.status)
                          ? 'text-neutral-900'
                          : 'text-neutral-400'
                      }
                    >
                      Order {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </div>
                  {order.isDelivered && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span className="text-neutral-900">
                        Delivered {order.deliveredAt && formatDate(order.deliveredAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {order.status === 'pending' && !order.isPaid && (
                <div className="border-t border-neutral-200 pt-6">
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/checkout?order=${order._id}`)}
                  >
                    <CreditCard className="size-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

