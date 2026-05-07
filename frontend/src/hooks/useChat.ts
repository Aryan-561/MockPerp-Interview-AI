import { useMutation } from '@tanstack/react-query';
import { chatService, ChatRequest } from '../services/chat.service';

export const useChat = () => {
  const useSendMessageMutation = () =>
    useMutation({
      mutationFn: (data: ChatRequest) => chatService.sendMessage(data),
    });

  return { useSendMessageMutation };
};
