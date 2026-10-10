import { z } from 'zod'

import { REVIEW_RATING, REVIEW_TEXT } from '@app/constants'

// Zod-схема даних форми відгуку: описує правила і перевіряє дані під час виконання
export const reviewSchema = z.object({
  rating: z
    .number({ message: 'Rate the title' })
    .int()
    .min(REVIEW_RATING.min)
    .max(REVIEW_RATING.max),
  text: z
    .string()
    // Перетворення, не перевірка: прибирає пробіли по краях перед наступними правилами
    .trim()
    .max(REVIEW_TEXT.max, {
      message: `Up to ${REVIEW_TEXT.max} characters`
    })
    // Власна перевірка: text — значення поля після .trim(), Zod передає його сам
    // (як і в попередні правила ланцюжка; тут видно явно, бо функцію пишемо ми).
    // !text ->  text = "": порожній рядок — falsy, тому !"" дає true.
    // Текст необов'язковий (порожній проходить), але якщо є — не коротший за min.
    // true = ок, false = помилка
    .refine(text => !text || text.length >= REVIEW_TEXT.min, {
      message: `At least ${REVIEW_TEXT.min} characters or leave it empty`
    })
})

// TS-тип даних форми, виведений зі схеми: { rating: number; text: string }
// typeof — тип змінної-схеми, z.infer — дістає з нього тип даних
export type TReviewSchema = z.infer<typeof reviewSchema>