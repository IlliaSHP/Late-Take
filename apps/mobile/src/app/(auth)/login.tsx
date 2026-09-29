import { useAuthMobileLogin } from '@app/api'

import { AuthForm } from '@/components/auth/AuthForm'

import { useAuthSuccess } from '@/hooks/useAuthSuccess'

export default function Login() {
  const { mutate, isPending, error } = useAuthMobileLogin({
    mutation: { onSuccess: useAuthSuccess() }
  })

  return (
    <AuthForm
      type='login'
      error={error}
      isPending={isPending}
      onSubmit={data => mutate({ data })}
    />
  )
}
