import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'

import { type TAuthForm, authSchema } from '@app/schemas'

import { useAuthMobileRegister } from '@app/api'

import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'

import { saveTokens } from '@/lib/token'
import Button from '@/components/ui/Button'

export default function Register() {
  const { control, handleSubmit } = useForm<TAuthForm>({
    resolver: zodResolver(authSchema)
  })

  const { mutate, isPending } = useAuthMobileRegister({
    mutation: {
      onSuccess: async ({ data: { accessToken, refreshToken } }) => {
        await saveTokens(accessToken, refreshToken)
        router.replace('/')
      }
    }
  })

  const onSubmit = (data: TAuthForm) => {
    mutate({ data })
  }

  return (
    <Screen>
      <View>
        <Controller
          control={control}
          name='email'
          render={({ field, fieldState }) => (
            <Input
              placeholder='Enter email'
              autoCapitalize='none'
              keyboardType='email-address'
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name='password'
          render={({ field, fieldState }) => (
            <Input
              placeholder='Enter password'
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          isDisabled={isPending}
        >
          {isPending ? 'Creating...' : 'Create acount'}
        </Button>
      </View>
    </Screen>
  )
}
