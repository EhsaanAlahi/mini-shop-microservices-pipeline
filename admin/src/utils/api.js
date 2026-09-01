// src/utils/api.js
import axios from "axios";

const ADMIN_API_URL =
  process.env.REACT_APP_API_URL || "/api/admin/";
const PRODUCT_API_URL =
  process.env.REACT_APP_API_URL_PRODUCT ||
  "/api/products/";

function createInstance(baseURL) {
  const instance = axios.create({ baseURL });

  // har request pe token attach kar do (agar login se save kiya hua hai)
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

export const adminApi = createInstance(ADMIN_API_URL); // login/admin-user routes ke liye
export const productApi = createInstance(PRODUCT_API_URL); // products ke liye

// default export = productApi (productSlice isko already use kar raha hai)
export default productApi;