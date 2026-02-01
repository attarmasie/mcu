import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useGetUser,
  getListUsersQueryKey,
  getGetUserQueryKey,
} from "@/generated/users/users";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ListUsersParams,
  User,
} from "@/generated/models";
import type {
  DetailHookResult,
  ListHookResult,
  MutationHookResult,
} from "./common/types";
import { mapDetailQuery, mapListQuery, mapMutation } from "./common/mappers";

export const useUsersCache = (): {
  queryClient: ReturnType<typeof useQueryClient>;
  invalidateUsersList: () => Promise<void>;
} => {
  const queryClient = useQueryClient();

  const invalidateUsersList = () =>
    queryClient.invalidateQueries({
      queryKey: getListUsersQueryKey(),
      exact: false,
    });

  return { queryClient, invalidateUsersList };
};

export const useUsersList = (
  params?: ListUsersParams,
): ListHookResult<User, unknown> => {
  const query = useListUsers(params);
  return mapListQuery<User, unknown>(query);
};

export const useUserDetail = (id: string): DetailHookResult<User> => {
  const query = useGetUser(id);
  return mapDetailQuery<User>(query);
};

export type UseUserCreateResult = MutationHookResult<{
  data: CreateUserRequest;
}> & {
  createUser: (data: CreateUserRequest) => void;
};

export const useUserCreate = (): UseUserCreateResult => {
  const { invalidateUsersList } = useUsersCache();

  const mutation = useCreateUser({
    mutation: {
      onMutate: async () => {
        toast.loading("Creating user...", { id: "create-user" });
        return {};
      },
      onSuccess: () => {
        invalidateUsersList();
        toast.success("User created successfully!", { id: "create-user" });
      },
      onError: (error) => {
        toast.error(`Failed to create user: ${error.message}`, {
          id: "create-user",
        });
      },
    },
  });

  const mapped = mapMutation<{ data: CreateUserRequest }>(mutation);

  return {
    ...mapped,
    createUser: (data) => mapped.mutate({ data }),
  };
};

export type UseUserUpdateResult = MutationHookResult<{
  id: string;
  data: UpdateUserRequest;
}> & {
  updateUser: (id: string, data: UpdateUserRequest) => void;
};

export const useUserUpdate = (): UseUserUpdateResult => {
  const { queryClient, invalidateUsersList } = useUsersCache();

  const mutation = useUpdateUser({
    mutation: {
      onMutate: async ({ id }) => {
        toast.loading("Updating user...", { id: `update-user-${id}` });

        await queryClient.cancelQueries({
          queryKey: getGetUserQueryKey(id),
        });

        const previousUser = queryClient.getQueryData(getGetUserQueryKey(id));

        return { previousUser };
      },
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({
          queryKey: getGetUserQueryKey(id),
        });

        invalidateUsersList();

        toast.success("User updated successfully!", {
          id: `update-user-${id}`,
        });
      },
      onError: (error, { id }, context) => {
        if (context?.previousUser) {
          queryClient.setQueryData(
            getGetUserQueryKey(id),
            context.previousUser,
          );
        }

        toast.error(`Failed to update user: ${error.message}`, {
          id: `update-user-${id}`,
        });
      },
    },
  });

  const mapped = mapMutation<{ id: string; data: UpdateUserRequest }>(mutation);

  return {
    ...mapped,
    updateUser: (id, data) => mapped.mutate({ id, data }),
  };
};

export type UseUserDeleteResult = MutationHookResult<{ id: string }> & {
  deleteUser: (id: string) => void;
};

export const useUserDelete = (): UseUserDeleteResult => {
  const { queryClient, invalidateUsersList } = useUsersCache();

  const mutation = useDeleteUser({
    mutation: {
      onMutate: async ({ id }) => {
        toast.loading("Deleting user...", { id: `delete-user-${id}` });

        await queryClient.cancelQueries({
          queryKey: getListUsersQueryKey(),
          exact: false,
        });

        const previousUsers = queryClient.getQueryData(getListUsersQueryKey());

        queryClient.setQueryData(
          getListUsersQueryKey(),
          (old: { data?: User[] } | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.filter((user) => user.id !== id),
            };
          },
        );

        return { previousUsers };
      },
      onSuccess: (_, { id }) => {
        invalidateUsersList();

        queryClient.removeQueries({
          queryKey: getGetUserQueryKey(id),
        });

        toast.success("User deleted successfully!", {
          id: `delete-user-${id}`,
        });
      },
      onError: (error, { id }, context) => {
        if (context?.previousUsers) {
          queryClient.setQueryData(
            getListUsersQueryKey(),
            context.previousUsers,
          );
        }

        toast.error(`Failed to delete user: ${error.message}`, {
          id: `delete-user-${id}`,
        });
      },
    },
  });

  const mapped = mapMutation<{ id: string }>(mutation);

  return {
    ...mapped,
    deleteUser: (id) => mapped.mutate({ id }),
  };
};
