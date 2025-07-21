export const debounse = <T extends unknown[]>(func: (...args: T) => void, delay: number = 300) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export function paginateLocally<T extends object>(items: T[], page: number, limit: number) {
  const totalRecords = items.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedItems = items.slice(start, end);

  return {
    message: 'OK',
    total_pages: totalPages,
    total_records: totalRecords,
    previous: page > 1 ? `page=${page - 1}` : null,
    next: page < totalPages ? `page=${page + 1}` : null,
    results: paginatedItems,
  };
}
