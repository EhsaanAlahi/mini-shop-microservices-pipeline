// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL_PRODUCT|| "http://localhost:3002/api/products/",
});

export default api;