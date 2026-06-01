import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as authApi from '../../api/auth.api'

export function useEmailVerificationViewModel() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const verify = useCallback(async (verificationToken: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      await authApi.verifyEmail(verificationToken)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify email')
    } finally {
      setIsVerifying(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      void verify(token)
    }
  }, [token, verify])

  const onResend = async () => {
    if (!email) return

    setIsResending(true)
    setError(null)

    try {
      await authApi.resendVerification(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return {
    isVerifying,
    isSuccess,
    error,
    email,
    onResend,
    isResending,
  }
}
