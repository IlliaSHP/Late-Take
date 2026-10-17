/*
  useSaveReview — хук збереження відгуку.
  Створює новий відгук або змінює існуючий, а після успіху оновлює дані на екрані тайтлу.

  ─── Кеш та інвалідація ───
  Застосунок запам'ятовує дані, які вже завантажив із сервера (кеш), і показує їх
  без нового запиту. Кеш живе в пам'яті застосунку (бібліотека TanStack Query),
  а не на диску і не в SecureStore.
  Після збереження відгуку дані на сервері змінились, а в кеші лишились старі.
  Інвалідація — команда «ці дані застаріли, завантаж їх заново»: застосунок сам
  повторює той самий запит на сервер і оновлює екран.

  ─── queryClient.invalidateQueries({ queryKey: ... }) ───
  queryClient           — сховище всіх даних, завантажених із сервера (з useQueryClient());
                          одне на весь застосунок, тому useQueryClient() без параметрів
  .invalidateQueries()  — «позначити дані як застарілі й завантажити заново»
  { queryKey: ... }     — які саме дані оновити.
                          QueryKey = Query (запит на сервер) + Key (ключ) = «ключ запиту»:
                          ключ, під яким у кеші лежить відповідь цього запиту.
                          Кеш схожий на об'єкт:
                            {
                              ['/discover/tmdb-movie-603']:         дані тайтлу,
                              ['/reviews/discover/tmdb-movie-603']: відгуки на тайтл
                            }
                          Ключ хук завантаження ставить сам, коли зберігає дані в кеш

  ─── Функції get...QueryKey ───
  Повертають назву запису в кеші для даних, які завантажує відповідний хук use...:
    щоб оновити дані хука useXxx → бери функцію getXxxQueryKey
  Назви складені з бекенду: розділ API (група адрес на сервері) + операція.
    Discover — розділ із тайтлами (фільми, серіали, ігри...), адреси /discover/...
    Review   — розділ з відгуками, адреси /reviews/...

  getDiscoverFindByKeyQueryKey(key)
    get + Discover + Find + ByKey + QueryKey
    = «дай» + «тайтли» + «знайти» + «за ключем» + «назва в кеші»
    → назва в кеші для одного тайтлу, який завантажує useDiscoverFindByKey(key)

  getReviewFindByDiscoverKeyQueryKey(key)
    get + Review + Find + ByDiscoverKey + QueryKey
    = «дай» + «відгуки» + «знайти» + «за ключем тайтлу» + «назва в кеші»
    → назва в кеші для списку відгуків на тайтл, який завантажує useReviewFindByDiscoverKey(key)

  (key) — ключ тайтлу ('tmdb-movie-603'), щоб оновити дані саме цього тайтлу, а не всіх

  ─── create.mutate(...) / update.mutate(...) ───
  create / update        — дії «створити» / «змінити» відгук на сервері
  .mutate(аргумент1, аргумент2) — запустити дію, тобто відправити запит на сервер
  аргумент1 — що відправити:
    update: { id: reviewId, data: { rating, text } } — id відгуку, який змінюємо, і нові значення
    create: { key, data: { rating, text } }          — key тайтлу, до якого створюємо відгук;
                                                       id немає — його дасть сервер
    { rating, text } — скорочений запис { rating: rating, text: text }
  аргумент2 — { onSuccess: () => { onSaved() } }: що зробити, коли сервер відповів «успішно»

  ─── Два onSuccess ───
  в useReviewCreateByDiscoverKey / useReviewUpdate — інвалідація, після кожного збереження
  в .mutate(...)                                   — onSaved (закрити екран), тільки для цього виклику
  Порядок: спочатку оновлюються дані, потім закривається екран.
*/

import { useQueryClient } from '@tanstack/react-query'

import type { TReviewSchema } from '@app/schemas'

import {
  getDiscoverFindByKeyQueryKey,
  getReviewFindByDiscoverKeyQueryKey,
  useReviewCreateByDiscoverKey,
  useReviewUpdate
} from '@app/api'

// key — ключ тайтлу (наприклад, 'tmdb-movie-603')
// reviewId — id відгуку користувача; null, якщо відгуку ще немає
export function useSaveReview(key: string, reviewId: string | null) {
  // Сховище кешу всього застосунку
  const queryClient = useQueryClient()

  // Інвалідація після успішного збереження — потрібна і при створенні, і при оновленні.
  // Promise.all — обидва оновлення одночасно; чекаємо, поки завершаться обидва
  const onSuccess = () =>
    Promise.all([
      // Дані тайтлу — завантажити заново
      queryClient.invalidateQueries({
        queryKey: getDiscoverFindByKeyQueryKey(key)
      }),
      // Список відгуків на тайтл — завантажити заново, щоб там з'явився новий відгук
      queryClient.invalidateQueries({
        queryKey: getReviewFindByDiscoverKeyQueryKey(key)
      })
    ])

  // Дія «створити відгук»; після успіху — інвалідація
  const create = useReviewCreateByDiscoverKey({
    mutation: {
      onSuccess
    }
  })
  // Дія «змінити відгук»; після успіху — інвалідація
  const update = useReviewUpdate({
    mutation: {
      onSuccess
    }
  })

  // Викликається формою при натисканні кнопки.
  // { rating, text } — значення з форми; onSaved — що зробити після успіху (закрити екран)
  const saveReview = ({ rating, text }: TReviewSchema, onSaved: () => void) => {
    // Відгук уже є — змінюємо його за id
    if (reviewId) {
      update.mutate(
        { id: reviewId, data: { rating, text } },
        {
          onSuccess: () => {
            onSaved()
          }
        }
      )

      return
    }

    // Відгуку немає — створюємо новий для тайтлу з цим key
    create.mutate(
      { key, data: { rating, text } },
      {
        onSuccess: () => {
          onSaved()
        }
      }
    )
  }

  return {
    saveReview,
    // true, поки йде створення або оновлення — щоб заблокувати кнопку
    isSaving: create.isPending || update.isPending
  }
}