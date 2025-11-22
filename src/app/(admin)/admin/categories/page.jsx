'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/adminservices';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [mainCategoryFilter, setMainCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    mainCategory: '',
  });

  // Fetch categories
  const fetchCategories = async (filterMainCategory = '') => {
    try {
      setLoading(true);
      const response = await getAllCategories(filterMainCategory);
      setCategories(response.data.categories || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    
    // Validate image is uploaded
    if (!formData.image) {
      alert('Please upload a category image before creating');
      return;
    }
    
    // Validate mainCategory is selected
    if (!formData.mainCategory) {
      alert('Please select a main category');
      return;
    }
    
    try {
      await createCategory(formData);
      await fetchCategories(mainCategoryFilter);
      resetForm();
      alert('Category created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create category');
      console.error('Error creating category:', err);
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate mainCategory is selected
    if (!formData.mainCategory) {
      alert('Please select a main category');
      return;
    }
    
    try {
      await updateCategory(currentCategory._id, formData);
      await fetchCategories(mainCategoryFilter);
      resetForm();
      alert('Category updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update category');
      console.error('Error updating category:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await deleteCategory(id);
      await fetchCategories(mainCategoryFilter);
      alert('Category deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      isActive: category.isActive,
      mainCategory: category.mainCategory || '',
    });
    setEditMode(true);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      isActive: true,
      mainCategory: '',
    });
    setCurrentCategory(null);
    setEditMode(false);
    setShowForm(false);
  };

  // Handle filter change
  const handleFilterChange = (value) => {
    setMainCategoryFilter(value);
    fetchCategories(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Category'}
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
            <CardTitle>{editMode ? 'Edit Category' : 'Create Category'}</CardTitle>
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
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <Label htmlFor="mainCategory">Main Category *</Label>
                <select
                  id="mainCategory"
                  name="mainCategory"
                  value={formData.mainCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select main category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Children">Children</option>
                </select>
                {!formData.mainCategory && (
                  <p className="text-xs text-red-500 mt-1">Main category is required</p>
                )}
              </div>

              <div>
                <Label>Category Image *</Label>
                <ImageUpload
                  currentImage={formData.image}
                  folder="categories"
                  onUploadSuccess={(imageData) => {
                    setFormData((prev) => ({
                      ...prev,
                      image: imageData?.url || '',
                    }));
                  }}
                />
                {!formData.image && (
                  <p className="text-xs text-red-500 mt-1">Image is required</p>
                )}
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

      {/* Filter Section */}
      <div className="mb-6">
        <Label htmlFor="mainCategoryFilter">Filter by Main Category</Label>
        <select
          id="mainCategoryFilter"
          value={mainCategoryFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Children">Children</option>
        </select>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-8">
            No categories found. Create your first category!
          </p>
        ) : (
          categories.map((category) => (
            <Card key={category._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.slug}</p>
                    {category.mainCategory && (
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                          category.mainCategory === 'Men'
                            ? 'bg-blue-100 text-blue-800'
                            : category.mainCategory === 'Women'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {category.mainCategory}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                )}

                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded mb-4"
                  />
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(category._id)}
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

export default CategoriesPage;

