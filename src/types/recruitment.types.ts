import { z } from 'zod'

export type JobStatus = 'draft' | 'open' | 'closed'
export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected'
export type ReferralStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern'
export type CandidateSource = 'direct' | 'referral' | 'job_board'

export const JobPostingSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.object({ id: z.string(), name: z.string() }),
  designation: z.object({ id: z.string(), name: z.string() }).optional(),
  location: z.string(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  experienceLevel: z.string(),
  salaryRange: z
    .object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('USD'),
    })
    .optional(),
  description: z.string(),
  requirements: z.string(),
  status: z.enum(['draft', 'open', 'closed']),
  openings: z.number(),
  applicantsCount: z.number(),
  postedDate: z.string().nullable(),
  closingDate: z.string().optional(),
  createdBy: z.object({ id: z.string(), name: z.string() }),
  createdAt: z.string(),
})
export type JobPosting = z.infer<typeof JobPostingSchema>

export const JobFormSchema = z
  .object({
    title: z.string().min(1, 'Job title is required'),
    departmentId: z.string().min(1, 'Department is required'),
    designationId: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
    experienceLevel: z.string().min(1, 'Experience level is required'),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
    status: z.enum(['draft', 'open', 'closed']),
    openings: z.number().min(1, 'At least 1 opening required'),
    closingDate: z.string().optional(),
  })
  .refine((d) => !d.salaryMin || !d.salaryMax || d.salaryMax >= d.salaryMin, {
    message: 'Max salary must be greater than min salary',
    path: ['salaryMax'],
  })
export type JobFormInput = z.infer<typeof JobFormSchema>

export const CandidateSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  job: z.object({ id: z.string(), title: z.string() }),
  status: z.enum(['new', 'screening', 'interview', 'offered', 'hired', 'rejected']),
  experienceYears: z.number(),
  currentCompany: z.string().optional(),
  resumeUrl: z.string().optional(),
  appliedDate: z.string(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  source: z.enum(['direct', 'referral', 'job_board']).default('direct'),
  referredBy: z.object({ id: z.string(), name: z.string() }).optional(),
})
export type Candidate = z.infer<typeof CandidateSchema>

export const CandidateFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  jobId: z.string().min(1, 'Job is required'),
  experienceYears: z.number().min(0),
  currentCompany: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['new', 'screening', 'interview', 'offered', 'hired', 'rejected']),
})
export type CandidateFormInput = z.infer<typeof CandidateFormSchema>

export const ReferralSchema = z.object({
  id: z.string(),
  referrer: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  candidateName: z.string(),
  candidateEmail: z.string().email(),
  candidatePhone: z.string().optional(),
  job: z.object({ id: z.string(), title: z.string() }),
  relationship: z.string(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  submittedDate: z.string(),
  reviewedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  reviewedDate: z.string().optional(),
})
export type Referral = z.infer<typeof ReferralSchema>

export const ReferralFormSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  candidateEmail: z.string().email('Invalid email'),
  candidatePhone: z.string().optional(),
  jobId: z.string().min(1, 'Job is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  notes: z.string().optional(),
})
export type ReferralFormInput = z.infer<typeof ReferralFormSchema>

export const JobListResponseSchema = z.object({
  data: z.array(JobPostingSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})

export const CandidateListResponseSchema = z.object({
  data: z.array(CandidateSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})

export const ReferralListResponseSchema = z.object({
  data: z.array(ReferralSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  intern: 'Intern',
}

export const CANDIDATE_PIPELINE: CandidateStatus[] = [
  'new',
  'screening',
  'interview',
  'offered',
  'hired',
]

export function getNextCandidateStatus(status: CandidateStatus): CandidateStatus | null {
  const index = CANDIDATE_PIPELINE.indexOf(status)
  if (index === -1 || index >= CANDIDATE_PIPELINE.length - 1) return null
  return CANDIDATE_PIPELINE[index + 1]
}
