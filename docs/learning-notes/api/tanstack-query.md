# TanStack Query

## Що це

**TanStack Query** (пакет `@tanstack/react-query`) це **фронтенд-бібліотека** для роботи із запитами до сервера. Працює всередині застосунку, бекенд про неї нічого не знає.

Сам запит робить твій код (функція `http`). TanStack Query керує всім навколо нього:
- стан запиту: чекаємо (`isPending`), успіх, помилка
- що зробити після успіху чи помилки (`onSuccess`, `onError`)
- кеш: не завантажувати ті самі дані повторно
- повтор запиту при збої

**TanStack** це назва сімейства бібліотек одного автора: TanStack Query, Router, Table, Form. Бренд, а не одна бібліотека.

---

## Налаштування в _layout.tsx

`apps/mobile/src/app/_layout.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000 // 1min
    }
  }
})

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* весь застосунок */}
    </QueryClientProvider>
  )
}
```

- **`queryClient`**: об'єкт, який зберігає кеш усіх запитів і налаштування за замовчуванням. Один на весь застосунок, тому створюється поза компонентом (код поза компонентом виконується один раз)
- `retry: 1`: запит впав → повторити один раз
- `staleTime: 60_000`: дані свіжі 1 хвилину; поки свіжі, їх беруть з кешу без нового запиту (`60_000` = `60000`, `_` для читабельності)
- **`QueryClientProvider`**: компонент, який передає `queryClient` усім компонентам усередині. Хуки TanStack Query беруть клієнт саме з нього, без нього кидають помилку. Тому загортає весь застосунок

Це робиться **один раз**. Далі в компонентах просто викликаються хуки.

---

## useQuery і useMutation

| Хук | Для чого | Коли робить запит |
|---|---|---|
| `useQuery` | **отримати** дані (GET): рекомендації, профіль | **сам**, коли компонент з'являється |
| `useMutation` | **змінити** дані (POST, PATCH, DELETE): реєстрація | тільки коли викличеш `mutate` |

Хуки, які генерує Orval (`useAuthMobileRegister`, `useAiGetSummary`...), це **готові** `useMutation` і `useQuery`, вже налаштовані на конкретний ендпоінт. Тому самому писати `useQuery`/`useMutation` доводиться рідко.

---

## useMutation на прикладі реєстрації

### Що робить useAuthMobileRegister

`useAuthMobileRegister` = `useMutation`, якому Orval уже сказав, **який запит робити**. Ти додаєш, **що зробити після успіху**.

Якби писати без Orval, це виглядало б так:

```tsx
const { mutate, isPending } = useMutation({
  // що робити, коли викличуть mutate (це за тебе написав Orval)
  mutationFn: ({ data }) => authMobileRegister(data),

  // що зробити після успішної відповіді (це пишеш ти)
  onSuccess: async ({ data: { accessToken, refreshToken } }) => {
    await saveTokens(accessToken, refreshToken)
    router.replace('/')
  }
})
```

А з Orval ти пишеш тільки свою частину, в полі `mutation`:

```tsx
const { mutate, isPending } = useAuthMobileRegister({
  mutation: {
    onSuccess: async ({ data: { accessToken, refreshToken } }) => {
      await saveTokens(accessToken, refreshToken)
      router.replace('/')
    }
  }
})
```

Orval усередині хука склеює свій `mutationFn` з твоїм `onSuccess` в один об'єкт і передає в `useMutation`. Результат той самий, що в першому прикладі.

Якщо відкрити згенерований файл `generated/auth-mobile/auth-mobile.ts`, там для реєстрації три функції:
- `authMobileRegister`: робить сам запит `POST /auth/mobile/register` через `http`
- `getAuthMobileRegisterMutationOptions`: складає об'єкт налаштувань (`mutationFn` + твій `onSuccess`)
- `useAuthMobileRegister`: передає цей об'єкт у `useMutation`

### mutationFn

**Налаштування `useMutation`: функція, яка робить запит.** TanStack Query викликає її сам, коли ти викликаєш `mutate`, і передає їй те, що ти передав у `mutate`:

```
mutate({ data })
  → TanStack Query викликає mutationFn({ data })
  → authMobileRegister(data)
  → http(...) → fetch
```

### onSuccess

**Налаштування `useMutation`: функція, яку TanStack Query викликає сам після успішної відповіді** і передає їй результат. Є ще `onError` (при помилці) і `onSettled` (у будь-якому разі).

### Як це використовується в register.tsx

```tsx
const onSubmit = (data: TAuthForm) => {
  mutate({ data })   // запустити запит
}

<Button onPress={handleSubmit(onSubmit)} isDisabled={isPending}>
  {isPending ? 'Creating...' : 'Create account'}
</Button>
```

`isPending` дорівнює `true`, поки чекаємо відповідь: кнопка вимкнена і пише `Creating...`.

### Без TanStack Query

Для порівняння: так довелося б писати те саме вручну (у проекті так **не** зроблено):

```tsx
const [isPending, setIsPending] = useState(false)

const onSubmit = async (data: TAuthForm) => {
  setIsPending(true)
  try {
    const result = await authMobileRegister(data)
    await saveTokens(result.data.accessToken, result.data.refreshToken)
    router.replace('/')
  } catch (e) {
    // обробка помилки
  } finally {
    setIsPending(false)
  }
}
```

`isPending`, `try/catch`, виклик після успіху: усе це TanStack Query робить сам.

### Що повертає useMutation

| Що | Навіщо |
|---|---|
| `mutate` | запустити запит |
| `isPending` | `true`, поки чекаємо відповідь |
| `isSuccess`, `isError` | чим закінчився запит |
| `error` | помилка (у проекті `ApiError` з `http.ts`) |
| `data` | результат |

### Два різні data

- `mutate({ data })`: `data` це **тіло запиту** (email і пароль)
- `onSuccess: ({ data })`: `data` це поле **результату** (токени)

---

## Чому await перед saveTokens

### Що саме чекає await

`await` **зупиняє тільки ту async-функцію, в якій він написаний**. Рядки після `await` **у цій функції** чекають, поки Promise виконається. Решта застосунку в цей час працює далі: React малює, обробляє натискання, виконуються інші функції.

```ts
async function a() {
  console.log(1)
  await saveTokens(access, refresh)   // функція a тут зупинилась
  console.log(3)                      // виконається тільки після запису токенів
}

a()
console.log(2)   // код поза функцією a не чекає

// у консолі: 1, 2, 3
```

Поки функція чекає, сама робота (запис у сховище, мережевий запит, таймер) виконується **не в JS-коді**, а середовищем: операційною системою, нативним кодом React Native, браузером. JS у цей час вільний для іншого. Тому `async`/`await` має сенс тільки там, де є така зовнішня робота. Якщо поставити `async` і `await` у функцію, де вся робота звичайна (розрахунки, цикли), вона не стане швидшою і нічого не звільнить.

### Навіщо він у onSuccess

`await` робить одну з двох речей:
1. **дістає значення** з Promise: `const token = await getToken()`
2. **змушує рядки нижче в цій функції чекати**

`saveTokens` нічого не повертає (`Promise<void>`), тому тут потрібне друге: щоб `router.replace('/')` виконався тільки після того, як токени записані.

Без `await` помилки не буде: запис усе одно відбудеться. Але `router.replace('/')` виконається одразу, поки запис ще йде. Головний екран з'явиться раніше, і якщо він одразу зробить запит, `http` не знайде токен і відправить запит без нього, бекенд відповість 401.

`async` перед функцією `onSuccess` потрібен тому, що всередині є `await`: `await` можна писати тільки в async-функції.

---

## useQuery: отримання даних

Приклад з проекту: хук `useAiGetSummary(slug)` з `generated/ai/ai.ts` отримує опис тайтлу.

```tsx
function TitleSummary({ slug }: { slug: string }) {
  const { data, isLoading, error } = useAiGetSummary(slug)

  if (isLoading) return <Text>Loading...</Text>
  if (error) return <Text>Error</Text>

  return <Text>{/* дані з data */}</Text>
}
```

Що відбувається:
1. компонент з'явився → хук сам робить запит `GET /ai/summary/<slug>`
2. поки чекаємо: `isLoading = true`
3. відповідь прийшла → результат лежить у `data` і в кеші
4. інший компонент з тим самим `slug` протягом хвилини (`staleTime`) отримає дані з кешу, без запиту
5. запит впав → повтор один раз (`retry: 1`) → знову впав → `error`

Кеш розрізняє дані за **ключем** (`queryKey`). Orval сам робить ключ з адреси: для `useAiGetSummary('witcher')` це `['/ai/summary/witcher']`. Інший `slug` = інший ключ = окремий запис у кеші.

### Що повертає useQuery

| Що | Навіщо |
|---|---|
| `data` | результат |
| `isLoading` | перше завантаження, даних ще нема |
| `error` | помилка |
| `refetch` | зробити запит заново вручну |

---

## Чому QueryClientProvider у корені застосунку

Технічно провайдер можна поставити нижче: головне, щоб компонент з хуком TanStack Query був **всередині** провайдера. У корені його ставлять з двох причин:

1. **Хуки потрібні на багатьох екранах**: реєстрація, головна, сторінка тайтлу. Корінь загортає всі екрани одразу
2. **Один спільний кеш.** Кеш живе в `queryClient`, а провайдер дає його всім, хто всередині. Якби кожен екран мав свій провайдер зі своїм клієнтом, у кожного був би окремий кеш: дані, завантажені на одному екрані, не були б доступні на іншому. А коли екран закривався б, його провайдер зникав би разом з кешем. У корені провайдер живе весь час роботи застосунку

У Expo Router кореневий `app/_layout.tsx` загортає всі екрани, тому це природне місце.

---

## Коли хук повертає значення

```tsx
const { mutate, isPending } = useAuthMobileRegister({ ... })
```

React при кожному рендері викликає функцію компонента `Register()` зверху вниз. Коли доходить до цього рядка, хук **одразу** повертає об'єкт з **поточним** станом, і з нього деструктуруються `mutate` і `isPending`. Хук не чекає відповіді сервера: запит у цей момент навіть не робиться.

```
рендер 1: Register() → useAuthMobileRegister → { mutate, isPending: false }
натиснули кнопку → mutate(...) → запит пішов → TanStack Query змінює стан → новий рендер
рендер 2: Register() → useAuthMobileRegister → { mutate, isPending: true }   ← кнопка вимкнена
відповідь прийшла → стан змінився → новий рендер
рендер 3: Register() → useAuthMobileRegister → { mutate, isPending: false }
```

Так працюють усі хуки: `useState`, `useForm`, `useQuery`. Кожен рендер хук повертає актуальні значення, а коли стан усередині змінюється, хук запускає новий рендер.

Сам хук `useMutation` викликається на **кожному** рендері, як і будь-який хук, але він тільки **готує** мутацію і повертає `mutate`. Запит іде тільки після `mutate()`. `useQuery` на рендері теж готує запит і **одразу його робить**, якщо в кеші нема свіжих даних. У цьому різниця.

---

## Пояснення для співбесіди

`useAuthMobileRegister` це хук, згенерований Orval з `openapi.json` бекенду (а `openapi.json` бекенд генерує зі своїх ендпоінтів і DTO). Це обгортка над `useMutation` з TanStack Query, вже налаштована на ендпоінт `POST /auth/mobile/register`.

`useMutation` використовується для запитів, що змінюють дані на сервері (POST, PUT, PATCH, DELETE). На рендері він тільки готує мутацію, а запит відправляється при виклику `mutate`. Для отримання даних є `useQuery`: він робить запит сам, коли компонент рендериться, і кешує результат.

Хук приймає об'єкт налаштувань. У полі `mutation` передаються опції для `useMutation`, тут це `onSuccess`: функція, яку TanStack Query викликає після успішної відповіді (у проекті це статус 200–299; при помилці `http` кидає `ApiError`, і викликається `onError`). Першим аргументом TanStack Query передає в неї результат запиту. З нього деструктуруються `accessToken` і `refreshToken`, вони зберігаються в SecureStore через `saveTokens`, після чого `router.replace('/')` переводить на головний екран. `onSuccess` асинхронна, бо `await saveTokens` гарантує, що перехід станеться тільки після запису токенів.

Хук повертає `mutate`, функцію, яка запускає запит (викликає `mutationFn` з переданими даними), і `isPending`, прапорець, що запит виконується. `isPending` використовується, щоб вимкнути кнопку і показати `Creating...`.

`mutate` викликається в `onSubmit`, а `onSubmit` передається в `handleSubmit` з react-hook-form: при натисканні кнопки `handleSubmit` перевіряє поля через Zod-схему (підключену через `zodResolver`) і викликає `onSubmit` тільки з валідними даними форми.

---

## Що перевірити в проекті

**Формат результату.** Orval згенерував тип результату реєстрації:

```ts
{ data: MobileAuthResponse; status: 200; headers: Headers }
```

Тобто він чекає, що `http` поверне об'єкт, у якому тіло відповіді лежить у полі `data`. Тому в `onSuccess` пишеться `({ data: { accessToken } })`. Але `http.ts` зараз повертає тільки тіло (`return response.json()`). Якщо бекенд відповідає просто `{ accessToken, refreshToken }`, поля `data` в результаті не буде, і `onSuccess` впаде.

Перевірити: `console.log` першим рядком в `onSuccess`. Якщо поля `data` нема, кінець `http` треба змінити так:

```ts
const data = await response.json()
return { data, status: response.status, headers: response.headers } as T
```