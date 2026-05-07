import { useMutation } from '@tanstack/react-query';
import { uploadService } from '../services/upload.service';

export const useUpload = () => {
  const useUploadResumeMutation = () =>
    useMutation({
      mutationFn: ({ file, role }: { file: File; role: string }) =>
        uploadService.uploadResume(file, role),
    });

  return { useUploadResumeMutation };
};
