import { z } from 'zod'

export type { AuthUser, UserRole } from './auth.types'

export type EntityStatus = 'active' | 'inactive' | 'pending'

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
  })

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
