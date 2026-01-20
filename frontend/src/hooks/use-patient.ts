import type {
  CreatePatientRequest,
  ListPatientsParams,
} from "@/generated/models";
import {
  getListPatientsQueryKey,
  useCreatePatient,
  useDeletePatient,
  useGetPatient,
  useListPatients,
  useUpdatePatient,
} from "@/generated/patients/patients";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePatientCache = () => {
  const queryClient = useQueryClient();

  const invalidatePatientList = () =>
    queryClient.invalidateQueries({
      queryKey: getListPatientsQueryKey(),
    });

  return { queryClient, invalidatePatientList };
};

export const usePatientList = (params?: ListPatientsParams) => {
  const query = useListPatients(params);

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const usePatientDetail = (id: string) => {
  const query = useGetPatient(id);

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const usePatientCreate = () => {
  const { invalidatePatientList } = usePatientCache();

  const mutation = useCreatePatient({
    mutation: {
      onSuccess: () => {
        invalidatePatientList();
        toast.success("Patient created successfully");
      },
      onError: (error) => {
        toast.error(`Error creating patient: ${error.message}`);
      },
    },
  });

  return {
    createPatient: (data: CreatePatientRequest) => mutation.mutate({ data }),
    isCreating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export const usePatientUpdate = () => {
  const { invalidatePatientList } = usePatientCache();

  const mutation = useUpdatePatient({
    mutation: {
      onSuccess: () => {
        invalidatePatientList();
        toast.success("Patient updated successfully");
      },
      onError: (error) => {
        toast.error(`Error updating patient: ${error.message}`);
      },
    },
  });

  return {
    updatePatient: (id: string, data: CreatePatientRequest) =>
      mutation.mutate({ id, data }),
    isUpdating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export const usePatientDelete = () => {
  const { invalidatePatientList } = usePatientCache();

  const mutation = useDeletePatient({
    mutation: {
      onSuccess: () => {
        invalidatePatientList();
        toast.success("Patient deleted successfully");
      },
      onError: (error) => {
        toast.error(`Error deleting patient: ${error.message}`);
      },
    },
  });

  return {
    deletePatient: (id: string) => mutation.mutate({ id }),
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};
