'use client';

import Axios from "@/lib/axios";
import ENDPOINTS from "@/lib/apiConfig";

// Helper function to replace URL params
const replaceUrlParams = (url, params = {}) => {
  let finalUrl = url;
  Object.keys(params).forEach(key => {
    finalUrl = finalUrl.replace(`:${key}`, params[key]);
  });
  return finalUrl;
};

// ============ CATEGORIES ============
export const getAllCategories = async (mainCategory = '') => {
  try {
    const params = mainCategory ? { mainCategory } : {};
    const response = await Axios({
      url: ENDPOINTS.admin.categories.getAll.url,
      method: ENDPOINTS.admin.categories.getAll.method,
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.categories.getById.url, { id }),
      method: ENDPOINTS.admin.categories.getById.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createCategory = async (data) => {
  try {
    // Ensure mainCategory is included in the request payload
    if (!data.mainCategory) {
      throw {
        message: 'Main category is required',
        errors: { mainCategory: 'Please select a main category (Men, Women, or Children)' }
      };
    }

    const response = await Axios({
      url: ENDPOINTS.admin.categories.create.url,
      method: ENDPOINTS.admin.categories.create.method,
      data,
    });
    return response.data;
  } catch (error) {
    // Handle validation errors related to mainCategory
    if (error.response?.data?.errors?.mainCategory) {
      throw {
        message: error.response.data.message || 'Validation failed',
        errors: error.response.data.errors
      };
    }
    throw error.response?.data || error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    // Include mainCategory in update payload if provided
    // Validate mainCategory if it's being updated
    if (data.mainCategory && !['Men', 'Women', 'Children'].includes(data.mainCategory)) {
      throw {
        message: 'Invalid main category',
        errors: { mainCategory: 'Main category must be one of: Men, Women, Children' }
      };
    }

    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.categories.update.url, { id }),
      method: ENDPOINTS.admin.categories.update.method,
      data,
    });
    return response.data;
  } catch (error) {
    // Handle mainCategory validation errors from server
    if (error.response?.data?.errors?.mainCategory) {
      throw {
        message: error.response.data.message || 'Validation failed',
        errors: error.response.data.errors
      };
    }
    throw error.response?.data || error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.categories.delete.url, { id }),
      method: ENDPOINTS.admin.categories.delete.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ SUBCATEGORIES ============
export const getAllSubCategories = async (categoryId = null) => {
  try {
    const params = categoryId ? { category: categoryId } : {};
    const response = await Axios({
      url: ENDPOINTS.admin.subcategories.getAll.url,
      method: ENDPOINTS.admin.subcategories.getAll.method,
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSubCategoryById = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.subcategories.getById.url, { id }),
      method: ENDPOINTS.admin.subcategories.getById.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createSubCategory = async (data) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.admin.subcategories.create.url,
      method: ENDPOINTS.admin.subcategories.create.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSubCategory = async (id, data) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.subcategories.update.url, { id }),
      method: ENDPOINTS.admin.subcategories.update.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSubCategory = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.subcategories.delete.url, { id }),
      method: ENDPOINTS.admin.subcategories.delete.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ PRODUCTS ============
export const getAllProducts = async (params = {}) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.admin.products.getAll.url,
      method: ENDPOINTS.admin.products.getAll.method,
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createProduct = async (data) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.admin.products.create.url,
      method: ENDPOINTS.admin.products.create.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProduct = async (id, data) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.products.update.url, { id }),
      method: ENDPOINTS.admin.products.update.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.products.delete.url, { id }),
      method: ENDPOINTS.admin.products.delete.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleProductFeatured = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.products.toggleFeatured.url, { id }),
      method: ENDPOINTS.admin.products.toggleFeatured.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProductStock = async (id, stock) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.products.updateStock.url, { id }),
      method: ENDPOINTS.admin.products.updateStock.method,
      data: { stock },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ DASHBOARD ============
export const getDashboardStats = async () => {
  try {
    const response = await Axios({
      url: ENDPOINTS.admin.dashboard.url,
      method: ENDPOINTS.admin.dashboard.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ USER MANAGEMENT ============
export const getAllUsers = async (params = {}) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.admin.users.getAll.url,
      method: ENDPOINTS.admin.users.getAll.method,
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.users.getById.url, { id }),
      method: ENDPOINTS.admin.users.getById.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.users.update.url, { id }),
      method: ENDPOINTS.admin.users.update.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.users.delete.url, { id }),
      method: ENDPOINTS.admin.users.delete.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ ORDER MANAGEMENT ============
export const getAllOrdersAdmin = async (params = {}) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.admin.orders.getAll.url,
      method: ENDPOINTS.admin.orders.getAll.method,
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.admin.orders.updateStatus.url, { id }),
      method: ENDPOINTS.admin.orders.updateStatus.method,
      data: { status },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ IMAGE UPLOAD ============
export const uploadSingleImage = async (file, folder = 'ecommerce') => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    console.log('Uploading to:', ENDPOINTS.admin.upload.single.url);
    console.log('File:', file.name, file.type, file.size);
    
    const response = await Axios({
      url: ENDPOINTS.admin.upload.single.url,
      method: ENDPOINTS.admin.upload.single.method,
      data: formData,
      // Don't set Content-Type manually - let browser set it with boundary
    });
    
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload service error:', error);
    console.error('Error response:', error.response);
    throw error.response?.data || error;
  }
};

export const uploadMultipleImages = async (files, folder = 'ecommerce') => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);

    console.log('Uploading multiple files:', files.length);

    const response = await Axios({
      url: ENDPOINTS.admin.upload.multiple.url,
      method: ENDPOINTS.admin.upload.multiple.method,
      data: formData,
      // Don't set Content-Type manually - let browser set it with boundary
    });
    
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Multiple upload service error:', error);
    throw error.response?.data || error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.admin.upload.delete.url,
      method: ENDPOINTS.admin.upload.delete.method,
      data: { publicId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

