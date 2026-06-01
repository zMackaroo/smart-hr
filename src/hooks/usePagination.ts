import { useMemo, useState } from 'react'

interface UsePaginationOptions {
  totalItems: number
  perPage?: number
  initialPage?: number
}

export function usePagination({
  totalItems,
  perPage = 20,
  initialPage = 1,
}: UsePaginationOptions) {
  const [page, setPage] = useState(initialPage)

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))

  const pagination = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1
    const end = Math.min(safePage * perPage, totalItems)

    return {
      page: safePage,
      perPage,
      totalPages,
      start,
      end,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
    }
  }, [page, perPage, totalItems, totalPages])

  const onPageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return {
    ...pagination,
    setPage: onPageChange,
    onPageChange,
  }
}
