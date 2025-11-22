'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAllCategories,
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '@/services/adminservices';

const SubCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
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

  // Fetch subcategories
  const fetchSubCategories = async (categoryId = null) => {
    try {
      setLoading(true);
      const response = await getAllSubCategories(categoryId);
      setSubcategories(response.data.subcategories || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch subcategories');
      console.error('Error fetching subcategories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Handle filter change
  const handleFilterChange = (categoryId) => {
    setFilterCategory(categoryId);
    fetchSubCategories(categoryId || null);
  };

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
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    try {
      await createSubCategory(formData);
      await fetchSubCategories(filterCategory || null);
      resetForm();
      alert('SubCategory created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create subcategory');
      console.error('Error creating subcategory:', err);
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    try {
      await updateSubCategory(currentSubCategory._id, formData);
      await fetchSubCategories(filterCategory || null);
      resetForm();
      alert('SubCategory updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update subcategory');
      console.error('Error updating subcategory:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    try {
      await deleteSubCategory(id);
      await fetchSubCategories(filterCategory || null);
      alert('SubCategory deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete subcategory');
      console.error('Error deleting subcategory:', err);
    }
  };

  // Edit subcategory
  const handleEdit = (subcategory) => {
    setCurrentSubCategory(subcategory);
    setFormData({
      name: subcategory.name,
      category: subcategory.category._id,
      isActive: subcategory.isActive,
    });
    setEditMode(true);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      isActive: true,
    });
    setCurrentSubCategory(null);
    setEditMode(false);
    setShowForm(false);
  };

  if (loading && subcategories.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">SubCategories Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add SubCategory'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <Label htmlFor="filter">Filter by Category</Label>
        <select
          id="filter"
          value={filterCategory}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editMode ? 'Edit SubCategory' : 'Create SubCategory'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editMode ? handleUpdate : handleCreate} className="space-y-4">
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
                      {cat.name} ({cat.mainCategory})
                    </option>
                  ))}
                </select>
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

              <div className="flex space-x-2">
                <Button type="submit">
                  {editMode ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SubCategories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subcategories.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-8">
            No subcategories found. Create your first subcategory!
          </p>
        ) : (
          subcategories.map((subcategory) => (
            <Card key={subcategory._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{subcategory.name}</h3>
                    <p className="text-sm text-gray-500">{subcategory.slug}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-blue-600">
                        {subcategory.category?.name || 'No Category'}
                      </p>
                      {subcategory.category?.mainCategory && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {subcategory.category.mainCategory}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      subcategory.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {subcategory.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(subcategory)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(subcategory._id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SubCategoriesPage;

