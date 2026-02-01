import type {
  CreateMedicineRequest,
  ListMedicinesParams,
  Medicine,
  Meta,
} from "@/generated/models";
import {
  getGetMedicineQueryKey,
  getListMedicinesQueryKey,
  useCreateMedicine,
  useDeleteMedicine,
  useGetMedicine,
  useListMedicines,
  useUpdateMedicine,
} from "@/generated/medicines/medicines";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  DetailHookResult,
  ListHookResult,
  MutationHookResult,
} from "./common/types";
import { mapDetailQuery, mapListQuery, mapMutation } from "./common/mappers";

export const useMedicineCache = (): {
  queryClient: ReturnType<typeof useQueryClient>;
  invalidateMedicineList: () => Promise<void>;
} => {
  const queryClient = useQueryClient();

  const invalidateMedicineList = () =>
    queryClient.invalidateQueries({
      queryKey: getListMedicinesQueryKey(),
    });

  return { queryClient, invalidateMedicineList };
};

export const useMedicineList = (
  params?: ListMedicinesParams,
): ListHookResult<Medicine, Meta> => {
  const query = useListMedicines(params);
  return mapListQuery<Medicine, Meta>(query);
};

export const useMedicineDetail = (id: string): DetailHookResult<Medicine> => {
  const query = useGetMedicine(id);
  return mapDetailQuery<Medicine>(query);
};

export const useMedicineCreate = (): MutationHookResult<{
  data: CreateMedicineRequest;
}> => {
  const { invalidateMedicineList } = useMedicineCache();

  const mutation = useCreateMedicine({
    mutation: {
      onSuccess: () => {
        invalidateMedicineList();
        toast.success("Medicine created successfully");
      },
      onError: (error) => {
        toast.error(`Error creating medicine: ${error.message}`);
      },
    },
  });

  return mapMutation<{ data: CreateMedicineRequest }>(mutation);
};

export type UseMedicineUpdateResult = MutationHookResult<{
  id: string;
  data: CreateMedicineRequest;
}> & {
  updateMedicine: (id: string, data: CreateMedicineRequest) => void;
  isUpdating: boolean;
};

export const useMedicineUpdate = (): UseMedicineUpdateResult => {
  const { queryClient, invalidateMedicineList } = useMedicineCache();

  const mutation = useUpdateMedicine({
    mutation: {
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({
          queryKey: getGetMedicineQueryKey(id),
        });
        invalidateMedicineList();
        toast.success("Medicine updated successfully");
      },
      onError: (error) => {
        toast.error(`Error updating medicine: ${error.message}`);
      },
    },
  });

  const mapped = mapMutation<{
    id: string;
    data: CreateMedicineRequest;
  }>(mutation);

  return {
    ...mapped,
    updateMedicine: (id, data) => mapped.mutate({ id, data }),
    isUpdating: mapped.isPending,
  };
};

export type UseMedicineDeleteResult = MutationHookResult<{ id: string }> & {
  deleteMedicine: (id: string) => void;
  isDeleting: boolean;
};

export const useMedicineDelete = (): UseMedicineDeleteResult => {
  const { queryClient, invalidateMedicineList } = useMedicineCache();

  const mutation = useDeleteMedicine({
    mutation: {
      onSuccess: (_data, { id }) => {
        queryClient.removeQueries({
          queryKey: getGetMedicineQueryKey(id),
        });
        invalidateMedicineList();
        toast.success("Medicine deleted successfully");
      },
      onError: (error) => {
        toast.error(`Error deleting medicine: ${error.message}`);
      },
    },
  });

  const mapped = mapMutation<{ id: string }>(mutation);

  return {
    ...mapped,
    deleteMedicine: (id) => mapped.mutate({ id }),
    isDeleting: mapped.isPending,
  };
};
