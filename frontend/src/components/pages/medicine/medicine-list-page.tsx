import { DataTable } from "@/components/common/data-table";
import { columns } from "@/components/pages/medicine/columns";
import type { ListMedicinesParams } from "@/generated/models";
import {
  MedicineDosageFormParamParameter,
  MedicineStatusParamParameter,
} from "@/generated/models";
import { createFilterConfig, useDataTable } from "@/hooks/use-data-table";
import { useMedicineList } from "@/hooks/use-medicine";
import { AlertTriangle } from "lucide-react";
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

  const lowStockMedicines = medicines.filter(
    (m) => m.current_stock <= m.minimum_stock,
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <MedicineFormDialog />
      </div>

      {lowStockMedicines.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-destructive">
              {lowStockMedicines.length} obat dengan stok rendah
            </p>
            <p className="text-xs text-destructive/80">
              {lowStockMedicines.map((m) => m.name).join(", ")}
            </p>
          </div>
        </div>
      )}

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
