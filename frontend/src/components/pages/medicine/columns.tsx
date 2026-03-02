import { Badge } from "@/components/ui/badge";
import type { Medicine } from "@/generated/models";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
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
    header: "Strength",
  },
  {
    accessorKey: "dosage_form",
    header: "Dosage Form",
  },
  {
    id: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const { current_stock, minimum_stock } = row.original;
      const isLowStock = current_stock <= minimum_stock;

      return (
        <div className="flex items-center gap-2">
          <span className={isLowStock ? "text-destructive font-semibold" : ""}>
            {current_stock}
          </span>
          <span className="text-muted-foreground text-xs">
            / min: {minimum_stock}
          </span>
          {isLowStock && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_prescription_required",
    header: "Prescription",
    cell: ({ row }) => (row.original.is_prescription_required ? "Yes" : "No"),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <MedicineActions medicine={row.original} />,
  },
];
