import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://192.168.10.80:8081/api', // Para producción.
  baseURL: 'http://127.0.0.1:8081/api', //para desarrollo.
  headers: {'Content-Type': 'application/json',},
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;