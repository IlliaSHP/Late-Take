import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Text, View } from 'react-native'

import { type TAuthForm, authSchema } from '@app/schemas'

import { ApiError, useAuthMobileRegister } from '@app/api'

import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'

import { saveTokens } from '@/lib/token'
import { colors } from '@app/tokens'

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status >= 500) return 'Server error. Please try again later'
    return error.messages[0]   // повідомлення від бекенду, наприклад про зайнятий email
  }
  return 'Network error. Check your connection'   // fetch не зміг з'єднатись взагалі
}

export default function Register() {
  const { control, handleSubmit } = useForm<TAuthForm>({
    resolver: zodResolver(authSchema)
  })

  const { mutate, isPending, error } = useAuthMobileRegister({
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

        {error ? (
          <Text style={{ color: colors.status.error, paddingLeft: 10 }}>
            {getErrorMessage(error)}
          </Text>
        ) : null}
      </View>
    </Screen>
  )
}
