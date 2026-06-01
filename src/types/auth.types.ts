import { z } from 'zod'

export type UserRole = 'super_admin' | 'hr_admin' | 'employee'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  companyId?: string
}

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    companyName: z.string().min(1, 'Company name is required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type RegisterInput = z.infer<typeof RegisterSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

export const TwoFactorSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})
export type TwoFactorInput = z.infer<typeof TwoFactorSchema>

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['super_admin', 'hr_admin', 'employee']),
    avatarUrl: z.string().optional(),
    companyId: z.string().optional(),
  }),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const LoginTwoFactorResponseSchema = z.object({
  requiresTwoFactor: z.literal(true),
  email: z.string().email(),
})
export type LoginTwoFactorResponse = z.infer<typeof LoginTwoFactorResponseSchema>

export type LoginResult = AuthResponse | LoginTwoFactorResponse

export function isTwoFactorRequired(result: LoginResult): result is LoginTwoFactorResponse {
  return 'requiresTwoFactor' in result && result.requiresTwoFactor === true
}
