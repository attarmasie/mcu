import { DataTable } from "@/components/common/data-table";
import { columns } from "@/components/pages/medicine/columns";
import type { ListMedicinesParams } from "@/generated/models";
import {
  MedicineDosageFormParamParameter,
  MedicineStatusParamParameter,
} from "@/generated/models";
import { createFilterConfig, useDataTable } from "@/hooks/use-data-table";
import { useMedicineList } from "@/hooks/use-medicine";
import { MedicineFormDialog } from "./medicine-form-dialog";

const filterConfigs = [
  createFilterConfig("status", "All Status", MedicineStatusParamParameter),
  createFilterConfig(
    "dosage_form",
    "All Dosage Forms",
    MedicineDosageFormParamParameter,
  ),
  createFilterConfig("is_prescription_required", "All Prescription Types", {
    true: "Prescription Required",
    false: "Over The Counter",
  }),
];

type MedicineFilters = {
  status: string;
  dosage_form?: string;
  is_prescription_required?: string;
};

export function MedicineListPage() {
  const {
    pagination,
    setPagination,
    search,
    handleSearchChange,
    filters,
    handleFilterChange,
    params,
  } = useDataTable<MedicineFilters>({
    initialFilters: {
      status: "",
      dosage_form: "",
      is_prescription_required: "",
    },
  });

  const {
    data: medicines,
    meta,
    isLoading,
  } = useMedicineList(params as ListMedicinesParams);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <MedicineFormDialog />
      </div>

      <DataTable
        columns={columns}
        data={medicines}
        pagination={pagination}
        onPaginationChange={setPagination}
        meta={meta}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search name, code..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
