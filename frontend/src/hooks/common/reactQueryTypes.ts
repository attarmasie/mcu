/**
 * Base shape for list query (paginated)
 */
export interface BaseListQuery<TData, TMeta = unknown, TError = unknown> {
  data?: {
    data?: TData[];
    meta?: TMeta;
  };
  isLoading: boolean;
  isError: boolean;
  error: TError | null;
  refetch: () => void;
}

/**
 * Base shape for detail query
 */
export interface BaseDetailQuery<TData, TError = unknown> {
  data?: {
    data?: TData;
  };
  isLoading: boolean;
  isError: boolean;
  error: TError | null;
  refetch: () => void;
}

/**
 * Base shape for mutation
 */
export interface BaseMutation<TPayload, TError = unknown> {
  mutate: (payload: TPayload) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: TError | null;
  reset: () => void;
}
