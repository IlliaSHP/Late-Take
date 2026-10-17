import { zodResolver } from '@hookform/resolvers/zod'
import { router, useLocalSearchParams } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSize, space } from '@app/tokens'

import type { TReviewSchema } from '@app/schemas'
import { reviewSchema } from '@app/schemas'

import { useDiscoverFindByKey, useDiscoverFindMyState } from '@app/api'

import { Input, ScreenTitle, SheetFooter } from '@/components/ui'

import { RatingSlider } from '@/components/detail/review-form/RatingSlider'

import { useSaveReview } from '@/hooks/useSaveReview'

export default function ReviewSheet() {
  // key тайтлу з адреси екрана: файл називається [key].tsx,
  // тому для /review/tmdb-movie-603 тут буде key = 'tmdb-movie-603'
  const { key } = useLocalSearchParams<{ key: string }>()
  // Завантажує дані тайтлу (назва, постер тощо) за його key
  const { data: title } = useDiscoverFindByKey(key)
  // Завантажує «мій стан» для тайтлу одним запитом: статус тайтлу в моїй бібліотеці
  // і мій відгук на нього (тут потрібен тільки відгук)
  const { data: myState } = useDiscoverFindMyState(key)

  // Мій відгук на цей тайтл; null — відгуку ще немає
  const review = myState?.data.review ?? null
  // Назва тайтлу — тільки якщо сервер відповів успішно (200); інакше null
  const titleName = title?.status === 200 ? title.data.name : null

  // Функція збереження і прапорець «зараз зберігається».
  // id відгуку передаємо, щоб хук знав: оновлювати існуючий чи створювати новий
  const { saveReview, isSaving } = useSaveReview(key, review?.id ?? null)

  // Форма з react-hook-form:
  //  - control — зв'язує поля форми (Controller нижче) з цією формою
  //  - handleSubmit — обгортка для відправки форми (див. onSubmit)
  //  - isValid — true, коли всі поля проходять перевірку схеми
  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<TReviewSchema>({
    // Перевірка полів за zod-схемою reviewSchema
    resolver: zodResolver(reviewSchema),
    // Перевіряти при кожній зміні поля, щоб isValid оновлювався одразу
    mode: 'onChange',
    // Початкові значення: з існуючого відгуку або порожні
    defaultValues: {
      rating: review?.rating,
      text: review?.text ?? ''
    }
  })

  // onSubmit — функція для кнопки «Send/Save».
  // handleSubmit(твоя функція) ще нічого не відправляє: вона створює нову функцію onSubmit.
  // Коли натиснули кнопку і викликався onSubmit:
  //  1. перевіряються всі поля форми за reviewSchema
  //  2. є помилки → твоя функція НЕ викликається, помилки показуються біля полів
  //  3. помилок немає → викликається твоя функція, і в values приходять
  //     значення всіх полів: { rating, text }
  // Твоя функція викликає saveReview: перший аргумент — дані відгуку,
  // другий — router.back (без дужок, тобто сама функція), щоб закрити екран після успіху
  const onSubmit = handleSubmit(values => saveReview(values, router.back))

  return (
    <View style={styles.root}>
      <ScreenTitle>How was it?</ScreenTitle>

      {/* Назва тайтлу під заголовком — тільки якщо вона є */}
      {!!titleName && <Text style={styles.subtitle}>{titleName}</Text>}

      {/* Поле «rating» форми.
          Controller з'єднує форму з компонентом, який не є стандартним полем вводу:
          field.value — поточне значення поля, field.onChange — записати нове значення у форму */}
      <Controller
        control={control}
        name='rating'
        render={({ field }) => (
          <RatingSlider
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />

      {/* Поле «text» форми.
          onChangeText — обробник події «користувач змінив текст».
            Належить не React, а React Native: це prop вбудованого компонента TextInput.
            У TextInput є два такі обробники, обидва спрацьовують на одну подію,
            різниця тільки в тому, що приходить у функцію:
              onChange     — приходить об'єкт події, текст треба діставати (e.nativeEvent.text)
              onChangeText — одразу приходить рядок з текстом
          field.onChange — не обробник події, а функція react-hook-form,
            яка записує значення в це поле форми (text). Назва схожа випадково
          onChangeText={field.onChange} — коли текст змінився, новий текст записується у форму,
            а field.value показує його назад у полі
          field.onBlur — повідомляє форму, що користувач вийшов з поля
          fieldState.error?.message — текст помилки, якщо поле не пройшло перевірку.
            Через mode: 'onChange' перевірка йде при кожній зміні тексту, тому помилка
            з'являється одразу під час введення (і ще раз перевіряється при натисканні кнопки) */}
      <Controller
        control={control}
        name='text'
        render={({ field, fieldState }) => (
          <Input
            multiline
            placeholder='Share your thoughts (optional)'
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      {/* Кнопки внизу шторки:
          - текст кнопки залежить від того, чи є вже відгук
          - кнопка неактивна, якщо форма не пройшла перевірку або вже йде збереження
          - «Cancel» просто закриває екран */}
      <SheetFooter
        submitLabel={review ? 'Save' : 'Send'}
        isSubmitDisabled={!isValid || isSaving}
        onCancel={router.back}
        onSubmit={onSubmit}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: space[4],
    paddingTop: space[6],
    paddingHorizontal: space['layout-horizontal']
  },
  subtitle: {
    color: colors.text['little-muted'],
    fontSize: fontSize.sm
  }
})