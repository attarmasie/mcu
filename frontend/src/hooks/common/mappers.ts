import type {
  ListHookResult,
  DetailHookResult,
  MutationHookResult,
} from "./types";

/**
 * Mapper for list query
 */
export const mapListQuery = <TData, TMeta = unknown>(query: {
  data?: { data?: TData[]; meta?: TMeta };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}): ListHookResult<TData, TMeta> => ({
  data: query.data?.data ?? [],
  meta: query.data?.meta,
  isLoading: query.isLoading,
  isError: query.isError,
  error: query.error as Error | null,
  refetch: query.refetch,
});

/**
 * Mapper for detail query
 */
export const mapDetailQuery = <TData>(query: {
  data?: { data?: TData };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}): DetailHookResult<TData> => ({
  data: query.data?.data,
  isLoading: query.isLoading,
  isError: query.isError,
  error: query.error as Error | null,
  refetch: query.refetch,
});

/**
 * Mapper for mutation
 */
export const mapMutation = <TPayload>(mutation: {
  mutate: (payload: TPayload) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  reset: () => void;
}): MutationHookResult<TPayload> => ({
  mutate: mutation.mutate,
  isPending: mutation.isPending,
  isSuccess: mutation.isSuccess,
  isError: mutation.isError,
  error: mutation.error as Error | null,
  reset: mutation.reset,
});
