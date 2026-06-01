# Spec 02 — Authentication

## Goal

Implement the complete authentication flow: Register, Login, Forgot Password,
Reset Password, Email Verification, and 2-Step Verification. All pages are
public (no auth required). On successful login the user is redirected to
`/dashboard`. All auth state is persisted via `authStore`.

---

## Routes

| Path               | Page                    | Public |
| ------------------ | ----------------------- | ------ |
| `/login`           | `LoginPage`             | ✅     |
| `/register`        | `RegisterPage`          | ✅     |
| `/forgot-password` | `ForgotPasswordPage`    | ✅     |
| `/reset-password`  | `ResetPasswordPage`     | ✅     |
| `/verify-email`    | `EmailVerificationPage` | ✅     |
| `/2fa`             | `TwoFactorPage`         | ✅     |

Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`.

---

## File Structure

```
src/
├── pages/
│   └── Auth/
│       ├── LoginPage.tsx
│       ├── LoginPage.viewmodel.ts
│       ├── RegisterPage.tsx
│       ├── RegisterPage.viewmodel.ts
│       ├── ForgotPasswordPage.tsx
│       ├── ForgotPasswordPage.viewmodel.ts
│       ├── ResetPasswordPage.tsx
│       ├── ResetPasswordPage.viewmodel.ts
│       ├── EmailVerificationPage.tsx
│       ├── EmailVerificationPage.viewmodel.ts
│       ├── TwoFactorPage.tsx
│       └── TwoFactorPage.viewmodel.ts
├── api/
│   └── auth.api.ts
└── types/
    └── auth.types.ts
```

---

## Zod Schemas & Types (`auth.types.ts`)

```ts
// Enums
export type UserRole = "super_admin" | "hr_admin" | "employee";

// Auth user shape (stored in authStore)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  companyId?: string;
}

// Login
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Register
export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    companyName: z.string().min(1, "Company name is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof RegisterSchema>;

// Forgot password
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

// Reset password
export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// 2FA
export const TwoFactorSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});
export type TwoFactorInput = z.infer<typeof TwoFactorSchema>;

// API response
export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(["super_admin", "hr_admin", "employee"]),
    avatarUrl: z.string().optional(),
    companyId: z.string().optional(),
  }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
```

---

## API Functions (`auth.api.ts`)

```ts
login(data: LoginInput): Promise<AuthResponse>
  POST /api/auth/login

register(data: RegisterInput): Promise<{ message: string }>
  POST /api/auth/register

forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }>
  POST /api/auth/forgot-password

resetPassword(token: string, data: ResetPasswordInput): Promise<{ message: string }>
  POST /api/auth/reset-password  body: { token, ...data }

verifyEmail(token: string): Promise<{ message: string }>
  POST /api/auth/verify-email  body: { token }

verifyTwoFactor(code: string): Promise<AuthResponse>
  POST /api/auth/2fa/verify  body: { code }

resendVerification(email: string): Promise<{ message: string }>
  POST /api/auth/resend-verification
```

---

## ViewModel Hooks

### `useLoginViewModel`

```ts
returns {
  form: UseFormReturn<LoginInput>   // RHF form
  onSubmit: (data: LoginInput) => void
  isLoading: boolean
  error: string | null
}
```

On success: calls `authStore.login(token, user)`, then navigates to `/dashboard`.
If API returns `requiresTwoFactor: true`, navigates to `/2fa` instead.

### `useRegisterViewModel`

```ts
returns {
  form: UseFormReturn<RegisterInput>
  onSubmit: (data: RegisterInput) => void
  isLoading: boolean
  error: string | null
}
```

On success: navigates to `/verify-email?email=<email>` with success toast.

### `useForgotPasswordViewModel`

```ts
returns {
  form: UseFormReturn<ForgotPasswordInput>
  onSubmit: (data: ForgotPasswordInput) => void
  isLoading: boolean
  isSubmitted: boolean   // show success state after submit
}
```

### `useResetPasswordViewModel`

```ts
returns {
  form: UseFormReturn<ResetPasswordInput>
  onSubmit: (data: ResetPasswordInput) => void
  isLoading: boolean
  token: string    // parsed from URL query param
}
```

On success: navigates to `/login` with success toast.

### `useEmailVerificationViewModel`

```ts
returns {
  isVerifying: boolean
  isSuccess: boolean
  error: string | null
  email: string          // from URL query param (display only)
  onResend: () => void
  isResending: boolean
}
```

Auto-triggers verification on mount if `?token=` is present in URL.

### `useTwoFactorViewModel`

```ts
returns {
  form: UseFormReturn<TwoFactorInput>
  onSubmit: (data: TwoFactorInput) => void
  isLoading: boolean
  error: string | null
}
```

---

## UI Layout — Auth Pages

All auth pages share a two-column layout:

```
┌────────────────────┬────────────────────────────┐
│  Left panel        │  Right panel               │
│  ~40% width        │  ~60% width                │
│  bg-navy           │  bg-surface                │
│  Brand logo        │  Form card centred         │
│  Tagline           │  vertically                │
│  Illustration      │                            │
└────────────────────┴────────────────────────────┘
```

- Mobile: left panel hidden, right panel full width.
- Logo: top-left of left panel, white.
- Form card: `max-w-md w-full mx-auto px-8 py-10`.

### LoginPage

- Title: "Sign In"
- Fields: Email, Password (show/hide toggle)
- Checkbox: "Remember me"
- Link: "Forgot password?" → `/forgot-password`
- Primary button: "Sign In" (full width)
- Footer link: "Don't have an account? Register" → `/register`

### RegisterPage

- Title: "Create Account"
- Fields: First Name, Last Name, Company Name, Email, Password, Confirm Password
- Primary button: "Create Account"
- Footer link: "Already have an account? Sign In" → `/login`

### ForgotPasswordPage

- Title: "Forgot Password"
- Subtitle: "Enter your email and we'll send you a reset link."
- Field: Email
- Primary button: "Send Reset Link"
- On success: replace form with green success message + "Back to login" link
- Back link: "← Back to Login"

### ResetPasswordPage

- Title: "Reset Password"
- Fields: New Password, Confirm Password (both with show/hide)
- Primary button: "Reset Password"

### EmailVerificationPage

- Title: "Verify Your Email"
- Shows masked email address
- If `?token=` present: auto-verifies, shows spinner → success state
- If no token: shows "Check your inbox" message
- Button: "Resend Email"
- Success state: green checkmark + "Continue to Login" button

### TwoFactorPage (2-Step Verification)

- Title: "2-Step Verification"
- Subtitle: "Enter the 6-digit code from your authenticator app."
- 6 individual digit input boxes (auto-focus next on input)
- Primary button: "Verify"

---

## authStore Integration

```ts
// On successful login:
authStore.login(token, user);
// Persists token to localStorage via Zustand persist middleware

// On logout (handled by Axios 401 interceptor or explicit logout):
authStore.logout();
// Clears localStorage, resets store, navigates to /login
```

---

## Acceptance Criteria

1. User can register with valid data and is redirected to email verification page.
2. User can log in and is redirected to `/dashboard`.
3. JWT token is stored in `localStorage` and attached to all subsequent requests.
4. Visiting `/login` while authenticated redirects to `/dashboard`.
5. Visiting a protected route while unauthenticated redirects to `/login`.
6. Forgot password form submits and shows success state without page reload.
7. Reset password form validates password match client-side before submitting.
8. Email verification auto-triggers when `?token=` is in the URL.
9. 2FA page accepts only 6-digit codes and shows inline error on wrong code.
10. All forms show field-level validation errors inline (not via alert).
