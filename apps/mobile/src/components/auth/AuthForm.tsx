import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { AUTH_FORM_CONTENT } from '@app/constants'

import { colors, fontSize, fontWeight, space } from '@app/tokens'

import { type TAuthForm, authSchema } from '@app/schemas'

import { ApiError } from '@app/api'

import { Input } from '../ui/Input'
import { Screen } from '../ui/Screen'
import { ChevronLeft } from 'lucide-react-native'
import { Button, FloatingButton } from '../ui'

interface Props {
  type: keyof typeof AUTH_FORM_CONTENT
  isPending: boolean
  error: unknown
  onSubmit: (data: TAuthForm) => void
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status >= 500) return 'Server error. Please try again later'
    return error.messages[0] ?? 'Something went wrong' // повідомлення від бекенду, наприклад про зайнятий email
  }
  return 'Network error. Check your connection' // fetch не зміг з'єднатись взагалі
}

export function AuthForm({ error, isPending, onSubmit, type }: Props) {
  const content = AUTH_FORM_CONTENT[type]

  const { control, handleSubmit } = useForm<TAuthForm>({
    resolver: zodResolver(authSchema)
  })

  return (
    <Screen>
      <FloatingButton
        onPress={() => {
          router.push('/')
        }}
        icon={ChevronLeft}
        side='left'
        iconOffset={-2}
      />
      <View style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.title}>{content.title}</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name='email'
              render={({ field, fieldState }) => (
                <Input
                  placeholder='Email'
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
                  placeholder='Password'
                  isPassword
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            {!!error && <Text style={styles.error}>{getErrorMessage(error)}</Text>}

            <Button
              size='lg'
              onPress={handleSubmit(onSubmit)}
              isDisabled={isPending}
            >
              {isPending ? content.pending : content.submit}
            </Button>
            
          </View>
        </View>

        <Pressable onPress={() => router.replace(content.footerHref)}>
          <Text style={styles.link}>
            {content.footerText}{' '}
            <Text style={styles.linkAccent}>{content.footerAction}</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space['layout-horizontal'],
    paddingBottom: space[6]
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: space[10]
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center'
  },
  form: {
    gap: space[3]
  },
  error: {
    color: colors.status.error,
    fontSize: fontSize.sm,
    textAlign: 'center'
  },
  link: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    textAlign: 'center'
  },
  linkAccent: {
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline'
  }
})
