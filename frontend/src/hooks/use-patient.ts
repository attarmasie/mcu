import type {
  CreatePatientRequest,
  ListPatientsParams,
  Patient,
  Meta,
  UpdatePatientRequest,
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
import type {
  DetailHookResult,
  ListHookResult,
  MutationHookResult,
} from "./common/types";
import { mapDetailQuery, mapListQuery, mapMutation } from "./common/mappers";

export const usePatientCache = (): {
  queryClient: ReturnType<typeof useQueryClient>;
  invalidatePatientList: () => Promise<void>;
} => {
  const queryClient = useQueryClient();

  const invalidatePatientList = () =>
    queryClient.invalidateQueries({
      queryKey: getListPatientsQueryKey(),
    });

  return { queryClient, invalidatePatientList };
};

export const usePatientList = (
  params?: ListPatientsParams,
): ListHookResult<Patient, Meta> => {
  const query = useListPatients(params);
  return mapListQuery<Patient, Meta>(query);
};

export const usePatientDetail = (id: string): DetailHookResult<Patient> => {
  const query = useGetPatient(id);
  return mapDetailQuery<Patient>(query);
};

export type UsePatientCreateResult = MutationHookResult<{
  data: CreatePatientRequest;
}> & {
  createPatient: (data: CreatePatientRequest) => void;
  isCreating: boolean;
};

export const usePatientCreate = (): UsePatientCreateResult => {
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

  const mapped = mapMutation<{ data: CreatePatientRequest }>(mutation);

  return {
    ...mapped,
    createPatient: (data) => mapped.mutate({ data }),
    isCreating: mapped.isPending,
  };
};

export type UsePatientUpdateResult = MutationHookResult<{
  id: string;
  data: UpdatePatientRequest;
}> & {
  updatePatient: (id: string, data: UpdatePatientRequest) => void;
  isUpdating: boolean;
};

export const usePatientUpdate = (): UsePatientUpdateResult => {
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

  const mapped = mapMutation<{
    id: string;
    data: UpdatePatientRequest;
  }>(mutation);

  return {
    ...mapped,
    updatePatient: (id, data) => mapped.mutate({ id, data }),
    isUpdating: mapped.isPending,
  };
};

export type UsePatientDeleteResult = MutationHookResult<{ id: string }> & {
  deletePatient: (id: string) => void;
  isDeleting: boolean;
};

export const usePatientDelete = (): UsePatientDeleteResult => {
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

  const mapped = mapMutation<{ id: string }>(mutation);

  return {
    ...mapped,
    deletePatient: (id) => mapped.mutate({ id }),
    isDeleting: mapped.isPending,
  };
};
