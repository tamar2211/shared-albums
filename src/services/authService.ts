import type { AuthResponse, LoginInput, RegisterInput, User } from "../types/api";
import { api } from "./api";
export const authService = {
  async register(data: RegisterInput) {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },
  async login(data: LoginInput) {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  async me() {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data;
  },
};