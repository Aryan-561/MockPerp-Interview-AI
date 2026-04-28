import { axiosInstance } from "@/utils/axios";

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterResponse {
    user: {
        id: string;
        name: string;
        email: string;
        isEmailVerfied: boolean;
    };
}

interface LoginResponse {
    accessToken: string;
}

interface VerifyEmailResponse {
    user: {
        id: string;
        name: string;
        email: string;
        isEmailVerfied: boolean;
    };
}

class AuthService {
    private static readonly BASE_URL = "/auth";

    static async register(payload: RegisterPayload): Promise<RegisterResponse> {
        try {
            const response = await axiosInstance.post<RegisterResponse>(
                `${this.BASE_URL}/register`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async login(payload: LoginPayload): Promise<LoginResponse> {
        try {
            const response = await axiosInstance.post<LoginResponse>(
                `${this.BASE_URL}/login`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async logout(): Promise<void> {
        try {
            await axiosInstance.post(`${this.BASE_URL}/logout`);
        } catch (error) {
            throw error;
        }
    }

    static async getMe(): Promise<VerifyEmailResponse> {
        try {
            const response = await axiosInstance.get<VerifyEmailResponse>(
                `${this.BASE_URL}/me`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async refreshToken(): Promise<LoginResponse> {
        try {
            const response = await axiosInstance.post<LoginResponse>(
                `${this.BASE_URL}/refresh-token`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async verifyEmail(token: string): Promise<VerifyEmailResponse> {
        try {
            const response = await axiosInstance.get<VerifyEmailResponse>(
                `${this.BASE_URL}/verify-email`,
                {
                    params: { token }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async resendVerificationEmail(email: string): Promise<void> {
        try {
            await axiosInstance.post(
                `${this.BASE_URL}/resend-verification-email`,
                { email }
            );
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;