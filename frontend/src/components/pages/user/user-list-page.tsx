import { DataTable } from "@/components/common/data-table";
import type { ListUsersParams } from "@/generated/models";
import { useDataTable } from "@/hooks/use-data-table";
import { useUsersList } from "@/hooks/use-users";
import { columns } from "./columns";

export function UsersListPage() {
    const {
        pagination,
        setPagination,
        params,
    } = useDataTable()

    const {
        users,
        meta,
        isLoading,
    } = useUsersList(params as ListUsersParams);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Users</h1>
                {/* <UserFormDialog /> */}
            </div>

            <DataTable
                columns={columns}
                data={users}
                pagination={pagination}
                onPaginationChange={setPagination}
                meta={meta}
                isLoading={isLoading}

            />
        </div>
    )
}