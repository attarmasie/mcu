import type {
  CreatePatientCheckupRequest,
  ListPatientCheckupsParams,
  Meta,
  PatientCheckup,
  UpdatePatientCheckupRequest,
} from "@/generated/models";
import {
  getGetPatientCheckupQueryKey,
  getListPatientCheckupsQueryKey,
  useCreatePatientCheckup,
  useDeletePatientCheckup,
  useGetPatientCheckup,
  useListPatientCheckups,
  useUpdatePatientCheckup,
} from "@/generated/patient-checkups/patient-checkups";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mapDetailQuery, mapListQuery, mapMutation } from "./common/mappers";
import type {
  DetailHookResult,
  ListHookResult,
  MutationHookResult,
} from "./common/types";

export const usePatientCheckupCache = (): {
  queryClient: ReturnType<typeof useQueryClient>;
  invalidatePatientCheckupList: () => Promise<void>;
} => {
  const queryClient = useQueryClient();

  const invalidatePatientCheckupList = () =>
    queryClient.invalidateQueries({
      queryKey: getListPatientCheckupsQueryKey(),
    });

  return { queryClient, invalidatePatientCheckupList };
};

export const usePatientCheckupList = (
  params?: ListPatientCheckupsParams,
): ListHookResult<PatientCheckup, Meta> => {
  const query = useListPatientCheckups(params);
  return mapListQuery<PatientCheckup, Meta>(query);
};

export const usePatientCheckupDetail = (
  id: string,
): DetailHookResult<PatientCheckup> => {
  const query = useGetPatientCheckup(id);
  return mapDetailQuery<PatientCheckup>(query);
};

export type UsePatientCheckupCreateResult = MutationHookResult<{
  data: CreatePatientCheckupRequest;
}> & {
  createPatientCheckup: (data: CreatePatientCheckupRequest) => void;
  isCreating: boolean;
};

export const usePatientCheckupCreate = (): UsePatientCheckupCreateResult => {
  const { invalidatePatientCheckupList } = usePatientCheckupCache();

  const mutation = useCreatePatientCheckup({
    mutation: {
      onSuccess: () => {
        invalidatePatientCheckupList();
        toast.success("Patient checkup created successfully");
      },
      onError: (error) => {
        toast.error(`Error creating patient checkup: ${error.message}`);
      },
    },
  });

  const mapped = mapMutation<{ data: CreatePatientCheckupRequest }>(mutation);

  return {
    ...mapped,
    createPatientCheckup: (data) => mapped.mutate({ data }),
    isCreating: mapped.isPending,
  };
};

export type UsePatientCheckupUpdateResult = MutationHookResult<{
  id: string;
  data: UpdatePatientCheckupRequest;
}> & {
  updatePatientCheckup: (id: string, data: UpdatePatientCheckupRequest) => void;
  updatePatientCheckupAsync: (
    id: string,
    data: UpdatePatientCheckupRequest,
  ) => Promise<unknown>;
  isUpdating: boolean;
};

export const usePatientCheckupUpdate = (): UsePatientCheckupUpdateResult => {
  const { queryClient, invalidatePatientCheckupList } =
    usePatientCheckupCache();

  const mutation = useUpdatePatientCheckup({
    mutation: {
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({
          queryKey: getGetPatientCheckupQueryKey(id),
        });
        invalidatePatientCheckupList();
        toast.success("Patient checkup updated successfully");
      },
      onError: (error) => {
        const apiMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? error.message;
        toast.error(`Error updating patient checkup: ${apiMessage}`);
      },
    },
  });

  const mapped = mapMutation<{
    id: string;
    data: UpdatePatientCheckupRequest;
  }>(mutation);

  return {
    ...mapped,
    updatePatientCheckup: (id, data) => mapped.mutate({ id, data }),
    updatePatientCheckupAsync: (id, data) => mutation.mutateAsync({ id, data }),
    isUpdating: mapped.isPending,
  };
};

export type UsePatientCheckupDeleteResult = MutationHookResult<{
  id: string;
}> & {
  deletePatientCheckup: (id: string) => void;
  isDeleting: boolean;
};

export const usePatientCheckupDelete = (): UsePatientCheckupDeleteResult => {
  const { queryClient, invalidatePatientCheckupList } =
    usePatientCheckupCache();

  const mutation = useDeletePatientCheckup({
    mutation: {
      onSuccess: (_data, { id }) => {
        queryClient.removeQueries({
          queryKey: getGetPatientCheckupQueryKey(id),
        });
        invalidatePatientCheckupList();
        toast.success("Patient checkup deleted successfully");
      },
      onError: (error) => {
        toast.error(`Error deleting patient checkup: ${error.message}`);
      },
    },
  });

  const mapped = mapMutation<{ id: string }>(mutation);

  return {
    ...mapped,
    deletePatientCheckup: (id) => mapped.mutate({ id }),
    isDeleting: mapped.isPending,
  };
};
