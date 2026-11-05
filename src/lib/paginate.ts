export const PAGE_SIZE = 8;

export interface Paged<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

// Cuts a full list into the slice for one page.
export function paginate<T>(list: T[], page: number, pageSize = PAGE_SIZE): Paged<T> {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: list.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalItems: list.length,
  };
}
