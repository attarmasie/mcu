import type { Medicine } from "@/generated/models";
import type { ColumnDef } from "@tanstack/react-table";
import { MedicineActions } from "./medicine-actions";

export const columns: ColumnDef<Medicine>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "strength",
    header: "Strenght",
  },
  {
    accessorKey: "dosage_form",
    header: "Dosage Form",
  },
  {
    accessorKey: "is_prescription_required",
    header: "Is Prescription Required",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <MedicineActions medicine={row.original} />,
  },
];
