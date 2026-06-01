import {
  AuthResponseSchema,
  type AuthResponse,
  type ForgotPasswordInput,
  type LoginInput,
  type LoginResult,
  type RegisterInput,
  type ResetPasswordInput,
} from '../types/auth.types'
import { createCompanyFromRegistration } from './companies.api'
import { findAuthUserByEmail, createUserFromRegistration, recordUserLogin } from './users.api'
import { DEFAULT_COMPANY_ID } from '../utils/company-context.utils'
import { assertLoginAllowedForTenant } from '../utils/auth-tenant.utils'
import { useUIStore } from '../store/uiStore'

const MOCK_DELAY_MS = 600
const MOCK_TWO_FACTOR_CODE = '123456'
const pendingTwoFactorSessions = new Map<string, AuthResponse['user']>()

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createToken(userId: string) {
  return `mock-jwt-${userId}-${Date.now()}`
}

export async function login(data: LoginInput): Promise<LoginResult> {
  await delay()

  const account = findAuthUserByEmail(data.email)

  if (!account || account.password !== data.password) {
    throw new Error('Invalid email or password')
  }

  if (account.status === 'inactive') {
    throw new Error('This account has been deactivated')
  }

  assertLoginAllowedForTenant(account.user)

  if (account.requiresTwoFactor) {
    pendingTwoFactorSessions.set(account.user.email.toLowerCase(), account.user)
    return { requiresTwoFactor: true, email: account.user.email }
  }

  await recordUserLogin(account.user.id)

  if (account.user.role === 'super_admin') {
    useUIStore.getState().setActiveCompanyId(account.user.companyId ?? DEFAULT_COMPANY_ID)
  }

  return AuthResponseSchema.parse({
    token: createToken(account.user.id),
    user: account.user,
  })
}

export async function register(
  data: RegisterInput,
): Promise<{ message: string; companySlug: string; companyName: string }> {
  await delay()

  const exists = findAuthUserByEmail(data.email)

  if (exists) {
    throw new Error('An account with this email already exists')
  }

  const company = await createCompanyFromRegistration(data.companyName)
  await createUserFromRegistration({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    companyId: company.id,
  })

  return {
    message: `Account created for ${data.firstName} ${data.lastName}. Please verify your email.`,
    companySlug: company.slug,
    companyName: company.name,
  }
}

export async function forgotPassword(
  _data: ForgotPasswordInput,
): Promise<{ message: string }> {
  await delay()
  return { message: 'If that email exists, a reset link has been sent.' }
}

export async function resetPassword(
  token: string,
  _data: ResetPasswordInput,
): Promise<{ message: string }> {
  await delay()

  if (!token) {
    throw new Error('Invalid or expired reset token')
  }

  return { message: 'Your password has been reset successfully.' }
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  await delay()

  if (!token) {
    throw new Error('Invalid or expired verification token')
  }

  return { message: 'Email verified successfully.' }
}

export async function verifyTwoFactor(code: string): Promise<AuthResponse> {
  await delay()

  if (code !== MOCK_TWO_FACTOR_CODE) {
    throw new Error('Invalid verification code')
  }

  const session = pendingTwoFactorSessions.entries().next().value
  if (!session) {
    throw new Error('No pending two-factor session. Please sign in again.')
  }

  const [email, user] = session
  pendingTwoFactorSessions.delete(email)

  assertLoginAllowedForTenant(user)

  await recordUserLogin(user.id)

  if (user.role === 'super_admin') {
    useUIStore.getState().setActiveCompanyId(user.companyId ?? DEFAULT_COMPANY_ID)
  }

  return AuthResponseSchema.parse({
    token: createToken(user.id),
    user,
  })
}

export async function resendVerification(_email: string): Promise<{ message: string }> {
  await delay()
  return { message: 'Verification email sent.' }
}
