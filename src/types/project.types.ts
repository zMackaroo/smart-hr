import { z } from 'zod'

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

export const PersonRefSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const ProjectSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  owner: PersonRefSchema,
  members: z.array(PersonRefSchema),
  startDate: z.string(),
  endDate: z.string().optional(),
  taskCount: z.number(),
  loggedHours: z.number(),
  createdAt: z.string(),
})

export const TaskSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  title: z.string(),
  description: z.string().optional(),
  assignee: PersonRefSchema.optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']),
  dueDate: z.string().optional(),
  loggedHours: z.number(),
  createdAt: z.string(),
})

export const TimeLogSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  taskId: z.string(),
  taskTitle: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  date: z.string(),
  hours: z.number(),
  notes: z.string().optional(),
  createdAt: z.string(),
})

export const ProjectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  ownerId: z.string().min(1, 'Owner is required'),
  memberIds: z.array(z.string()).min(1, 'At least one member is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
})

export const TaskFormSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']),
  dueDate: z.string().optional(),
})

export const TimeLogFormSchema = z.object({
  taskId: z.string().min(1, 'Task is required'),
  date: z.string().min(1, 'Date is required'),
  hours: z.number().min(0.25, 'Minimum 0.25 hours').max(24, 'Maximum 24 hours'),
  notes: z.string().optional(),
})

export const ProjectListResponseSchema = z.object({
  data: z.array(ProjectSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})

export const TaskListResponseSchema = z.object({
  data: z.array(TaskSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})

export type PersonRef = z.infer<typeof PersonRefSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Task = z.infer<typeof TaskSchema>
export type TimeLog = z.infer<typeof TimeLogSchema>
export type ProjectFormInput = z.infer<typeof ProjectFormSchema>
export type TaskFormInput = z.infer<typeof TaskFormSchema>
export type TimeLogFormInput = z.infer<typeof TimeLogFormSchema>
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
}
