import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
  useLogin,
} from "@/generated/auth/auth";
import type { AuthResponse, LoginRequest } from "@/generated/models";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const login = useLogin({
    mutation: {
      onMutate: async () => {
        const toastId = toast.loading("Logging in...");
        return { toastId };
      },
      onSuccess: async (data: AuthResponse, _variables, context) => {
        if (context?.toastId) toast.dismiss(context.toastId);

        sessionStorage.setItem("authToken", data.token);

        queryClient.removeQueries({
          queryKey: getGetCurrentUserQueryKey(),
        });

        await queryClient.prefetchQuery({
          queryKey: getGetCurrentUserQueryKey(),
          staleTime: Infinity,
        });

        toast.success("Login successful!");
        navigate({ to: "/dashboard" });
      },
      onError: (error, _, context) => {
        if (context?.toastId) toast.dismiss(context.toastId);
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          toast.error(
            `Login failed: ${(axiosError.response.data as any).message || axiosError.message}`
          );
        } else {
          toast.error(`Login failed: ${axiosError.message}`);
        }
      },
    },
  });

  const logout = () => {
    sessionStorage.removeItem("authToken");
    queryClient.clear();
    queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    navigate({ to: "/" });
  };

  const getCurrentUser = () => {
    const query = useGetCurrentUser({
      query: {
        queryKey: getGetCurrentUserQueryKey(),
        enabled: !!sessionStorage.getItem("authToken"),
        staleTime: Infinity,

        gcTime: Infinity,

        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

        retry: 1,
      },
    });

    return {
      user: query.data,
      isLoading: query.isPending,
      isError: query.isError,
      error: query.error,
    };
  };

  return {
    login: {
      mutate: (data: LoginRequest) => login.mutateAsync({ data }),
      isLoggingIn: login.isPending,
      isSuccess: login.isSuccess,
      isError: login.isError,
      error: login.error,
      reset: login.reset,
    },
    logout,
    getCurrentUser,
  };
};
