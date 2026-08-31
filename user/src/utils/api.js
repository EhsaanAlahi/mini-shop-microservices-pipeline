// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/api/products/",
});

export default api;