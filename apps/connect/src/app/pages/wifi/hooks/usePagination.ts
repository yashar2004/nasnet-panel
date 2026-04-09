import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  pageSize?: number;
}

interface UsePaginationReturn {
  page: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination({
  totalItems,
  pageSize = 10,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPageRaw] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if current page exceeds total
  const safePage = Math.min(page, totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const setPage = useCallback(
    (p: number) => setPageRaw(Math.max(1, Math.min(p, totalPages))),
    [totalPages]
  );

  const nextPage = useCallback(
    () => setPageRaw((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );

  const prevPage = useCallback(
    () => setPageRaw((p) => Math.max(p - 1, 1)),
    []
  );

  return useMemo(
    () => ({ page: safePage, totalPages, startIndex, endIndex, setPage, nextPage, prevPage }),
    [safePage, totalPages, startIndex, endIndex, setPage, nextPage, prevPage]
  );
}
