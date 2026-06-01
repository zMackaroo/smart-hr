import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as authApi from '../../api/auth.api'
import { useNotificationStore } from '../../store/notificationStore'
import { ResetPasswordSchema, type ResetPasswordInput } from '../../types/auth.types'

export function useResetPasswordViewModel() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addNotification = useNotificationStore((state) => state.addNotification)
  const [isLoading, setIsLoading] = useState(false)
  const token = searchParams.get('token') ?? ''

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true)

    try {
      const result = await authApi.resetPassword(token, data)
      addNotification('success', result.message)
      navigate('/login')
    } catch (err) {
      form.setError('confirmPassword', {
        message: err instanceof Error ? err.message : 'Unable to reset password',
      })
    } finally {
      setIsLoading(false)
    }
  })

  return { form, onSubmit, isLoading, token }
}
