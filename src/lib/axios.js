'use client';

import axios from "axios";
import ENDPOINTS, { baseURL } from "./apiConfig";

const Axios = axios.create({
  baseURL,
  withCredentials: false,
});

Axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    let originRequest = error.config;

    if (error.response?.status === 401 && !originRequest._retry) {
      originRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (newAccessToken) {
          originRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios({
      ...ENDPOINTS.refresh_token,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const accessToken = response.data.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (err) {
    console.error("Refresh failed", err);
    return null;
  }
};

export default Axios;


//without refresh token
// 'use client';

// import axios from "axios";
// import { baseURL } from "../common/summaryAPI";

// // Create Axios instance
// const Axios = axios.create({
//   baseURL,
//   withCredentials: false, // No cookies involved
// });

// // Request interceptor to attach access token
// Axios.interceptors.request.use(
//   (config) => {
//     const accessToken = localStorage.getItem("accessToken");
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor (no refresh logic)
// Axios.interceptors.response.use(
//   (response) => response,
//   (error) => Promise.reject(error)
// );

// export default Axios;
