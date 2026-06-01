import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  advanceCandidateStatus,
  createCandidate,
  getCandidates,
  getJobs,
  updateCandidate,
  updateCandidateStatus,
} from '../../api/recruitment.api'
import { useNotificationStore } from '../../store/notificationStore'
import type {
  Candidate,
  CandidateFormInput,
  CandidateStatus,
} from '../../types/recruitment.types'

export function useCandidatesPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail' | null>(null)

  const { data: jobsData } = useQuery({
    queryKey: ['recruitment-jobs-all'],
    queryFn: () => getJobs({ perPage: 100 }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['recruitment-candidates', searchQuery, selectedJob, selectedStatus, page],
    queryFn: () =>
      getCandidates({
        search: searchQuery || undefined,
        jobId: selectedJob || undefined,
        status: selectedStatus || undefined,
        page,
        perPage: 12,
      }),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['recruitment-candidates'] })
    void queryClient.invalidateQueries({ queryKey: ['recruitment-jobs'] })
  }

  const createMutation = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Candidate added successfully')
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CandidateFormInput> }) =>
      updateCandidate(id, data),
    onSuccess: (updated) => {
      invalidate()
      addNotification('success', 'Candidate updated successfully')
      if (modalMode === 'detail') {
        setSelectedCandidate(updated)
      } else {
        closeModal()
      }
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      updateCandidateStatus(id, status),
    onSuccess: (updated) => {
      invalidate()
      addNotification('success', 'Candidate status updated')
      setSelectedCandidate(updated)
    },
  })

  const advanceMutation = useMutation({
    mutationFn: advanceCandidateStatus,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Candidate advanced to next stage')
    },
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedCandidate(null)
  }

  const openAddModal = () => {
    setSelectedCandidate(null)
    setModalMode('add')
  }

  const openEditModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setModalMode('edit')
  }

  const openDetailModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setModalMode('detail')
  }

  const onSubmit = (data: CandidateFormInput) => {
    if (modalMode === 'edit' && selectedCandidate) {
      updateMutation.mutate({ id: selectedCandidate.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const onAdvanceStatus = (id: string) => {
    advanceMutation.mutate(id)
  }

  const onUpdateStatus = (id: string, status: CandidateStatus) => {
    statusMutation.mutate({ id, status })
  }

  const jobs = (jobsData?.data ?? []).filter((j) => j.status !== 'draft')
  const candidates = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const perPage = data?.perPage ?? 12
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return {
    candidates,
    isLoading,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setPage(1)
    },
    selectedJob,
    setSelectedJob: (id: string) => {
      setSelectedJob(id)
      setPage(1)
    },
    selectedStatus,
    setSelectedStatus: (s: CandidateStatus | '') => {
      setSelectedStatus(s)
      setPage(1)
    },
    jobs,
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
    selectedCandidate,
    isFormModalOpen: modalMode === 'add' || modalMode === 'edit',
    isDetailModalOpen: modalMode === 'detail',
    openAddModal,
    openEditModal,
    openDetailModal,
    closeModal,
    onSubmit,
    onAdvanceStatus,
    onUpdateStatus,
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      statusMutation.isPending ||
      advanceMutation.isPending,
  }
}
