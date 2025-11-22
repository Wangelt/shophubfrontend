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

// ============ PRODUCTS ============
export const getAllProducts = async (params = {}) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.products.getAll.url,
      method: ENDPOINTS.products.getAll.method,
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.products.getById.url, { id }),
      method: ENDPOINTS.products.getById.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ CATEGORIES ============
export const getAllCategories = async () => {
  try {
    const response = await Axios({
      url: ENDPOINTS.categories.getAll.url,
      method: ENDPOINTS.categories.getAll.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.categories.getById.url, { id }),
      method: ENDPOINTS.categories.getById.method,
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
      url: ENDPOINTS.subcategories.getAll.url,
      method: ENDPOINTS.subcategories.getAll.method,
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
      url: replaceUrlParams(ENDPOINTS.subcategories.getById.url, { id }),
      method: ENDPOINTS.subcategories.getById.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ ORDERS ============
export const createOrder = async (data) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.orders.create.url,
      method: ENDPOINTS.orders.create.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyOrders = async (params = {}) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.orders.getMyOrders.url,
      method: ENDPOINTS.orders.getMyOrders.method,
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.orders.getById.url, { id }),
      method: ENDPOINTS.orders.getById.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const payOrder = async (id, data) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.orders.pay.url, { id }),
      method: ENDPOINTS.orders.pay.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelOrder = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.orders.cancel.url, { id }),
      method: ENDPOINTS.orders.cancel.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ CART ============
export const getCart = async () => {
  try {
    const response = await Axios({
      url: ENDPOINTS.cart.get.url,
      method: ENDPOINTS.cart.get.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addItemToCart = async ({ productId, quantity = 1 }) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.cart.addItem.url,
      method: ENDPOINTS.cart.addItem.method,
      data: { productId, quantity },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCartItemQuantity = async (productId, quantity) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.cart.updateItem.url, { productId }),
      method: ENDPOINTS.cart.updateItem.method,
      data: { quantity },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeCartItem = async (productId) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.cart.removeItem.url, { productId }),
      method: ENDPOINTS.cart.removeItem.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const clearCart = async () => {
  try {
    const response = await Axios({
      url: ENDPOINTS.cart.clear.url,
      method: ENDPOINTS.cart.clear.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ USER PROFILE ============
export const getUserProfile = async () => {
  try {
    const response = await Axios({
      url: ENDPOINTS.user.getProfile.url,
      method: ENDPOINTS.user.getProfile.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.user.updateProfile.url,
      method: ENDPOINTS.user.updateProfile.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePassword = async (data) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.user.updatePassword.url,
      method: ENDPOINTS.user.updatePassword.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAddress = async (data) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.user.updateAddress.url,
      method: ENDPOINTS.user.updateAddress.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await Axios({
      url: ENDPOINTS.user.deleteAccount.url,
      method: ENDPOINTS.user.deleteAccount.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ ADDRESSES ============
export const getAllAddresses = async () => {
  try {
    const response = await Axios({
      url: ENDPOINTS.addresses.getAll.url,
      method: ENDPOINTS.addresses.getAll.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAddressById = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.addresses.getById.url, { id }),
      method: ENDPOINTS.addresses.getById.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createAddress = async (data) => {
  try {
    const response = await Axios({
      url: ENDPOINTS.addresses.create.url,
      method: ENDPOINTS.addresses.create.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAddressById = async (id, data) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.addresses.update.url, { id }),
      method: ENDPOINTS.addresses.update.method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAddress = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.addresses.delete.url, { id }),
      method: ENDPOINTS.addresses.delete.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const setDefaultAddress = async (id) => {
  try {
    const response = await Axios({
      url: replaceUrlParams(ENDPOINTS.addresses.setDefault.url, { id }),
      method: ENDPOINTS.addresses.setDefault.method,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

