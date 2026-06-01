import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addComment,
  canAccessTicket,
  closeTicket,
  getAssigneeOptions,
  getTicket,
  reopenTicket,
  updateTicket,
} from '../../api/tickets.api'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import type {
  AddCommentFormInput,
  TicketPriority,
  TicketStatus,
} from '../../types/ticket.types'

export function useTicketDetailPageViewModel() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)

  const isAdmin = user?.role === 'super_admin' || user?.role === 'hr_admin'
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const { data: assignees = [] } = useQuery({
    queryKey: ['ticket-assignees'],
    queryFn: getAssigneeOptions,
    enabled: isAdmin,
  })

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id, isAdmin],
    queryFn: () => getTicket(id!, { includeInternal: isAdmin }),
    enabled: Boolean(id),
  })

  const isOwner = ticket?.createdBy.id === user?.id

  useEffect(() => {
    if (!id || !user || isLoading) return
    if (ticket && !canAccessTicket(id, user.id, isAdmin)) {
      navigate('/tickets', { replace: true })
    }
  }, [id, user, ticket, isLoading, isAdmin, navigate])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    void queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
  }

  const commentMutation = useMutation({
    mutationFn: (data: AddCommentFormInput) =>
      addComment(
        id!,
        {
          id: user!.id,
          name: user!.name,
          role: user!.role,
        },
        data,
        { includeInternal: isAdmin },
      ),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Comment added')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const updateMutation = useMutation({
    mutationFn: (data: {
      status?: TicketStatus
      priority?: TicketPriority
      assignedToId?: string
    }) => updateTicket(id!, data, { includeInternal: isAdmin }),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Ticket updated')
      setIsAssignModalOpen(false)
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const closeMutation = useMutation({
    mutationFn: () => closeTicket(id!, { includeInternal: isAdmin }),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Ticket closed')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const reopenMutation = useMutation({
    mutationFn: () => reopenTicket(id!, { includeInternal: isAdmin }),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Ticket reopened')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const isSubmitting =
    commentMutation.isPending ||
    updateMutation.isPending ||
    closeMutation.isPending ||
    reopenMutation.isPending

  return {
    ticket,
    isLoading,
    isAdmin,
    isOwner: isOwner ?? false,
    onSubmitComment: (data: AddCommentFormInput) => commentMutation.mutate(data),
    isSubmittingComment: commentMutation.isPending,
    onUpdateStatus: (status: TicketStatus) => updateMutation.mutate({ status }),
    onUpdatePriority: (priority: TicketPriority) => updateMutation.mutate({ priority }),
    onAssign: (assigneeId: string) => updateMutation.mutate({ assignedToId: assigneeId }),
    onMarkResolved: () => updateMutation.mutate({ status: 'resolved' }),
    onCloseTicket: () => closeMutation.mutate(),
    onReopen: () => reopenMutation.mutate(),
    isAssignModalOpen,
    openAssignModal: () => setIsAssignModalOpen(true),
    closeAssignModal: () => setIsAssignModalOpen(false),
    assignees,
    isSubmitting,
  }
}
