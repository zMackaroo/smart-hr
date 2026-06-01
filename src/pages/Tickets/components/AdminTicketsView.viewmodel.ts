import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getAssigneeOptions, getTickets } from '../../../api/tickets.api'
import type { TicketCategory, TicketPriority, TicketStatus } from '../../../types/ticket.types'

export function useAdminTicketsViewModel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('')
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority | ''>('')
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | ''>('')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [page, setPage] = useState(1)

  const { data: assignees = [] } = useQuery({
    queryKey: ['ticket-assignees'],
    queryFn: getAssigneeOptions,
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      'tickets',
      searchQuery,
      selectedStatus,
      selectedPriority,
      selectedCategory,
      selectedAssignee,
      page,
    ],
    queryFn: () =>
      getTickets({
        search: searchQuery || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
        category: selectedCategory || undefined,
        assignedToId: selectedAssignee || undefined,
        page,
        perPage: 20,
      }),
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
    statusCounts: data?.statusCounts ?? { open: 0, inProgress: 0, resolved: 0, closed: 0 },
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setPage(1)
    },
    selectedStatus,
    setSelectedStatus: (s: TicketStatus | '') => {
      setSelectedStatus(s)
      setPage(1)
    },
    selectedPriority,
    setSelectedPriority: (p: TicketPriority | '') => {
      setSelectedPriority(p)
      setPage(1)
    },
    selectedCategory,
    setSelectedCategory: (c: TicketCategory | '') => {
      setSelectedCategory(c)
      setPage(1)
    },
    selectedAssignee,
    setSelectedAssignee: (id: string) => {
      setSelectedAssignee(id)
      setPage(1)
    },
    assignees,
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
  }
}
