import { axiosInstance } from '../lib/axios';

export class UploadService {
  async uploadResume(file: File, role: string) {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role);   // ← tell the backend which role to use

    const response = await axiosInstance.post('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const uploadService = new UploadService();
