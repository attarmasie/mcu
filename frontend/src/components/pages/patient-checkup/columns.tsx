import { Badge } from "@/components/ui/badge";
import type { PatientCheckup } from "@/generated/models";
import type { ColumnDef } from "@tanstack/react-table";
import { PatientCheckupActions } from "./patient-checkup-actions";

function statusVariant(
  status?: string,
): "default" | "secondary" | "destructive" {
  if (status === "completed") return "default";
  if (status === "cancelled") return "destructive";
  return "secondary";
}

export type PatientCheckupRow = PatientCheckup & {
  patient_name?: string;
};

export const columns: ColumnDef<PatientCheckupRow>[] = [
  {
    accessorKey: "visit_date",
    header: "Visit Date",
    cell: ({ row }) =>
      new Date(row.original.visit_date).toLocaleString("id-ID"),
  },
  {
    accessorKey: "patient_name",
    header: "Patient",
    cell: ({ row }) => row.original.patient_name || row.original.patient_id,
  },
  {
    accessorKey: "chief_complaint",
    header: "Chief Complaint",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "doctor_name",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor_name || "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PatientCheckupActions checkup={row.original} />,
  },
];
