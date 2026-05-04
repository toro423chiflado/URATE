import axios from 'axios';

// Instancia para el orquestador
export const apiOrchestrator = axios.create({
  baseURL: import.meta.env.VITE_ORCHESTRATOR_URL,
});

// Instancia para MS1 (Auth)
export const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_MS1_URL,
});

// Interceptor para inyectar token en orquestador
apiOrchestrator.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para inyectar token en MS1 si es necesario
apiAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
