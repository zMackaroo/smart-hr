import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as authApi from '../../api/auth.api'
import { RegisterSchema, type RegisterInput } from '../../types/auth.types'

interface RegisterSuccess {
  companySlug: string
  companyName: string
  message: string
}

export function useRegisterViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<RegisterSuccess | null>(null)

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
      setSuccess(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account')
    } finally {
      setIsLoading(false)
    }
  })

  return { form, onSubmit, isLoading, error, success }
}
