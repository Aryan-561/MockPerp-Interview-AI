import { axiosInstance } from '../lib/axios';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResendVerificationEmailData {
  email: string;
}

export class AuthService {
  async register(data: RegisterData) {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginData) {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  }

  async logout() {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  }

  async refreshToken() {
    const response = await axiosInstance.post('/auth/refresh-token');
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await axiosInstance.get(`/auth/verify-email`, {
      params: { token }
    });
    return response.data;
  }

  async resendVerificationEmail(data: ResendVerificationEmailData) {
    const response = await axiosInstance.post('/auth/resend-verification-email', data);
    return response.data;
  }

  async getMe() {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
}

export const authService = new AuthService();
