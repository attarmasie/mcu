import type { User } from "@/generated/models";
import type { ColumnDef } from "@tanstack/react-table";

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
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => <div>Actions</div>,
    }
];