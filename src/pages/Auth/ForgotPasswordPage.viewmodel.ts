import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as authApi from '../../api/auth.api'
import { ForgotPasswordSchema, type ForgotPasswordInput } from '../../types/auth.types'

export function useForgotPasswordViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true)

    try {
      await authApi.forgotPassword(data)
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  })

  return { form, onSubmit, isLoading, isSubmitted }
}
