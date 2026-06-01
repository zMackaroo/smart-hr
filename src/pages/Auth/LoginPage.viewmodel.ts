import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { LoginSchema, isTwoFactorRequired, type LoginInput } from '../../types/auth.types'

export function useLoginViewModel() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const setTwoFactorPending = useAuthStore((state) => state.setTwoFactorPending)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authApi.login(data)

      if (isTwoFactorRequired(result)) {
        setTwoFactorPending(result.email)
        navigate('/2fa')
        return
      }

      login(result.token, result.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in')
    } finally {
      setIsLoading(false)
    }
  })

  return { form, onSubmit, isLoading, error }
}
