import { DataTable } from "@/components/common/data-table";
import { columns } from "@/components/pages/patient/columns";
import { PatientFormDialog } from "@/components/pages/patient/patient-form-dialog";
import type { ListPatientsParams } from "@/generated/models";
import {
  PatientGenderParamParameter,
  PatientTypeParamParameter,
} from "@/generated/models";
import { createFilterConfig, useDataTable } from "@/hooks/use-data-table";
import { usePatientList } from "@/hooks/use-patient";

const filterConfigs = [
  createFilterConfig("gender", "All Genders", PatientGenderParamParameter),
  createFilterConfig("patient_type", "All Types", PatientTypeParamParameter),
];

type PatientFilters = {
  gender: string;
  patient_type: string;
};

export function PatientListPage() {
  const {
    pagination,
    setPagination,
    search,
    handleSearchChange,
    filters,
    handleFilterChange,
    params,
  } = useDataTable<PatientFilters>({
    initialFilters: { gender: "", patient_type: "" },
  });

  const {
    data: patients,
    meta,
    isLoading,
  } = usePatientList(params as ListPatientsParams);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        <PatientFormDialog />
      </div>

      <DataTable
        columns={columns}
        data={patients}
        pagination={pagination}
        onPaginationChange={setPagination}
        meta={meta}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search name, phone, email, MRN..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
