import { useQueryClient } from '@tanstack/react-query'

import {
  getDiscoverFindMyStateQueryKey,
  useDiscoverFindMyState,
  useLibrarySetStatusByDiscoverKey,
  useUserFindMe
} from '@app/api'
import type { TLibraryStatus } from '@app/types'

// Хук детальної сторінки тайтлу: статус у бібліотеці користувача, оцінка і зміна статусу.
// key — ключ тайтлу (напр. 'tmdb-movie-603')
export function useLibraryStatus(key: string) {
  // queryClient — один на весь застосунок екземпляр класу QueryClient з TanStack Query
  // (створюється через new QueryClient() і передається через QueryClientProvider).
  // Зберігає в пам'яті кеш: відповіді сервера під своїми ключами (queryKey).
  // Тут потрібен, щоб оновити кеш після зміни статусу
  const queryClient = useQueryClient()

  // Orval-хук: GET /users/me — поточний користувач.
  // status 200 — авторизований; поки запит іде або немає авторизації — false
  const { data: me } = useUserFindMe()
  const isAuthorized = me?.status === 200

  // Orval-хук (useQuery): GET /discover/{key}/me — стан тайтлу для користувача:
  // libraryEntry ({ id, status } або null) і review (відгук або null).
  // Відповідь кешується під ключем ['/discover/{key}/me'].
  // query — налаштування TanStack Query для цього запиту;
  // enabled: false — запит не відправляється, myState = undefined
  const { data: myState } = useDiscoverFindMyState(key, {
    query: { enabled: isAuthorized }
  })

  // Мутація — запит, що змінює дані на бекенді (POST / PUT / PATCH / DELETE).
  // На відміну від query, не кешується і запускається лише викликом mutate.
  // мутація в useLibrarySetStatusByDiscoverKey встановлює статус тайтлу в бібліотеці, користувача на бекенді. Повертає:
  // mutate — функція, що відправляє запит;
  // variables — аргументи останнього виклику mutate: { key, data: { status } };
  // isPending — true, поки запит виконується
  const { mutate, variables, isPending } = useLibrarySetStatusByDiscoverKey({
    mutation: {
      // onSettled — після завершення запиту, і при успіху, і при помилці.
      // invalidateQueries позначає кеш ['/discover/{key}/me'] застарілим;
      // якщо useDiscoverFindMyState зараз використовується в змонтованому компоненті,
      // TanStack одразу перезапитує його і myState отримує свіжий статус.
      // Проміс повертається (без {}), тому isPending = true до кінця перезапиту
      // 
      onSettled: () =>
        queryClient.invalidateQueries({
          // getDiscoverFindMyStateQueryKey - повертає ключ кешу для запиту стану тайтлу:
          queryKey: getDiscoverFindMyStateQueryKey(key)
        })
    }
  })

  // Статус, збережений на сервері: myState?.data — тіло відповіді,
  // libraryEntry?.status — статус або undefined; ?? null — якщо статусу немає
  const savedStatus = myState?.data.libraryEntry?.status ?? null

  // Статус, що зараз відправляється: поки isPending — беремо його з variables
  // (те, що передали в mutate), інакше undefined.
  // Дає показати вибір одразу, не чекаючи відповіді сервера
  const pendingStatus = isPending ? variables?.data.status : undefined

  // Змінити статус: компонент передає тільки статус,
  // а тут збирається об'єкт у форматі мутації:
  // key — ключ тайтлу (йде в URL), data — тіло запиту
  const setStatus = (status: TLibraryStatus) => {
    mutate({
      key,
      data: {
        status
      }
    })
  }

  return {
    isAuthorized,
    // Поки запит іде — вибраний статус, після — збережений на сервері
    status: pendingStatus ?? savedStatus,
    // Оцінка з відгуку користувача або null
    rating: myState?.data.review?.rating ?? null,
    setStatus
  }
}