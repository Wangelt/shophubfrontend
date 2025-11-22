'use client';

import Axios from "../lib/axios";
import ENDPOINTS from "../lib/apiConfig";
import store from "@/store/store";
import { setLoggedIn, setLoggedOut } from "@/store/authSlice";
import { mergeGuestCartToUserCart } from "@/utils/mergeCart";

// Helper function to replace URL params
const replaceUrlParams = (url, params = {}) => {
  let finalUrl = url;
  Object.keys(params).forEach(key => {
    finalUrl = finalUrl.replace(`:${key}`, params[key]);
  });
  return finalUrl;
};

const login = async (email, password) => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.login,
      data: { email, password },
    });

    const { accessToken, refreshToken } = res.data.data;
    const userRole = res.data.data?.user?.role;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // Also set a cookie for middleware checks
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    if (userRole) {
      document.cookie = `userRole=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    }
    store.dispatch(setLoggedIn());

    // Merge guest cart with user cart after login
    mergeGuestCartToUserCart().catch(err => {
      console.error('Failed to merge guest cart:', err);
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const logout = async () => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.logout,
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Remove cookie so middleware sees logged-out state
    document.cookie = `accessToken=; path=/; max-age=0; samesite=lax`;
    document.cookie = `userRole=; path=/; max-age=0; samesite=lax`;
    store.dispatch(setLoggedOut());
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

const isLoggedIn = () => {
  return !!getAccessToken();
};

const register = async (name, email, password, confirmPassword) => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.register,
      data: { name, email, password},

    });
    const { accessToken, refreshToken } = res.data.data;
    const userRole = res.data.data?.user?.role;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    if (userRole) {
      document.cookie = `userRole=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    }
    store.dispatch(setLoggedIn());

    // Merge guest cart with user cart after registration
    mergeGuestCartToUserCart().catch(err => {
      console.error('Failed to merge guest cart:', err);
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const adminLogin = async (email, password) => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.adminLogin,
      data: { email, password },
    });
    const { accessToken, refreshToken } = res.data.data;
    const userRole = res.data.data?.user?.role;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    if (userRole) {
      document.cookie = `userRole=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    }
    store.dispatch(setLoggedIn());
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
const getAboutMe = async () => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.aboutme,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const forgotPassword = async (email) => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.forgotPassword,
      data: { email },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const verifyOTP = async (email, otp) => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.verifyOTP,
      data: { email, otp },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const resetPassword = async (resetToken, password) => {
  try {
    const res = await Axios({
      ...ENDPOINTS.auth.resetPassword,
      data: { resetToken, password },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export {
  login,
  logout,
  getAccessToken,
  getRefreshToken,
  isLoggedIn,
  register,
  getAboutMe,
  adminLogin,
  forgotPassword,
  verifyOTP,
  resetPassword
};
