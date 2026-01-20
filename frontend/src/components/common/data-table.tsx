"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface PaginationState {
  page: number
  perPage: number
}

export interface PaginationMeta {
  page?: number
  per_page?: number
  total?: number
  total_pages?: number
}

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  meta?: PaginationMeta
  isLoading?: boolean
  // Search props
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  // Filter props
  filters?: FilterConfig[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  meta,
  isLoading,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  filterValues,
  onFilterChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.total_pages ?? -1,
  })

  const hasActiveFilters = searchValue || Object.values(filterValues ?? {}).some(v => v)

  const clearAllFilters = () => {
    onSearchChange?.("")
    if (filters && onFilterChange) {
      for (const filter of filters) {
        onFilterChange(filter.key, "")
      }
    }
  }

  return (
    <>
    {/* Search and Filters */}
    {(onSearchChange || filters) && (
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {onSearchChange && (
          <div className="relative flex-1 min-w-50 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        {filters?.map((filter) => (
          <select
            key={filter.key}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterValues?.[filter.key] ?? ""}
            onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    )}

    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Pagination Controls */}
    {pagination && onPaginationChange && (
      <div className="flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          {meta?.total ? (
            <>
              Showing {((pagination.page - 1) * pagination.perPage) + 1} to{" "}
              {Math.min(pagination.page * pagination.perPage, meta.total)} of{" "}
              {meta.total} results
            </>
          ) : (
            "No results"
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8">
          {/* Rows per page - hidden on very small screens */}
          <div className="hidden sm:flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-17.5 rounded-md border border-input bg-background px-2 text-sm"
              value={pagination.perPage}
              onChange={(e) =>
                onPaginationChange({
                  page: 1,
                  perPage: Number(e.target.value),
                })
              }
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          {/* Page indicator and navigation */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
              Page {pagination.page} of {meta?.total_pages ?? 1}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* First page - hidden on mobile */}
              <Button
                variant="outline"
                size="icon-sm"
                className="hidden sm:flex"
                onClick={() => onPaginationChange({ ...pagination, page: 1 })}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onPaginationChange({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onPaginationChange({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page >= (meta?.total_pages ?? 1) || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {/* Last page - hidden on mobile */}
              <Button
                variant="outline"
                size="icon-sm"
                className="hidden sm:flex"
                onClick={() =>
                  onPaginationChange({ ...pagination, page: meta?.total_pages ?? 1 })
                }
                disabled={pagination.page >= (meta?.total_pages ?? 1) || isLoading}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  )
}