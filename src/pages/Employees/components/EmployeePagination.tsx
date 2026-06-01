import { Button } from '../../../components/ui/Button'

interface EmployeePaginationProps {
  page: number
  totalPages: number
  start: number
  end: number
  total: number
  onPageChange: (page: number) => void
}

export function EmployeePagination({
  page,
  totalPages,
  start,
  end,
  total,
  onPageChange,
}: EmployeePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    page + 2,
  )

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-secondary">
        Showing {total === 0 ? 0 : start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
