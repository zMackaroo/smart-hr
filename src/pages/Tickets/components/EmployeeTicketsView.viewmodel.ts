import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket, getMyTickets } from '../../../api/tickets.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type { CreateTicketFormInput, TicketStatus } from '../../../types/ticket.types'

export function useEmployeeTicketsViewModel() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)

  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
  const [page, setPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', user?.id, statusFilter, page],
    queryFn: () =>
      getMyTickets(user?.id ?? '', {
        status: statusFilter || undefined,
        page,
        perPage: 20,
      }),
    enabled: Boolean(user?.id),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTicketFormInput) => createTicket(user?.id ?? '', data),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
      addNotification('success', 'Ticket created successfully')
      setIsCreateModalOpen(false)
      navigate(`/tickets/${ticket.id}`)
    },
    onError: (error: Error) => {
      addNotification('error', error.message)
    },
  })

  const tickets = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const perPage = data?.perPage ?? 20
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return {
    tickets,
    isLoading,
    statusFilter,
    setStatusFilter: (s: TicketStatus | '') => {
      setStatusFilter(s)
      setPage(1)
    },
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
    isCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    onSubmitCreate: (data: CreateTicketFormInput) => createMutation.mutate(data),
    isSubmitting: createMutation.isPending,
  }
}
