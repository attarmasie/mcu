import { Badge } from "@/components/ui/badge";
import type { User } from "@/generated/models";
import type { ColumnDef } from "@tanstack/react-table";
import { UserActions } from "./user-action";

function getRoleBadgeVariant(
  role: string | undefined
): "default" | "secondary" | "outline" {
  switch (role) {
    case "admin":
      return "default";
    case "doctor":
      return "secondary";
    default:
      return "outline";
  }
}

function formatRole(role: string | undefined): string {
  if (!role) return "-";
  const roleMap: Record<string, string> = {
    admin: "Admin",
    doctor: "Doctor",
    operator: "Operator",
  };
  return roleMap[role] || role;
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={getRoleBadgeVariant(row.original.role)}>
        {formatRole(row.original.role)}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];