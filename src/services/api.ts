import axios from "axios";
import { guestTokens } from "./guestTokens";
const TOKEN_KEY = "token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
export const tokenStorage = {
  get() {
  	return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
  localStorage.removeItem(TOKEN_KEY)
  },
};
api.interceptors.request.use((config) => {
  const token = tokenStorage.get() ?? guestTokenFor(config.url);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function guestTokenFor(url?: string) {
  const match = url?.match(/^\/albums\/(\d+)/);
  return match ? guestTokens.get(Number(match[1])) : null;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.error;

    if (serverMessage) {
      error.message = serverMessage;
    } else if (!error.response) {
      error.message = "אין חיבור לשרת. נסו שוב";
    } else {
      error.message = "משהו השתבש, נסו שוב";
    }

    return Promise.reject(error);
  }
);