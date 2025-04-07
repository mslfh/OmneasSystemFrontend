import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
const { VITE_API_URL } = import.meta.env;

const api = axios.create({ baseURL: VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    console.error("Unauthenticated. Redirecting to login...");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }
  return Promise.reject(error);
});

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api }
