import { useState } from "react";
import type { ToolbarFilter } from "../components/TableToolbar";

export type TableFilterConfig<T> = {
  key: string;
  label: string;
  allLabel?: string;
  getValue: (row: T) => string;
};

type TableControlsOptions<T> = {
  searchText: (row: T) => string;
  filters?: TableFilterConfig<T>[];
};

/**
 * Search, dropdown filters and pagination for a client-side table.
 * Filter options are built from the values present in the rows.
 */
export function useTableControls<T>(rows: T[], { searchText, filters = [] }: TableControlsOptions<T>) {
  // A ?search= in the address bar pre-fills the search, e.g. when following a link from the dashboard.
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get("search") ?? "");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const term = search.trim().toLowerCase();
  const filteredRows = rows.filter((row) =>
    (!term || searchText(row).toLowerCase().includes(term))
    && filters.every((filter) => !filterValues[filter.key] || filter.getValue(row) === filterValues[filter.key])
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const pagination = {
    page: currentPage,
    pageSize,
    totalRecords: filteredRows.length,
    onPageChange: setPage,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };

  const toolbarFilters: ToolbarFilter[] = filters.map((filter) => ({
    key: filter.key,
    label: filter.label,
    allLabel: filter.allLabel,
    value: filterValues[filter.key] ?? "",
    options: [...new Set(rows.map(filter.getValue).filter(Boolean))].sort(),
    onChange: (value: string) => {
      setFilterValues((current) => ({ ...current, [filter.key]: value }));
      setPage(1);
    },
  }));

  const toolbar = {
    search,
    onSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    filters: toolbarFilters,
    pagination,
  };

  /** Clear search and filters and go back to page 1, e.g. so a newly added row is visible. */
  const reset = () => {
    setSearch("");
    setFilterValues({});
    setPage(1);
  };

  return { filteredRows, pageRows, pagination, toolbar, reset };
}
