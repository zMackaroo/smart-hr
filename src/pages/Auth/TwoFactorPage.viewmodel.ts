import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { TwoFactorSchema, type TwoFactorInput } from '../../types/auth.types'

export function useTwoFactorViewModel() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const twoFactorEmail = useAuthStore((state) => state.twoFactorEmail)
  const clearTwoFactorPending = useAuthStore((state) => state.clearTwoFactorPending)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<TwoFactorInput>({
    resolver: zodResolver(TwoFactorSchema),
    defaultValues: { code: '' },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    if (!twoFactorEmail) {
      navigate('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await authApi.verifyTwoFactor(data.code)
      login(result.token, result.user)
      clearTwoFactorPending()
      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid verification code'
      setError(message)
      form.setError('code', { message })
    } finally {
      setIsLoading(false)
    }
  })

  return { form, onSubmit, isLoading, error, twoFactorEmail }
}
