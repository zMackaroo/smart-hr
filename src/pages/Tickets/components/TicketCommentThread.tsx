import { UserAvatar } from '../../../components/layout/UserAvatar'
import { formatRelativeTime } from '../../../utils/date.utils'
import type { TicketComment } from '../../../types/ticket.types'

interface TicketCommentThreadProps {
  comments: TicketComment[]
  isAdmin: boolean
}

const ROLE_LABELS = {
  super_admin: 'Admin',
  hr_admin: 'HR Admin',
  employee: 'Employee',
} as const

export function TicketCommentThread({ comments, isAdmin }: TicketCommentThreadProps) {
  const visibleComments = isAdmin
    ? comments
    : comments.filter((c) => !c.isInternal)

  if (visibleComments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">No comments yet. Be the first to reply.</p>
    )
  }

  return (
    <div className="space-y-4">
      {visibleComments.map((comment) => (
        <div
          key={comment.id}
          className={`rounded-lg border border-border/70 p-4 ${
            comment.isInternal
              ? 'border-l-4 border-l-warning bg-[var(--state-warning-bg)]/30'
              : 'bg-surface'
          }`}
        >
          <div className="mb-2 flex items-start gap-3">
            <UserAvatar
              name={comment.author.name}
              avatarUrl={comment.author.avatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-primary">{comment.author.name}</span>
                {isAdmin && comment.author.role !== 'employee' && (
                  <span className="text-xs text-muted">{ROLE_LABELS[comment.author.role]}</span>
                )}
                {comment.isInternal && (
                  <span className="rounded bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    Internal Note
                  </span>
                )}
                <span className="text-xs text-muted">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-secondary">{comment.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
