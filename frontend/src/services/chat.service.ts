import { axiosInstance } from '../lib/axios';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  success?: boolean;
}

export class ChatService {
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await axiosInstance.post('/chat', data);
    return response.data.data || response.data;
  }
}

export const chatService = new ChatService();
