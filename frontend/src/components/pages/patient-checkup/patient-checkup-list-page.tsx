import { DataTable } from "@/components/common/data-table";
import {
  columns,
  type PatientCheckupRow,
} from "@/components/pages/patient-checkup/columns";
import { PatientCheckupFormDialog } from "@/components/pages/patient-checkup/patient-checkup-form-dialog";
import type { ListPatientCheckupsParams } from "@/generated/models";
import { PatientCheckupStatusParamParameter } from "@/generated/models";
import { createFilterConfig, useDataTable } from "@/hooks/use-data-table";
import { usePatientList } from "@/hooks/use-patient";
import { usePatientCheckupList } from "@/hooks/use-patient-checkup";
import { useMemo } from "react";

const filterConfigs = [
  createFilterConfig(
    "status",
    "All Status",
    PatientCheckupStatusParamParameter,
  ),
];

type PatientCheckupFilters = {
  status: string;
};

export function PatientCheckupListPage() {
  const {
    pagination,
    setPagination,
    search,
    handleSearchChange,
    filters,
    handleFilterChange,
    params,
  } = useDataTable<PatientCheckupFilters>({
    initialFilters: { status: "" },
  });

  const {
    data: checkups,
    meta,
    isLoading,
  } = usePatientCheckupList(params as ListPatientCheckupsParams);
  const { data: patients } = usePatientList({ page: 1, per_page: 1000 });

  const checkupRows = useMemo<PatientCheckupRow[]>(() => {
    const nameMap = new Map(
      patients.map((patient) => [patient.id, patient.full_name]),
    );
    return checkups.map((checkup) => ({
      ...checkup,
      patient_name: nameMap.get(checkup.patient_id),
    }));
  }, [checkups, patients]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patient Checkups</h1>
        <PatientCheckupFormDialog />
      </div>

      <DataTable
        columns={columns}
        data={checkupRows}
        pagination={pagination}
        onPaginationChange={setPagination}
        meta={meta}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search complaint, diagnosis, notes..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
