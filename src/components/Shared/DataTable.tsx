import React, { useMemo } from 'react';

export interface PaginatedResponse<T> {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: T[];
}

interface PaginatedTableProps<T> {
  data: PaginatedResponse<T>;
  pageLimit: number;
  currentPage?: number;
  onPageNumberChange?: (page: number) => void;
  columns: Array<{
    header: string;
    key: string;
    render?: (item: T) => React.ReactNode;
  }>;
  getRowKey: (item: T) => string;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  onRetry?: () => void;
  onPageChange?: (direction: 'next' | 'prev') => void;
  emptyText?: string;
  height?: string;
}

export function PaginatedTable<T>({
  data,
  pageLimit,
  currentPage = 1,
  onPageNumberChange,
  columns,
  getRowKey,
  isLoading = false,
  isError = false,
  onRetry,
  onPageChange,
  loadingMessage = 'Loading...',
  emptyText = 'No data available',
  height = '500px',
}: PaginatedTableProps<T>) {
  const isServerPaginated = data.next !== null || data.previous !== null;

  const paginatedData = useMemo(() => {
    if (isServerPaginated) {
      return data.results;
    }
    const startIndex = (currentPage - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    return data.results.slice(startIndex, endIndex);
  }, [data.results, currentPage, pageLimit, isServerPaginated]);

  const totalPages = isServerPaginated
    ? data.total_pages
    : Math.ceil(data.results.length / pageLimit);

  const startRecord = isServerPaginated
    ? (data.total_pages - (data.total_pages - 1) - 1) * pageLimit + 1
    : (currentPage - 1) * pageLimit + 1;

  const endRecord = isServerPaginated
    ? Math.min(startRecord + paginatedData.length - 1, data.total_records)
    : Math.min(currentPage * pageLimit, data.results.length);

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (isServerPaginated && onPageChange) {
      onPageChange(direction);
    } else if (onPageNumberChange) {
      if (direction === 'next' && currentPage < totalPages) {
        onPageNumberChange(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 1) {
        onPageNumberChange(currentPage - 1);
      }
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-6 py-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">{loadingMessage}</span>
            </div>
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-6 py-8 text-center">
            <div className="space-y-3">
              <p className="text-red-600">Something went wrong</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-6 py-8 text-center">
            <p className="text-gray-500">{emptyText}</p>
          </td>
        </tr>
      );
    }

    return paginatedData.map((item) => (
      <tr key={getRowKey(item)} className="hover:bg-gray-50">
        {columns.map((column) => (
          <td
            key={column.key as string}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
          >
            {column.render
              ? column.render(item)
              : ((item as { [column.key]: string })[column.key] ?? '')}
          </td>
        ))}
      </tr>
    ));
  };

  const renderPaginationFooter = () => {
    const shouldShowPagination =
      !isLoading && !isError && (paginatedData.length > 0 || isServerPaginated);

    if (!shouldShowPagination) {
      return null;
    }

    return (
      <tr className="bg-gray-50 border-t-2 border-gray-200">
        <td colSpan={columns.length} className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {startRecord}–{endRecord} of {data.total_records}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={isServerPaginated ? !data.previous : currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange('next')}
                disabled={isServerPaginated ? !data.next : currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div
      className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      style={{ height }}
    >
      <div className="h-full flex flex-col overflow-auto relative">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">{renderTableContent()}</tbody>

          <tfoot className="sticky bottom-0 z-10">{renderPaginationFooter()}</tfoot>
        </table>
      </div>
    </div>
  );
}
