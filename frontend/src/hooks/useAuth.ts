import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  RegisterData,
  LoginData,
  ResendVerificationEmailData,
} from "../services/auth.service";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Queries
  const useGetMeQuery = () =>
    useQuery({
      queryKey: ["auth", "me"],
      queryFn: () => authService.getMe(),
      retry: false, // Don't retry if 401
    });

  const useVerifyEmailQuery = (token: string) =>
    useQuery({
      queryKey: ["auth", "verifyEmail", token],
      queryFn: () => authService.verifyEmail(token),
      enabled: !!token,
      retry: false,
    });

  // Mutations
  const useRegisterMutation = () =>
    useMutation({
      mutationFn: (data: RegisterData) => authService.register(data),
    });

  const useLoginMutation = () =>
    useMutation({
      mutationFn: (data: LoginData) => authService.login(data),
      onSuccess: () => {
        // Invalidate 'me' query to fetch the user details after login
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      },
    });

  const useLogoutMutation = () =>
    useMutation({
      mutationFn: () => authService.logout(),
      onSuccess: () => {
        // Clear user data on logout
        queryClient.removeQueries({ queryKey: ["auth", "me"] });
        // Optional: you could reset the whole cache if needed: queryClient.clear()
      },
    });

  const useResendVerificationEmailMutation = () =>
    useMutation({
      mutationFn: (data: ResendVerificationEmailData) =>
        authService.resendVerificationEmail(data),
    });

  return {
    useGetMeQuery,
    useVerifyEmailQuery,
    useRegisterMutation,
    useLoginMutation,
    useLogoutMutation,
    useResendVerificationEmailMutation,
  };
};
