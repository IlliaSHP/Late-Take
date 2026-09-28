# http.ts і configureApi

Файли:
- `packages/api/src/http.ts`: функція `http`, через яку йдуть усі запити, і `configureApi`
- `apps/mobile/src/lib/api.ts`: налаштування `http` для мобільного застосунку

## Навіщо свій http, а не функція від Orval

Без `mutator` Orval генерує функції з простим `fetch`, який знає тільки адресу ендпоінту і дані. Про проект він нічого не знає: ні де лежить токен, ні як обробляти помилки.

Свій `http` робить так, що **всі запити проходять через одну функцію**, у якій один раз налаштовано все спільне:

- **токен до кожного запиту автоматично.** Без цього в кожному місці, де робиш запит, треба було б діставати токен і додавати заголовок руками
- **адреса бекенду з налаштувань.** Змінив `.env`, і всі запити пішли на нову адресу
- **однакові помилки.** Бекенд повертає `message` то рядком, то масивом; `http` завжди перетворює це на `ApiError` зі `status` і масивом `messages`
- **особливі випадки**, наприклад відповідь `204` без тіла
- **спільний пакет для різних застосунків.** `packages/api` не знає про SecureStore (це тільки мобілка). Через `configureApi` кожен застосунок підключає своє сховище токена і адресу
- **зміни в одному місці.** Наприклад, логіку «отримав 401 → оновив access через refresh → повторив запит» пишуть один раз у `http`, і вона працює для всіх ендпоінтів

`mutator` у конфігу Orval означає: функції запитів генерує Orval, але сам запит робиться через нашу функцію `http`.

## configureApi: чому пакет налаштовується ззовні

`packages/api` не знає:
- за якою адресою бекенд
- де лежить токен (мобілка: SecureStore, веб: інакше)

Тому пакет експортує `configureApi`, а кожен застосунок викликає її зі своїми значеннями:

```
packages/api/src/http.ts     ← вміє робити запити, чекає налаштувань
      ↑ configureApi(...)
apps/mobile/src/lib/api.ts   ← передає адресу і функцію для отримання токена
```

## Чому getToken повертає Promise

```ts
// http.ts
let getToken: () => Promise<string | null> = async () => null
```

Тип вимагає функцію, що повертає **Promise**. Так підходять і асинхронні сховища, і синхронні:

```ts
// мобілка: SecureStore асинхронний, getItemAsync сам повертає Promise
getToken: () => SecureStore.getItemAsync('accessToken')

// веб: localStorage синхронний, повертає string | null, а не Promise
getToken: () => localStorage.getItem('accessToken')          // ❌ TS помилка: не Promise
getToken: async () => localStorage.getItem('accessToken')    // ✅ async-функція ЗАВЖДИ повертає Promise
```

У рантаймі `await` на значенні, яке не Promise, теж працює: `await 'abc'` просто дає `'abc'`. Тому одна логіка підходить для обох сховищ.

## api.ts

```ts
import * as SecureStore from 'expo-secure-store'
import { ACCESS_TOKEN } from '@app/constants'
import { configureApi } from '@app/api'

configureApi({
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
  getToken: () => SecureStore.getItemAsync(ACCESS_TOKEN)
})
```

- `configureApi(...)` стоїть на верхньому рівні файлу → виконується, коли файл імпортують. Файл має імпортуватись один раз при старті застосунку, найзручніше в кореневому `_layout.tsx`: `import '@/lib/api'`
- `process.env.EXPO_PUBLIC_API_URL`: адреса з `apps/mobile/.env`. Префікс `EXPO_PUBLIC_` обов'язковий, інакше Expo не передасть змінну в застосунок
- `!`: сказати TS «тут точно не `undefined`»
- `getToken`: при кожному запиті дістає access-токен з SecureStore

Використовувати константу `ACCESS_TOKEN`, а не рядок `'accessToken'`: той самий ключ використовується при збереженні в `token.ts`, і опечатка в рядку тихо зламає авторизацію (див. [../auth/tokens-and-secure-store.md](../auth/tokens-and-secure-store.md)).

## Як http потрапляє в згенерований код

Через `mutator` у конфігу Orval. При генерації Orval:
1. дописує в **кожен** згенерований файл `import { http } from '../../http'` (шлях вирахував з `mutator.path`)
2. у **кожній** функції запиту викликає `http<ТипВідповіді>(url, { method, headers, body })`

Порядок був такий: автор спершу написав `http.ts`, потім вказав його в конфігу, потім запустив Orval.