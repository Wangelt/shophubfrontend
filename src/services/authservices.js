import Axios from "../lib/axios";
import ENDPOINTS from "../lib/apiConfig";

const login = async (email, password) => {
  const res = await Axios({
    ...ENDPOINTS.login,
    data: { email, password },
  });

  const { accessToken, refreshToken } = res.data.tokens;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return res.data; // return response for further use in page
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
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

export default {
  login,
  logout,
  getAccessToken,
  getRefreshToken,
  isLoggedIn,
};
