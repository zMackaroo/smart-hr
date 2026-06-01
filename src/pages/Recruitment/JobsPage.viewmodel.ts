import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../api/departments.api'
import {
  createJob,
  deleteJob,
  getJobs,
  jobHasCandidates,
  updateJob,
} from '../../api/recruitment.api'
import { useNotificationStore } from '../../store/notificationStore'
import type { JobFormInput, JobPosting, JobStatus } from '../../types/recruitment.types'

export function useJobsPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['recruitment-jobs', searchQuery, selectedDepartment, statusFilter, page],
    queryFn: () =>
      getJobs({
        search: searchQuery || undefined,
        departmentId: selectedDepartment || undefined,
        status: statusFilter || undefined,
        page,
        perPage: 12,
      }),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['recruitment-jobs'] })
    void queryClient.invalidateQueries({ queryKey: ['recruitment-candidates'] })
    void queryClient.invalidateQueries({ queryKey: ['recruitment-open-jobs'] })
  }

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Job posting created successfully')
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobFormInput }) => updateJob(id, data),
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Job posting updated successfully')
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      invalidate()
      addNotification('success', 'Job posting deleted successfully')
      closeModal()
    },
    onError: (error: Error) => {
      addNotification('error', error.message)
    },
  })

  const closeModal = () => {
    setModalMode(null)
    setSelectedJob(null)
  }

  const openAddModal = () => {
    setSelectedJob(null)
    setModalMode('add')
  }

  const openEditModal = (job: JobPosting) => {
    setSelectedJob(job)
    setModalMode('edit')
  }

  const openDeleteModal = (job: JobPosting) => {
    setSelectedJob(job)
    setModalMode('delete')
  }

  const onSubmit = (data: JobFormInput) => {
    if (modalMode === 'edit' && selectedJob) {
      updateMutation.mutate({ id: selectedJob.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const onConfirmDelete = () => {
    if (selectedJob && !jobHasCandidates(selectedJob.id)) {
      deleteMutation.mutate(selectedJob.id)
    }
  }

  const jobs = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const perPage = data?.perPage ?? 12
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return {
    jobs,
    isLoading,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setPage(1)
    },
    selectedDepartment,
    setSelectedDepartment: (id: string) => {
      setSelectedDepartment(id)
      setPage(1)
    },
    statusFilter,
    setStatusFilter: (s: JobStatus | '') => {
      setStatusFilter(s)
      setPage(1)
    },
    departments,
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange: setPage,
    selectedJob,
    isFormModalOpen: modalMode === 'add' || modalMode === 'edit',
    isDeleteModalOpen: modalMode === 'delete',
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    onSubmit,
    onConfirmDelete,
    isSubmitting:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    jobHasCandidates: selectedJob ? jobHasCandidates(selectedJob.id) : false,
  }
}
