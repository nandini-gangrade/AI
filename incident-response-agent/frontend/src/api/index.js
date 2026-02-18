import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ira_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser     = (data) => api.post("/auth/login", data);
export const registerUser  = (data) => api.post("/auth/register", data);
export const sendMessage   = (data) => api.post("/chat", data);
export const getChatHistory = (session) => api.get(`/chat/history/${session}`);
export const getIncidents  = ()     => api.get("/incidents");

export default api;