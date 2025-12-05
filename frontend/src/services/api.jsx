import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// AUTO-ATTACH TOKEN
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;  // NOT localStorage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default api;
