'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MultipleImageUpload from '@/components/MultipleImageUpload';
import {
  getAllCategories,
  getAllSubCategories,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductFeatured,
  updateProductStock,
} from '@/services/adminservices';

const ProductsPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    subCategory: '',
    stock: '',
    brand: '',
    sku: '',
    images: [],
    tags: '',
    isFeatured: false,
    isActive: true,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch all subcategories
  const fetchAllSubCategories = async () => {
    try {
      const response = await getAllSubCategories();
      setAllSubcategories(response.data.subcategories || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  // Fetch products
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getAllProducts({ page, limit: 9 });
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllSubCategories();
    fetchProducts();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const filtered = allSubcategories.filter(
        (sub) => sub.category._id === formData.category
      );
      setSubcategories(filtered);
    } else {
      setSubcategories([]);
    }
  }, [formData.category, allSubcategories]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle create
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        images: Array.isArray(formData.images) ? formData.images : [],
        tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      };
      await createProduct(productData);
      await fetchProducts(currentPage);
      resetForm();
      alert('Product created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create product');
      console.error('Error creating product:', err);
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        images: Array.isArray(formData.images) ? formData.images : [],
        tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      };
      await updateProduct(currentProduct._id, productData);
      await fetchProducts(currentPage);
      resetForm();
      alert('Product updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update product');
      console.error('Error updating product:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await deleteProduct(id);
      await fetchProducts(currentPage);
      alert('Product deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id) => {
    try {
      await toggleProductFeatured(id);
      await fetchProducts(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to toggle featured status');
      console.error('Error toggling featured:', err);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category._id,
      subCategory: product.subCategory._id,
      stock: product.stock,
      brand: product.brand || '',
      sku: product.sku || '',
      images: product.images || [],
      tags: product.tags?.join(', ') || '',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setEditMode(true);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      subCategory: '',
      stock: '',
      brand: '',
      sku: '',
      images: [],
      tags: '',
      isFeatured: false,
      isActive: true,
    });
    setCurrentProduct(null);
    setEditMode(false);
    setShowForm(false);
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editMode ? 'Edit Product' : 'Create Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editMode ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    type="text"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discountPrice">Discount Price</Label>
                  <Input
                    id="discountPrice"
                    name="discountPrice"
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    type="text"
                    value={formData.sku}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subCategory">SubCategory *</Label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <Label>Product Images</Label>
                <MultipleImageUpload
                  currentImages={formData.images}
                  folder="products"
                  onUploadSuccess={(images) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: images || [],
                    }));
                  }}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="electronics, gadgets, trending"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">{editMode ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {products.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-8">
            No products found. Create your first product!
          </p>
        ) : (
          products.map((product) => (
            <Card key={product._id}>
              <CardContent className="pt-6">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}

                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <div className="flex gap-1">
                    {product.isFeatured && (
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="text-sm text-gray-500 mb-2">
                  <p>Category: {product.category?.name}</p>
                  <p>SubCategory: {product.subCategory?.name}</p>
                  {product.brand && <p>Brand: {product.brand}</p>}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      ${product.price}
                    </p>
                    {product.discountPrice > 0 && (
                      <p className="text-sm line-through text-gray-400">
                        ${product.discountPrice}
                      </p>
                    )}
                  </div>
                  <p className="text-sm">
                    Stock: <span className="font-semibold">{product.stock}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleFeatured(product._id)}
                  >
                    {product.isFeatured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchProducts(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

