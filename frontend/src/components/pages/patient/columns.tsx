"use client"

import type { Patient } from "@/generated/models"
import type { ColumnDef } from "@tanstack/react-table"
import { PatientActions } from "./patient-actions"

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "medical_record_number",
    header: "Medical Record Number",
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorKey: "date_of_birth",
    header: "Date of Birth",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "patient_type",
    header: "Patient Type",
  },
  {
    accessorKey: "phone_number",
    header: "Phone Number",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PatientActions patient={row.original} />,
  },
]