import {
  AuthResponseSchema,
  type AuthResponse,
  type ForgotPasswordInput,
  type LoginInput,
  type LoginResult,
  type RegisterInput,
  type ResetPasswordInput,
} from '../types/auth.types'

const MOCK_DELAY_MS = 600

const MOCK_USERS: Array<{
  email: string
  password: string
  user: AuthResponse['user']
  requiresTwoFactor?: boolean
}> = [
  {
    email: 'admin@smarthr.com',
    password: 'password123',
    user: {
      id: 'usr-admin-1',
      name: 'HR Admin',
      email: 'admin@smarthr.com',
      role: 'hr_admin',
      companyId: 'co-1',
    },
  },
  {
    email: 'super@smarthr.com',
    password: 'password123',
    user: {
      id: 'usr-super-1',
      name: 'Super Admin',
      email: 'super@smarthr.com',
      role: 'super_admin',
      companyId: 'co-1',
    },
  },
  {
    email: 'employee@smarthr.com',
    password: 'password123',
    user: {
      id: 'usr-employee-1',
      name: 'Jane Employee',
      email: 'employee@smarthr.com',
      role: 'employee',
      companyId: 'co-1',
    },
  },
  {
    email: '2fa@smarthr.com',
    password: 'password123',
    requiresTwoFactor: true,
    user: {
      id: 'usr-2fa-1',
      name: 'Two Factor User',
      email: '2fa@smarthr.com',
      role: 'hr_admin',
      companyId: 'co-1',
    },
  },
]

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

  const account = MOCK_USERS.find(
    (user) => user.email.toLowerCase() === data.email.toLowerCase(),
  )

  if (!account || account.password !== data.password) {
    throw new Error('Invalid email or password')
  }

  if (account.requiresTwoFactor) {
    pendingTwoFactorSessions.set(account.email.toLowerCase(), account.user)
    return { requiresTwoFactor: true, email: account.email }
  }

  return AuthResponseSchema.parse({
    token: createToken(account.user.id),
    user: account.user,
  })
}

export async function register(data: RegisterInput): Promise<{ message: string }> {
  await delay()

  const exists = MOCK_USERS.some(
    (user) => user.email.toLowerCase() === data.email.toLowerCase(),
  )

  if (exists) {
    throw new Error('An account with this email already exists')
  }

  return {
    message: `Account created for ${data.firstName} ${data.lastName}. Please verify your email.`,
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

  return AuthResponseSchema.parse({
    token: createToken(user.id),
    user,
  })
}

export async function resendVerification(_email: string): Promise<{ message: string }> {
  await delay()
  return { message: 'Verification email sent.' }
}
