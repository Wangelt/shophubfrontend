'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Plus, MapPin, Edit, Trash2, Star, Home, Briefcase, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getAllAddresses,
  createAddress,
  updateAddressById,
  deleteAddress,
  setDefaultAddress,
} from '@/services/userservices';

export default function AddressesPage() {
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home',
    isDefault: false,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to manage addresses');
      router.push('/login');
      return;
    }
    fetchAddresses();
  }, [isLoggedIn]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAllAddresses();
      const data = response?.data || response;
      setAddresses(data?.addresses || []);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load addresses';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddressById(editingAddress._id, formData);
        toast.success('Address updated successfully');
      } else {
        await createAddress(formData);
        toast.success('Address added successfully');
      }
      setShowForm(false);
      setEditingAddress(null);
      resetForm();
      fetchAddresses();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save address';
      toast.error(message);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType || 'home',
      isDefault: address.isDefault || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await deleteAddress(id);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete address';
      toast.error(message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to set default address';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'home',
      isDefault: false,
    });
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home className="size-4" />;
      case 'work':
        return <Briefcase className="size-4" />;
      default:
        return <MapPin className="size-4" />;
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Addresses</h1>
            <p className="text-neutral-600">
              Manage your shipping addresses for faster checkout
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingAddress(null);
              resetForm();
            }}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Address
          </Button>
        </div>

        {/* Address Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                    value={formData.email}
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Address Type
                  </label>
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
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
                    value={formData.city}
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
                    value={formData.state}
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
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm text-neutral-700">
                      Set as default address
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="mx-auto mb-4 size-16 text-neutral-400" />
            <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
              No addresses found
            </h2>
            <p className="mb-6 text-neutral-600">
              Add your first address to get started.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="size-4 mr-2" />
              Add Address
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <Card
                key={address._id}
                className={`p-6 relative ${
                  address.isDefault ? 'border-2 border-[#FFCBD8]' : ''
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <Star className="size-5 text-[#FFCBD8] fill-[#FFCBD8]" />
                  </div>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-[#FFCBD8]/30 rounded-lg">
                    {getAddressTypeIcon(address.addressType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900">
                        {address.name}
                      </h3>
                      {address.isDefault && (
                        <span className="text-xs bg-[#FFCBD8]/30 text-neutral-900 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 capitalize">
                      {address.addressType}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-neutral-600 space-y-1 mb-4">
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p>Phone: {address.phone}</p>
                  <p>Email: {address.email}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(address)}
                    className="flex-1"
                  >
                    <Edit className="size-4 mr-1" />
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address._id)}
                      className="flex-1"
                    >
                      <Star className="size-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

