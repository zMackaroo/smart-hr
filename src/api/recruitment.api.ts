import {
  CandidateListResponseSchema,
  CandidateSchema,
  JobListResponseSchema,
  JobPostingSchema,
  ReferralListResponseSchema,
  ReferralSchema,
  getNextCandidateStatus,
  type Candidate,
  type CandidateFormInput,
  type CandidateStatus,
  type JobFormInput,
  type JobPosting,
  type JobStatus,
  type Referral,
  type ReferralFormInput,
  type ReferralStatus,
} from '../types/recruitment.types'
import { getAllEmployeesForPayroll } from './employees.api'
import { DEFAULT_CURRENCY } from '../config/currency.config'
import { findDepartment, findDesignation } from './org-data'

const MOCK_DELAY_MS = 350

let jobStore: JobPosting[] = []
let candidateStore: Candidate[] = []
let referralStore: Referral[] = []
let nextJobId = 1
let nextCandidateId = 1
let nextReferralId = 1

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function syncApplicantCounts() {
  jobStore = jobStore.map((job) => ({
    ...job,
    applicantsCount: candidateStore.filter((c) => c.job.id === job.id).length,
  }))
}

function seedJobs(): JobPosting[] {
  const jobs: Array<Omit<JobPosting, 'id' | 'applicantsCount' | 'companyId'>> = [
    {
      title: 'Software Engineer',
      department: { id: 'dept-1', name: 'Engineering' },
      designation: { id: 'des-1', name: 'Software Engineer' },
      location: 'San Francisco',
      employmentType: 'full_time',
      experienceLevel: '1–3 years',
      salaryRange: { min: 80000, max: 120000, currency: DEFAULT_CURRENCY },
      description: 'Build and maintain core product features for our HR platform.',
      requirements: 'BS in CS or equivalent. 1+ years React/TypeScript experience.',
      status: 'open',
      openings: 3,
      postedDate: '2026-05-01',
      closingDate: '2026-07-31',
      createdBy: { id: 'usr-admin-1', name: 'HR Admin' },
      createdAt: '2026-04-20',
    },
    {
      title: 'Senior Developer',
      department: { id: 'dept-1', name: 'Engineering' },
      designation: { id: 'des-2', name: 'Senior Developer' },
      location: 'Remote',
      employmentType: 'full_time',
      experienceLevel: '5+ years',
      salaryRange: { min: 120000, max: 160000, currency: DEFAULT_CURRENCY },
      description: 'Lead technical initiatives and mentor junior engineers.',
      requirements: '5+ years full-stack development. Strong system design skills.',
      status: 'open',
      openings: 2,
      postedDate: '2026-04-15',
      createdBy: { id: 'usr-admin-1', name: 'HR Admin' },
      createdAt: '2026-04-10',
    },
    {
      title: 'HR Manager',
      department: { id: 'dept-2', name: 'HR' },
      designation: { id: 'des-3', name: 'HR Manager' },
      location: 'Boston',
      employmentType: 'full_time',
      experienceLevel: 'Senior',
      salaryRange: { min: 70000, max: 95000, currency: DEFAULT_CURRENCY },
      description: 'Oversee HR operations and employee relations.',
      requirements: 'HR certification preferred. 5+ years HR management experience.',
      status: 'open',
      openings: 1,
      postedDate: '2026-03-01',
      createdBy: { id: 'usr-admin-1', name: 'HR Admin' },
      createdAt: '2026-02-20',
    },
    {
      title: 'Marketing Lead',
      department: { id: 'dept-3', name: 'Marketing' },
      location: 'Chicago',
      employmentType: 'full_time',
      experienceLevel: '3–5 years',
      description: 'Drive marketing campaigns and brand strategy.',
      requirements: 'Proven track record in B2B SaaS marketing.',
      status: 'closed',
      openings: 1,
      postedDate: '2025-11-01',
      createdBy: { id: 'usr-admin-1', name: 'HR Admin' },
      createdAt: '2025-10-15',
    },
    {
      title: 'UI Designer',
      department: { id: 'dept-5', name: 'Design' },
      location: 'Seattle',
      employmentType: 'full_time',
      experienceLevel: '2–4 years',
      salaryRange: { min: 65000, max: 90000, currency: DEFAULT_CURRENCY },
      description: 'Design intuitive user experiences for our HR products.',
      requirements: 'Portfolio required. Figma proficiency essential.',
      status: 'open',
      openings: 1,
      postedDate: '2026-05-10',
      createdBy: { id: 'usr-admin-1', name: 'HR Admin' },
      createdAt: '2026-05-05',
    },
    {
      title: 'Finance Intern',
      department: { id: 'dept-4', name: 'Finance' },
      location: 'Austin',
      employmentType: 'intern',
      experienceLevel: 'Entry level',
      description: 'Support finance team with reporting and analysis.',
      requirements: 'Currently pursuing degree in Finance or Accounting.',
      status: 'draft',
      openings: 2,
      postedDate: null,
      createdBy: { id: 'usr-admin-1', name: 'HR Admin' },
      createdAt: '2026-05-20',
    },
  ]

  return jobs.map((job) =>
    JobPostingSchema.parse({ ...job, companyId: 'co-1', id: `job-${nextJobId++}`, applicantsCount: 0 }),
  )
}

function seedCandidates(jobs: JobPosting[]): Candidate[] {
  const openJobs = jobs.filter((j) => j.status !== 'draft')
  const names = [
    { name: 'Sarah Chen', email: 'sarah.chen@email.com', status: 'interview' as const, exp: 5, rating: 4 },
    { name: 'Michael Torres', email: 'michael.t@email.com', status: 'screening' as const, exp: 3, rating: 3 },
    { name: 'Emily Davis', email: 'emily.d@email.com', status: 'new' as const, exp: 2 },
    { name: 'James Wilson', email: 'james.w@email.com', status: 'offered' as const, exp: 7, rating: 5 },
    { name: 'Lisa Park', email: 'lisa.p@email.com', status: 'hired' as const, exp: 4, rating: 5 },
    { name: 'David Kim', email: 'david.k@email.com', status: 'rejected' as const, exp: 1 },
    { name: 'Anna Martinez', email: 'anna.m@email.com', status: 'interview' as const, exp: 6, rating: 4 },
    { name: 'Robert Brown', email: 'robert.b@email.com', status: 'screening' as const, exp: 8, rating: 4 },
    { name: 'Priya Sharma', email: 'priya.s@email.com', status: 'new' as const, exp: 3 },
    { name: 'Chris Evans', email: 'chris.e@email.com', status: 'interview' as const, exp: 4, rating: 3 },
    { name: 'Nina Patel', email: 'nina.p@email.com', status: 'new' as const, exp: 2 },
    { name: 'Tom Hardy', email: 'tom.h@email.com', status: 'screening' as const, exp: 5, rating: 4 },
    { name: 'Olivia White', email: 'olivia.w@email.com', status: 'offered' as const, exp: 6, rating: 5 },
    { name: 'Ethan Clark', email: 'ethan.c@email.com', status: 'new' as const, exp: 1 },
    { name: 'Sophia Lee', email: 'sophia.l@email.com', status: 'rejected' as const, exp: 3 },
  ]

  return names.map((item, index) => {
    const job = openJobs[index % openJobs.length]
    return CandidateSchema.parse({
      id: `cand-${nextCandidateId++}`,
      companyId: job.companyId,
      fullName: item.name,
      email: item.email,
      phone: '+1 555-0100',
      job: { id: job.id, title: job.title },
      status: item.status,
      experienceYears: item.exp,
      currentCompany: 'Previous Corp',
      resumeUrl: '#',
      appliedDate: `2026-0${(index % 5) + 1}-15`,
      notes: 'Strong candidate profile.',
      rating: item.rating,
      source: index % 7 === 0 ? 'referral' : index % 5 === 0 ? 'job_board' : 'direct',
      referredBy: index % 7 === 0 ? { id: 'usr-employee-1', name: 'Jane Employee' } : undefined,
    })
  })
}

function seedReferrals(jobs: JobPosting[]): Referral[] {
  const openJobs = jobs.filter((j) => j.status === 'open')
  const employees = getAllEmployeesForPayroll()
  const seeds = [
    { name: 'Alex Johnson', email: 'alex.j@email.com', status: 'pending' as const },
    { name: 'Maria Garcia', email: 'maria.g@email.com', status: 'pending' as const },
    { name: 'Kevin Wu', email: 'kevin.w@email.com', status: 'reviewed' as const },
    { name: 'Laura Smith', email: 'laura.s@email.com', status: 'accepted' as const },
    { name: 'Ben Foster', email: 'ben.f@email.com', status: 'rejected' as const },
    { name: 'Rachel Green', email: 'rachel.g@email.com', status: 'pending' as const },
  ]

  return seeds.map((seed, index) => {
    const referrer = employees[index % employees.length]
    const job = openJobs[index % openJobs.length]
    return ReferralSchema.parse({
      id: `ref-${nextReferralId++}`,
      companyId: referrer.companyId,
      referrer: {
        id: referrer.id,
        name: referrer.fullName,
        avatarUrl: referrer.avatarUrl,
        department: referrer.departmentName,
      },
      candidateName: seed.name,
      candidateEmail: seed.email,
      candidatePhone: '+1 555-0200',
      job: { id: job.id, title: job.title },
      relationship: index % 2 === 0 ? 'Former colleague' : 'Friend',
      notes: 'Highly recommended candidate.',
      status: seed.status,
      submittedDate: `2026-0${(index % 5) + 1}-10`,
      reviewedBy: seed.status !== 'pending' ? { id: 'usr-admin-1', name: 'HR Admin' } : undefined,
      reviewedDate: seed.status !== 'pending' ? '2026-05-15' : undefined,
    })
  })
}

function initStore() {
  jobStore = seedJobs()
  candidateStore = seedCandidates(jobStore)
  referralStore = seedReferrals(jobStore)
  syncApplicantCounts()
}

initStore()

function buildJobFromForm(data: JobFormInput, id: string, existing?: JobPosting): JobPosting {
  const department = findDepartment(data.departmentId)
  if (!department) throw new Error('Department not found')
  const designation = data.designationId ? findDesignation(data.designationId) : undefined

  return JobPostingSchema.parse({
    id,
    companyId: department.companyId,
    title: data.title,
    department: { id: department.id, name: department.name },
    designation: designation ? { id: designation.id, name: designation.name } : undefined,
    location: data.location,
    employmentType: data.employmentType,
    experienceLevel: data.experienceLevel,
    salaryRange:
      data.salaryMin !== undefined && data.salaryMax !== undefined
        ? { min: data.salaryMin, max: data.salaryMax, currency: DEFAULT_CURRENCY }
        : undefined,
    description: data.description,
    requirements: data.requirements,
    status: data.status,
    openings: data.openings,
    applicantsCount: existing?.applicantsCount ?? 0,
    postedDate: data.status === 'open' ? new Date().toISOString().split('T')[0] : null,
    closingDate: data.closingDate,
    createdBy: existing?.createdBy ?? { id: 'usr-admin-1', name: 'HR Admin' },
    createdAt: existing?.createdAt ?? new Date().toISOString().split('T')[0],
  })
}

export async function getJobs(params?: {
  search?: string
  departmentId?: string
  status?: JobStatus
  page?: number
  perPage?: number
}) {
  await delay()
  let filtered = [...jobStore]

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.department.name.toLowerCase().includes(q),
    )
  }
  if (params?.departmentId) {
    filtered = filtered.filter((j) => j.department.id === params.departmentId)
  }
  if (params?.status) {
    filtered = filtered.filter((j) => j.status === params.status)
  }

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 12
  const total = filtered.length

  return JobListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  })
}

export async function getJob(id: string): Promise<JobPosting> {
  await delay()
  const job = jobStore.find((j) => j.id === id)
  if (!job) throw new Error('Job not found')
  return job
}

export async function getOpenJobs(): Promise<JobPosting[]> {
  await delay(150)
  return jobStore.filter((j) => j.status === 'open')
}

export async function createJob(data: JobFormInput): Promise<JobPosting> {
  await delay()
  const job = buildJobFromForm(data, `job-${nextJobId++}`)
  jobStore.push(job)
  return job
}

export async function updateJob(id: string, data: JobFormInput): Promise<JobPosting> {
  await delay()
  const index = jobStore.findIndex((j) => j.id === id)
  if (index === -1) throw new Error('Job not found')
  jobStore[index] = buildJobFromForm(data, id, jobStore[index])
  syncApplicantCounts()
  return jobStore[index]
}

export async function deleteJob(id: string): Promise<void> {
  await delay()
  const job = jobStore.find((j) => j.id === id)
  if (!job) throw new Error('Job not found')
  if (candidateStore.some((c) => c.job.id === id)) {
    throw new Error('Cannot delete job with linked candidates')
  }
  jobStore = jobStore.filter((j) => j.id !== id)
}

export function jobHasCandidates(id: string): boolean {
  return candidateStore.some((c) => c.job.id === id)
}

export async function getCandidates(params?: {
  search?: string
  jobId?: string
  status?: CandidateStatus
  page?: number
  perPage?: number
}) {
  await delay()
  let filtered = [...candidateStore]

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    )
  }
  if (params?.jobId) filtered = filtered.filter((c) => c.job.id === params.jobId)
  if (params?.status) filtered = filtered.filter((c) => c.status === params.status)

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 12
  const total = filtered.length

  return CandidateListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  })
}

export async function getCandidate(id: string): Promise<Candidate> {
  await delay()
  const candidate = candidateStore.find((c) => c.id === id)
  if (!candidate) throw new Error('Candidate not found')
  return candidate
}

export async function createCandidate(data: CandidateFormInput): Promise<Candidate> {
  await delay()
  const job = jobStore.find((j) => j.id === data.jobId)
  if (!job) throw new Error('Job not found')

  const candidate = CandidateSchema.parse({
    id: `cand-${nextCandidateId++}`,
    companyId: job.companyId,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    job: { id: job.id, title: job.title },
    status: data.status ?? 'new',
    experienceYears: data.experienceYears,
    currentCompany: data.currentCompany,
    resumeUrl: '#',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: data.notes,
    source: 'direct',
  })

  candidateStore.unshift(candidate)
  syncApplicantCounts()
  return candidate
}

export async function updateCandidate(
  id: string,
  data: Partial<CandidateFormInput>,
): Promise<Candidate> {
  await delay()
  const index = candidateStore.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Candidate not found')

  const job = data.jobId ? jobStore.find((j) => j.id === data.jobId) : undefined
  candidateStore[index] = CandidateSchema.parse({
    ...candidateStore[index],
    fullName: data.fullName ?? candidateStore[index].fullName,
    email: data.email ?? candidateStore[index].email,
    phone: data.phone ?? candidateStore[index].phone,
    job: job
      ? { id: job.id, title: job.title }
      : candidateStore[index].job,
    status: data.status ?? candidateStore[index].status,
    experienceYears: data.experienceYears ?? candidateStore[index].experienceYears,
    currentCompany: data.currentCompany ?? candidateStore[index].currentCompany,
    notes: data.notes ?? candidateStore[index].notes,
  })

  syncApplicantCounts()
  return candidateStore[index]
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus,
): Promise<Candidate> {
  await delay()
  const index = candidateStore.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Candidate not found')
  candidateStore[index] = CandidateSchema.parse({ ...candidateStore[index], status })
  return candidateStore[index]
}

export async function advanceCandidateStatus(id: string): Promise<Candidate> {
  const candidate = candidateStore.find((c) => c.id === id)
  if (!candidate) throw new Error('Candidate not found')
  const next = getNextCandidateStatus(candidate.status)
  if (!next) throw new Error('Cannot advance status further')
  return updateCandidateStatus(id, next)
}

export async function deleteCandidate(id: string): Promise<void> {
  await delay()
  candidateStore = candidateStore.filter((c) => c.id !== id)
  syncApplicantCounts()
}

export async function getReferrals(params?: {
  search?: string
  jobId?: string
  status?: ReferralStatus
  page?: number
  perPage?: number
}) {
  await delay()
  let filtered = [...referralStore]

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.candidateName.toLowerCase().includes(q) ||
        r.candidateEmail.toLowerCase().includes(q) ||
        r.referrer.name.toLowerCase().includes(q),
    )
  }
  if (params?.jobId) filtered = filtered.filter((r) => r.job.id === params.jobId)
  if (params?.status) filtered = filtered.filter((r) => r.status === params.status)

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 20
  const total = filtered.length

  return ReferralListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  })
}

export async function getMyReferrals(
  employeeId: string,
  params?: { status?: ReferralStatus },
): Promise<Referral[]> {
  await delay()
  let filtered = referralStore.filter((r) => r.referrer.id === employeeId)
  if (params?.status) filtered = filtered.filter((r) => r.status === params.status)
  return filtered.sort((a, b) => b.submittedDate.localeCompare(a.submittedDate))
}

export async function submitReferral(
  employeeId: string,
  data: ReferralFormInput,
): Promise<Referral> {
  await delay()
  const employee = getAllEmployeesForPayroll().find((e) => e.id === employeeId)
  if (!employee) throw new Error('Employee not found')
  const job = jobStore.find((j) => j.id === data.jobId)
  if (!job || job.status !== 'open') throw new Error('Invalid job')

  const referral = ReferralSchema.parse({
    id: `ref-${nextReferralId++}`,
    companyId: employee.companyId,
    referrer: {
      id: employee.id,
      name: employee.fullName,
      avatarUrl: employee.avatarUrl,
      department: employee.departmentName,
    },
    candidateName: data.candidateName,
    candidateEmail: data.candidateEmail,
    candidatePhone: data.candidatePhone,
    job: { id: job.id, title: job.title },
    relationship: data.relationship,
    notes: data.notes,
    status: 'pending',
    submittedDate: new Date().toISOString().split('T')[0],
  })

  referralStore.unshift(referral)
  return referral
}

export async function acceptReferral(
  id: string,
  reviewer: { id: string; name: string },
): Promise<Referral> {
  await delay()
  const index = referralStore.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Referral not found')
  const referral = referralStore[index]

  await createCandidate({
    fullName: referral.candidateName,
    email: referral.candidateEmail,
    phone: referral.candidatePhone,
    jobId: referral.job.id,
    experienceYears: 0,
    notes: referral.notes,
    status: 'new',
  })

  const updated = candidateStore.find((c) => c.email === referral.candidateEmail)
  if (updated) {
    candidateStore = candidateStore.map((c) =>
      c.id === updated.id
        ? CandidateSchema.parse({
            ...c,
            source: 'referral',
            referredBy: { id: referral.referrer.id, name: referral.referrer.name },
          })
        : c,
    )
  }

  referralStore[index] = ReferralSchema.parse({
    ...referral,
    status: 'accepted',
    reviewedBy: reviewer,
    reviewedDate: new Date().toISOString().split('T')[0],
  })

  return referralStore[index]
}

export async function rejectReferral(
  id: string,
  reviewer: { id: string; name: string },
): Promise<Referral> {
  await delay()
  const index = referralStore.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Referral not found')

  referralStore[index] = ReferralSchema.parse({
    ...referralStore[index],
    status: 'rejected',
    reviewedBy: reviewer,
    reviewedDate: new Date().toISOString().split('T')[0],
  })

  return referralStore[index]
}

export async function updateReferralStatus(
  id: string,
  status: ReferralStatus,
): Promise<Referral> {
  await delay()
  const index = referralStore.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Referral not found')
  referralStore[index] = ReferralSchema.parse({ ...referralStore[index], status })
  return referralStore[index]
}

export function getAllJobsSnapshot(): JobPosting[] {
  return [...jobStore]
}
