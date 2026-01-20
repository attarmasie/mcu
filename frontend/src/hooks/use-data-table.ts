import type { PaginationState, FilterConfig } from "@/components/common/data-table";
import { useState, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface UseDataTableOptions<TFilters extends Record<string, string>> {
  initialPage?: number;
  initialPerPage?: number;
  initialSearch?: string;
  initialFilters?: TFilters;
  searchDebounceMs?: number;
}

export interface UseDataTableReturn<TFilters extends Record<string, string>> {
  // Pagination
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  
  // Search
  search: string;
  debouncedSearch: string;
  handleSearchChange: (value: string) => void;
  
  // Filters
  filters: TFilters;
  handleFilterChange: (key: string, value: string) => void;
  
  // Reset
  resetAll: () => void;
  
  // Params ready for API
  params: {
    page: number;
    per_page: number;
    search: string | undefined;
  } & { [K in keyof TFilters]?: TFilters[K] | undefined };
}

export function useDataTable<TFilters extends Record<string, string>>(
  options: UseDataTableOptions<TFilters> = {}
): UseDataTableReturn<TFilters> {
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSearch = "",
    initialFilters = {} as TFilters,
    searchDebounceMs = 300,
  } = options;

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    perPage: initialPerPage,
  });

  // Search state
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Filter state
  const [filters, setFilters] = useState<TFilters>(initialFilters);

  // Debounced search handler
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, searchDebounceMs);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const resetAll = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setFilters(initialFilters);
    setPagination({ page: initialPage, perPage: initialPerPage });
  }, [initialFilters, initialPage, initialPerPage]);

  // Build params object for API calls
  const params = useMemo(() => {
    const baseParams = {
      page: pagination.page,
      per_page: pagination.perPage,
      search: debouncedSearch || undefined,
    };

    // Add non-empty filter values
    const filterParams: Partial<TFilters> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        filterParams[key as keyof TFilters] = value as TFilters[keyof TFilters];
      }
    }

    return { ...baseParams, ...filterParams };
  }, [pagination, debouncedSearch, filters]);

  return {
    pagination,
    setPagination,
    search,
    debouncedSearch,
    handleSearchChange,
    filters,
    handleFilterChange,
    resetAll,
    params,
  };
}

// Helper to create filter config from enum-like objects
export function createFilterConfig<T extends Record<string, string>>(
  key: string,
  label: string,
  enumObj: T,
  labelFormatter?: (key: string) => string
): FilterConfig {
  const defaultFormatter = (key: string) => 
    key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
  
  const formatter = labelFormatter ?? defaultFormatter;

  return {
    key,
    label,
    options: Object.entries(enumObj).map(([k, value]) => ({
      label: formatter(k),
      value,
    })),
  };
}
