import { Badge } from '../../../components/ui/Badge'
import { CATEGORY_LABELS, type ExpenseCategory } from '../../../types/expense.types'

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategory
}

export function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  return <Badge variant="default">{CATEGORY_LABELS[category]}</Badge>
}
