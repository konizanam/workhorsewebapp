type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function TablePagination({
  page,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const pages = totalPages <= 5
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [1, 2, 3, -1, totalPages];

  return (
    <div className="table-pagination">
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <div className="pagination-pages">
        {pages.map((pageNumber, index) => pageNumber === -1 ? (
          <span className="pagination-ellipsis" key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            type="button"
            className={pageNumber === page ? "active" : ""}
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
      <label className="page-size-control">
        Show
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {[10, 50, 100, 250].map((size) => <option value={size} key={size}>{size}</option>)}
        </select>
      </label>
    </div>
  );
}

export default TablePagination;
