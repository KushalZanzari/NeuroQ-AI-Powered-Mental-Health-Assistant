import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Read backend URL from Render environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  
  headers: {
    "Content-Type": "application/json",
  },
});

// AUTO-ATTACH TOKEN
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

