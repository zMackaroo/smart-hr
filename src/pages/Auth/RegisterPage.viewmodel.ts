import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../../api/auth.api'
import { useNotificationStore } from '../../store/notificationStore'
import { RegisterSchema, type RegisterInput } from '../../types/auth.types'

export function useRegisterViewModel() {
  const navigate = useNavigate()
  const addNotification = useNotificationStore((state) => state.addNotification)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authApi.register(data)
      addNotification('success', result.message)
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account')
    } finally {
      setIsLoading(false)
    }
  })

  return { form, onSubmit, isLoading, error }
}
