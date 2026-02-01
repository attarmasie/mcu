/**
 * Result type for list hooks
 */
export type ListHookResult<TData, TMeta = unknown> = {
  data: TData[];
  meta?: TMeta;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Result type for detail hooks
 */
export type DetailHookResult<TData> = {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Result type for mutation hooks
 */
export type MutationHookResult<TPayload> = {
  mutate: (payload: TPayload) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};
