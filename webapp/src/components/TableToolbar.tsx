import type { ComponentProps } from "react";
import TablePagination from "./TablePagination";

export type ToolbarFilter = {
  key: string;
  label: string;
  allLabel?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

type TableToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
  pagination: ComponentProps<typeof TablePagination>;
};

/** Search box and filters on the left, pagination on the right, in one row. */
function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  pagination,
}: TableToolbarProps) {
  return (
    <div className="table-toolbar">
      <div className="table-toolbar-filters">
        <input
          type="search"
          className="table-search-input"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {filters.map((filter) => (
          <select
            key={filter.key}
            className="table-filter-select"
            aria-label={filter.label}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
          >
            <option value="">{filter.allLabel ?? `All ${filter.label.toLowerCase()}`}</option>
            {filter.options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ))}
      </div>
      <TablePagination {...pagination} />
    </div>
  );
}

export default TableToolbar;
