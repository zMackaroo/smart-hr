import {
  ProjectFormSchema,
  ProjectListResponseSchema,
  ProjectSchema,
  TaskFormSchema,
  TaskListResponseSchema,
  TaskSchema,
  TimeLogFormSchema,
  TimeLogSchema,
  type Project,
  type ProjectFormInput,
  type ProjectListResponse,
  type ProjectStatus,
  type Task,
  type TaskFormInput,
  type TaskListResponse,
  type TaskStatus,
  type TimeLog,
  type TimeLogFormInput,
} from '../types/project.types'
import { getAllEmployeesForPayroll } from './employees.api'
import {
  assertCompanyAccess,
  filterByCompany,
  getActiveCompanyIdSync,
} from '../utils/company-context.utils'

const MOCK_DELAY_MS = 350

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolvePerson(employeeId: string, companyId: string) {
  const employee = getAllEmployeesForPayroll(companyId).find((item) => item.id === employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }
  return { id: employee.id, name: employee.fullName }
}

function syncProjectStats(projectId: string) {
  const projectIndex = projectStore.findIndex((item) => item.id === projectId)
  if (projectIndex === -1) return

  const projectTasks = taskStore.filter((task) => task.projectId === projectId)
  const taskIds = new Set(projectTasks.map((task) => task.id))
  const hours = timeLogStore
    .filter((log) => taskIds.has(log.taskId))
    .reduce((sum, log) => sum + log.hours, 0)

  projectStore[projectIndex] = ProjectSchema.parse({
    ...projectStore[projectIndex],
    taskCount: projectTasks.length,
    loggedHours: hours,
  })
}

function syncTaskHours(taskId: string) {
  const taskIndex = taskStore.findIndex((item) => item.id === taskId)
  if (taskIndex === -1) return

  const hours = timeLogStore
    .filter((log) => log.taskId === taskId)
    .reduce((sum, log) => sum + log.hours, 0)

  taskStore[taskIndex] = TaskSchema.parse({
    ...taskStore[taskIndex],
    loggedHours: hours,
  })

  syncProjectStats(taskStore[taskIndex].projectId)
}

function seedProjectsAndTasks(): { projects: Project[]; tasks: Task[]; timeLogs: TimeLog[] } {
  const co1People = getAllEmployeesForPayroll('co-1')
  const admin = co1People.find((e) => e.id === 'usr-admin-1') ?? co1People[0]
  const jane = co1People.find((e) => e.id === 'usr-employee-1') ?? co1People[0]
  const sarah = co1People.find((e) => e.fullName === 'Sarah Chen') ?? jane
  const michael = co1People.find((e) => e.fullName === 'Michael Torres') ?? jane

  const projects: Project[] = ProjectSchema.array().parse([
    {
      id: 'prj-1',
      companyId: 'co-1',
      name: 'HR Portal Redesign',
      description: 'Modernize the employee self-service portal with improved UX and mobile support.',
      status: 'active',
      owner: { id: admin.id, name: admin.fullName },
      members: [
        { id: admin.id, name: admin.fullName },
        { id: jane.id, name: jane.fullName },
        { id: sarah.id, name: sarah.fullName },
      ],
      startDate: '2026-03-01',
      endDate: '2026-08-31',
      taskCount: 0,
      loggedHours: 0,
      createdAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'prj-2',
      companyId: 'co-1',
      name: 'Q2 Payroll Automation',
      description: 'Automate recurring payroll workflows and approval chains for Q2.',
      status: 'planning',
      owner: { id: admin.id, name: admin.fullName },
      members: [
        { id: admin.id, name: admin.fullName },
        { id: michael.id, name: michael.fullName },
      ],
      startDate: '2026-06-01',
      endDate: '2026-09-30',
      taskCount: 0,
      loggedHours: 0,
      createdAt: '2026-05-15T00:00:00.000Z',
    },
    {
      id: 'prj-co2-1',
      companyId: 'co-2',
      name: 'Acme CRM Integration',
      description: 'Connect HRIS with Acme CRM for sales team onboarding.',
      status: 'active',
      owner: { id: 'usr-co2-admin', name: 'Alex Admin' },
      members: [
        { id: 'usr-co2-admin', name: 'Alex Admin' },
        { id: 'usr-co2-employee-1', name: 'Bob Builder' },
      ],
      startDate: '2026-04-01',
      endDate: '2026-10-31',
      taskCount: 0,
      loggedHours: 0,
      createdAt: '2026-04-01T00:00:00.000Z',
    },
  ])

  const tasks: Task[] = TaskSchema.array().parse([
    {
      id: 'task-1',
      companyId: 'co-1',
      projectId: 'prj-1',
      projectName: 'HR Portal Redesign',
      title: 'Design employee dashboard wireframes',
      description: 'Create low-fidelity wireframes for the new dashboard layout.',
      assignee: { id: jane.id, name: jane.fullName },
      status: 'in_progress',
      dueDate: '2026-06-15',
      loggedHours: 0,
      createdAt: '2026-03-05T00:00:00.000Z',
    },
    {
      id: 'task-2',
      companyId: 'co-1',
      projectId: 'prj-1',
      projectName: 'HR Portal Redesign',
      title: 'Implement leave balance widget',
      description: 'Build the dashboard widget showing leave balances.',
      assignee: { id: sarah.id, name: sarah.fullName },
      status: 'todo',
      dueDate: '2026-06-30',
      loggedHours: 0,
      createdAt: '2026-03-06T00:00:00.000Z',
    },
    {
      id: 'task-3',
      companyId: 'co-1',
      projectId: 'prj-2',
      projectName: 'Q2 Payroll Automation',
      title: 'Document approval workflow',
      assignee: { id: michael.id, name: michael.fullName },
      status: 'todo',
      dueDate: '2026-07-01',
      loggedHours: 0,
      createdAt: '2026-05-20T00:00:00.000Z',
    },
    {
      id: 'task-co2-1',
      companyId: 'co-2',
      projectId: 'prj-co2-1',
      projectName: 'Acme CRM Integration',
      title: 'Map employee fields to CRM contacts',
      assignee: { id: 'usr-co2-employee-1', name: 'Bob Builder' },
      status: 'in_progress',
      dueDate: '2026-06-20',
      loggedHours: 0,
      createdAt: '2026-04-10T00:00:00.000Z',
    },
  ])

  const timeLogs: TimeLog[] = TimeLogSchema.array().parse([
    {
      id: 'log-1',
      companyId: 'co-1',
      taskId: 'task-1',
      taskTitle: 'Design employee dashboard wireframes',
      projectId: 'prj-1',
      projectName: 'HR Portal Redesign',
      employeeId: jane.id,
      employeeName: jane.fullName,
      date: '2026-05-28',
      hours: 4,
      notes: 'Initial wireframe sketches',
      createdAt: '2026-05-28T17:00:00.000Z',
    },
    {
      id: 'log-2',
      companyId: 'co-1',
      taskId: 'task-1',
      taskTitle: 'Design employee dashboard wireframes',
      projectId: 'prj-1',
      projectName: 'HR Portal Redesign',
      employeeId: jane.id,
      employeeName: jane.fullName,
      date: '2026-05-29',
      hours: 3.5,
      createdAt: '2026-05-29T16:30:00.000Z',
    },
    {
      id: 'log-co2-1',
      companyId: 'co-2',
      taskId: 'task-co2-1',
      taskTitle: 'Map employee fields to CRM contacts',
      projectId: 'prj-co2-1',
      projectName: 'Acme CRM Integration',
      employeeId: 'usr-co2-employee-1',
      employeeName: 'Bob Builder',
      date: '2026-05-30',
      hours: 5,
      createdAt: '2026-05-30T15:00:00.000Z',
    },
  ])

  return { projects, tasks, timeLogs }
}

const seeded = seedProjectsAndTasks()
let projectStore: Project[] = seeded.projects
let taskStore: Task[] = seeded.tasks
let timeLogStore: TimeLog[] = seeded.timeLogs

for (const task of taskStore) {
  syncTaskHours(task.id)
}

export const PROJECTS_QUERY_KEY = ['projects'] as const
export const TASKS_QUERY_KEY = ['tasks'] as const

export async function getProjects(params?: {
  search?: string
  status?: ProjectStatus
  memberId?: string
  page?: number
  perPage?: number
}): Promise<ProjectListResponse> {
  await delay()

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 12
  const search = params?.search?.trim().toLowerCase()

  let filtered = filterByCompany(projectStore)

  if (params?.memberId) {
    filtered = filtered.filter((project) =>
      project.members.some((member) => member.id === params.memberId),
    )
  }

  if (params?.status) {
    filtered = filtered.filter((project) => project.status === params.status)
  }

  if (search) {
    filtered = filtered.filter(
      (project) =>
        project.name.toLowerCase().includes(search) ||
        project.description.toLowerCase().includes(search),
    )
  }

  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage

  return ProjectListResponseSchema.parse({
    data: filtered.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
  })
}

export async function getProject(id: string): Promise<Project> {
  await delay()
  const project = projectStore.find((item) => item.id === id)
  if (!project) {
    throw new Error('Project not found')
  }
  assertCompanyAccess(project.companyId)
  return ProjectSchema.parse(project)
}

export async function createProject(data: ProjectFormInput): Promise<Project> {
  await delay()

  const parsed = ProjectFormSchema.parse(data)
  const companyId = getActiveCompanyIdSync()
  const owner = resolvePerson(parsed.ownerId, companyId)
  const members = parsed.memberIds.map((memberId) => resolvePerson(memberId, companyId))

  const created = ProjectSchema.parse({
    id: `prj-${Date.now()}`,
    companyId,
    name: parsed.name.trim(),
    description: parsed.description?.trim() ?? '',
    status: parsed.status,
    owner,
    members,
    startDate: parsed.startDate,
    endDate: parsed.endDate || undefined,
    taskCount: 0,
    loggedHours: 0,
    createdAt: new Date().toISOString(),
  })

  projectStore.push(created)
  return created
}

export async function updateProject(id: string, data: ProjectFormInput): Promise<Project> {
  await delay()

  const index = projectStore.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error('Project not found')
  }

  assertCompanyAccess(projectStore[index].companyId)
  const parsed = ProjectFormSchema.parse(data)
  const companyId = projectStore[index].companyId
  const owner = resolvePerson(parsed.ownerId, companyId)
  const members = parsed.memberIds.map((memberId) => resolvePerson(memberId, companyId))

  const updated = ProjectSchema.parse({
    ...projectStore[index],
    name: parsed.name.trim(),
    description: parsed.description?.trim() ?? '',
    status: parsed.status,
    owner,
    members,
    startDate: parsed.startDate,
    endDate: parsed.endDate || undefined,
  })

  projectStore[index] = updated

  for (const task of taskStore.filter((item) => item.projectId === id)) {
    const taskIndex = taskStore.findIndex((item) => item.id === task.id)
    taskStore[taskIndex] = TaskSchema.parse({
      ...taskStore[taskIndex],
      projectName: updated.name,
    })
  }

  return updated
}

export async function deleteProject(id: string): Promise<void> {
  await delay()

  const index = projectStore.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error('Project not found')
  }

  assertCompanyAccess(projectStore[index].companyId)

  const hasTasks = taskStore.some((task) => task.projectId === id)
  if (hasTasks) {
    throw new Error('Cannot delete project with existing tasks')
  }

  projectStore.splice(index, 1)
}

export async function getTasks(params?: {
  search?: string
  projectId?: string
  assigneeId?: string
  status?: TaskStatus
  page?: number
  perPage?: number
}): Promise<TaskListResponse> {
  await delay()

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 20
  const search = params?.search?.trim().toLowerCase()

  let filtered = filterByCompany(taskStore)

  if (params?.projectId) {
    filtered = filtered.filter((task) => task.projectId === params.projectId)
  }

  if (params?.assigneeId) {
    filtered = filtered.filter((task) => task.assignee?.id === params.assigneeId)
  }

  if (params?.status) {
    filtered = filtered.filter((task) => task.status === params.status)
  }

  if (search) {
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.projectName.toLowerCase().includes(search),
    )
  }

  filtered.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage

  return TaskListResponseSchema.parse({
    data: filtered.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
  })
}

export async function getTask(id: string): Promise<Task> {
  await delay()
  const task = taskStore.find((item) => item.id === id)
  if (!task) {
    throw new Error('Task not found')
  }
  assertCompanyAccess(task.companyId)
  return TaskSchema.parse(task)
}

export async function createTask(data: TaskFormInput): Promise<Task> {
  await delay()

  const parsed = TaskFormSchema.parse(data)
  const project = projectStore.find((item) => item.id === parsed.projectId)
  if (!project) {
    throw new Error('Project not found')
  }

  assertCompanyAccess(project.companyId)

  const assignee = parsed.assigneeId
    ? resolvePerson(parsed.assigneeId, project.companyId)
    : undefined

  const created = TaskSchema.parse({
    id: `task-${Date.now()}`,
    companyId: project.companyId,
    projectId: project.id,
    projectName: project.name,
    title: parsed.title.trim(),
    description: parsed.description?.trim(),
    assignee,
    status: parsed.status,
    dueDate: parsed.dueDate || undefined,
    loggedHours: 0,
    createdAt: new Date().toISOString(),
  })

  taskStore.push(created)
  syncProjectStats(project.id)
  return created
}

export async function updateTask(id: string, data: Partial<TaskFormInput>): Promise<Task> {
  await delay()

  const index = taskStore.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error('Task not found')
  }

  assertCompanyAccess(taskStore[index].companyId)
  const current = taskStore[index]
  const companyId = current.companyId

  const assignee =
    data.assigneeId === ''
      ? undefined
      : data.assigneeId
        ? resolvePerson(data.assigneeId, companyId)
        : current.assignee

  const updated = TaskSchema.parse({
    ...current,
    title: data.title?.trim() ?? current.title,
    description: data.description?.trim() ?? current.description,
    assignee,
    status: data.status ?? current.status,
    dueDate: data.dueDate === '' ? undefined : (data.dueDate ?? current.dueDate),
  })

  taskStore[index] = updated
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  await delay()

  const index = taskStore.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error('Task not found')
  }

  assertCompanyAccess(taskStore[index].companyId)

  const projectId = taskStore[index].projectId
  taskStore.splice(index, 1)
  timeLogStore = timeLogStore.filter((log) => log.taskId !== id)
  syncProjectStats(projectId)
}

export async function logTime(data: TimeLogFormInput, employeeId: string): Promise<TimeLog> {
  await delay()

  const parsed = TimeLogFormSchema.parse(data)
  const task = taskStore.find((item) => item.id === parsed.taskId)
  if (!task) {
    throw new Error('Task not found')
  }

  assertCompanyAccess(task.companyId)

  if (task.assignee && task.assignee.id !== employeeId) {
    throw new Error('You can only log time on tasks assigned to you')
  }

  const employee = resolvePerson(employeeId, task.companyId)

  const created = TimeLogSchema.parse({
    id: `log-${Date.now()}`,
    companyId: task.companyId,
    taskId: task.id,
    taskTitle: task.title,
    projectId: task.projectId,
    projectName: task.projectName,
    employeeId: employee.id,
    employeeName: employee.name,
    date: parsed.date,
    hours: parsed.hours,
    notes: parsed.notes?.trim(),
    createdAt: new Date().toISOString(),
  })

  timeLogStore.push(created)
  syncTaskHours(task.id)
  return created
}

export function getProjectOptions(companyId = getActiveCompanyIdSync()) {
  return filterByCompany(projectStore, companyId).map((project) => ({
    id: project.id,
    name: project.name,
  }))
}

export function getAssignableTasksForEmployee(employeeId: string, companyId = getActiveCompanyIdSync()) {
  return filterByCompany(taskStore, companyId).filter(
    (task) => task.assignee?.id === employeeId && task.status !== 'done',
  )
}

export function getTimeLogsForReport(params: {
  companyId?: string
  dateFrom?: string
  dateTo?: string
  employeeId?: string
  projectId?: string
  taskStatus?: TaskStatus
}): TimeLog[] {
  const companyId = params.companyId ?? getActiveCompanyIdSync()

  let filtered = filterByCompany(timeLogStore, companyId)

  if (params.dateFrom) {
    filtered = filtered.filter((log) => log.date >= params.dateFrom!)
  }
  if (params.dateTo) {
    filtered = filtered.filter((log) => log.date <= params.dateTo!)
  }
  if (params.employeeId) {
    filtered = filtered.filter((log) => log.employeeId === params.employeeId)
  }
  if (params.projectId) {
    filtered = filtered.filter((log) => log.projectId === params.projectId)
  }
  if (params.taskStatus) {
    const taskIds = new Set(
      filterByCompany(taskStore, companyId)
        .filter((task) => task.status === params.taskStatus)
        .map((task) => task.id),
    )
    filtered = filtered.filter((log) => taskIds.has(log.taskId))
  }

  return filtered
}

export function getTasksForReport(companyId = getActiveCompanyIdSync()): Task[] {
  return filterByCompany(taskStore, companyId)
}
