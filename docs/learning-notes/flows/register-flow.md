# Реєстрація: повна картина від бекенду до кнопки

Файл збирає разом усі частини. Кожна окрема тема детально описана у своєму файлі (посилання в кінці).

Тут дві частини:
1. **Як з'являється код і типи** (відбувається, коли розробники пишуть код і запускають генерацію)
2. **Що відбувається в застосунку**, коли користувач реєструється

---

## Частина 1. Як з'являються типи на фронті

```
БЕКЕНД (r-m-back-end)
│
│  1. Бекенд-розробник пише DTO-клас з правилами
│     src/auth/dto/register.dto.ts
│       class RegisterDto { email: string; password: string } + правила перевірки
│
│  2. І ендпоінт, який приймає цей DTO і повертає AuthResponse
│     POST /auth/mobile/register
│
│  3. При запуску бекенду пакет @nestjs/swagger проходить по всіх ендпоінтах і DTO
│     і генерує openapi.json
│       → роздається за адресою http://localhost:4000/api/docs-json
│       → Swagger UI показує його як сторінку: http://localhost:4000/api/docs
│
ФРОНТ (red-marathon-code)
│
│  4. Фронтендер запускає Orval у packages/api (бекенд має бути запущений)
│     Orval читає openapi.json по URL з orval.config.ts і генерує:
│       packages/api/src/generated/models/registerDto.ts     ← interface RegisterDto
│       packages/api/src/generated/models/authResponse.ts    ← interface AuthResponse
│       packages/api/src/generated/auth-mobile/auth-mobile.ts ← функція authMobileRegister
│                                                               + хук useAuthMobileRegister
│     Кожна згенерована функція робить запит через http з packages/api/src/http.ts (mutator)
│
│  5. packages/schemas/src/auth.ts
│       authSchema = z.object({ email, password })   ← правила перевірки форми (Zod)
│       satisfies z.ZodType<RegisterDto>             ← TS перевіряє: схема = DTO
│       TAuthForm = z.infer<typeof authSchema>        ← тип форми зі схеми
│
│  6. apps/mobile/src/app/(auth)/register.tsx
│       useForm<TAuthForm>({ resolver: zodResolver(authSchema) })
│       useAuthMobileRegister({ mutation: { onSuccess } })
│       Controller / useController → Input
│       Button onPress={handleSubmit(onSubmit)}
```

Бекенд змінив DTO → перезапустити бекенд → перезапустити Orval → `RegisterDto` оновився → якщо схема більше не відповідає, `satisfies` в `auth.ts` покаже помилку.

---

## Частина 2. Що відбувається в застосунку

### Крок 0. Старт застосунку

```
_layout.tsx
  → імпортує @/lib/api (api.ts)
  → api.ts викликає configureApi({ baseUrl, getToken })
  → http.ts запам'ятовує адресу бекенду і функцію отримання токена
  → QueryClientProvider дає доступ до TanStack Query всьому застосунку
```

### Крок 1. Відкрився екран реєстрації

```
register.tsx → Register()
  useForm<TAuthForm>({ resolver: zodResolver(authSchema) })
    → створює форму: значення { email, password }, помилки {}
    → повертає control і handleSubmit

  useAuthMobileRegister({ mutation: { onSuccess } })
    → створює мутацію (запит ще не йде)
    → повертає mutate і isPending = false

  Controller name='email'  (control → форма)
    → бере з форми значення і помилку поля email
    → викликає функцію з render({ field, fieldState })
    → на екрані Input: value = '', помилки нема

  Controller name='password' → те саме для пароля

  Button onPress={handleSubmit(onSubmit)}, isDisabled={false}, текст 'Create account'
```

### Крок 2. Користувач друкує

```
користувач ввів 'a' в поле email
  → Input (TextInput всередині) викликає onChangeText('a')
  → onChangeText це field.onChange → field.onChange('a')
  → форма записує email = 'a'
  → Controller поля email перемальовується → render з field.value = 'a'
  → Input показує 'a'
```

Двостороннє зв'язування: `value={field.value}` (форма → інпут), `onChangeText={field.onChange}` (інпут → форма).

### Крок 3. Натиснув кнопку з неправильними даними

```
Button onPress → функція, яку повернув handleSubmit(onSubmit)
  1. збирає значення форми: { email: 'abc', password: '123' }
  2. викликає resolver (функцію від zodResolver)
  3. всередині authSchema.safeParse(значення)
       email → схема z.email → 'abc' не email ❌
       password → схема z.string().min(6) → 3 символи ❌
  4. zodResolver перетворює issues Zod у формат форми:
       { errors: { email: { message: 'Invalid email' },
                   password: { message: 'Password must be at least 6 characters' } } }
  5. форма записує помилки
  6. Controller name='email' бере errors.email → fieldState.error.message → Input error='Invalid email'
     Controller name='password' → те саме
  7. onSubmit НЕ викликається, запит не йде
```

### Крок 4. Виправляє поле

```
після першої невдалої спроби форма перевіряє дані при кожній зміні (reValidateMode: 'onChange')
  користувач виправив email на 'illia@gmail.com'
  → field.onChange → форма записала значення → resolver → Zod: email ✅
  → errors.email прибрано → Input більше не показує помилку
```

### Крок 5. Натиснув кнопку з правильними даними

```
handleSubmit
  → resolver → Zod ✅ → помилок нема
  → викликає onSubmit({ email: 'illia@gmail.com', password: '123456' })

onSubmit
  → mutate({ data })

TanStack Query (useMutation усередині useAuthMobileRegister)
  → isPending = true → Register перемальовується
       Button isDisabled = true, текст 'Creating...'
  → mutationFn({ data }) → authMobileRegister(data)

authMobileRegister (згенерована Orval)
  → http('/auth/mobile/register', { method: 'POST', body: JSON.stringify(data) })

http.ts
  → await getToken() → SecureStore → null (користувач ще не зареєстрований)
  → fetch(`${baseUrl}/${url}`, ...) без заголовка Authorization
```

### Крок 6. Бекенд

```
POST /auth/mobile/register
  → бекенд ще раз перевіряє тіло правилами з RegisterDto (class-validator)
  → створює користувача в базі (Prisma)
  → створює access- і refresh-токени, зберігає хеш refresh у базі
  → відповідає AuthResponse з токенами
```

Якби бекенд відповів помилкою (наприклад, email уже зайнятий): `http` кинув би `ApiError` зі `status` і `messages`, TanStack Query поставив би `isError = true` і `error`, а `onSuccess` не викликався б.

### Крок 7. Успішна відповідь

```
http → response.ok → повертає результат
TanStack Query → isPending = false → викликає onSuccess(результат)
   (типи Orval чекають, що http поверне { data, status, headers };
    див. «Формат відповіді http» у ../api/tanstack-query.md)

onSuccess
  → await saveTokens(accessToken, refreshToken)
       token.ts → SecureStore.setItemAsync(ACCESS_TOKEN, ...) і (REFRESH_TOKEN, ...)
  → router.replace('/')
       головний екран замінює реєстрацію, «назад» сюди не поверне
```

### Крок 8. Наступні запити

```
будь-який хук Orval на головному екрані → http(...)
  → await getToken() → SecureStore.getItemAsync(ACCESS_TOKEN) → токен
  → headers: { Authorization: 'Bearer <токен>' }
  → бекенд знає, хто робить запит
```

---

## Хто за що відповідає

| Файл / бібліотека | Відповідальність |
|---|---|
| бекенд: DTO + `@nestjs/swagger` | контракт API і `openapi.json` |
| Orval (`packages/api/orval.config.ts`) | генерує типи, функції і хуки з `openapi.json` |
| `packages/api/src/http.ts` | робить усі запити: адреса, токен, помилки |
| `apps/mobile/src/lib/api.ts` | налаштовує `http` для мобілки |
| `packages/schemas/src/auth.ts` | правила форми (Zod), зв'язок з DTO, тип форми |
| react-hook-form | значення полів, валідація через resolver, помилки, відправка |
| `zodResolver` | перетворює результат Zod у формат react-hook-form |
| TanStack Query | стан запиту (`isPending`), виклик `onSuccess` |
| `apps/mobile/src/lib/token.ts` | зберігає і видаляє токени в SecureStore |
| `register.tsx` | збирає все разом: форма, поля, кнопка, запит, перехід |

---

## Детально по темах

- DTO і схеми: [../api/schemas-and-dto.md](../api/schemas-and-dto.md)
- OpenAPI, Swagger, Orval: [../api/openapi-swagger-orval.md](../api/openapi-swagger-orval.md)
- http.ts і configureApi: [../api/http-client.md](../api/http-client.md)
- TanStack Query: [../api/tanstack-query.md](../api/tanstack-query.md)
- Zod: [../forms/zod.md](../forms/zod.md)
- react-hook-form, register, Controller, render: [../forms/react-hook-form.md](../forms/react-hook-form.md)
- Resolver і zodResolver: [../forms/resolver.md](../forms/resolver.md)
- Токени і SecureStore: [../auth/tokens-and-secure-store.md](../auth/tokens-and-secure-store.md)
- satisfies: [../javascript-typescript/satisfies.md](../javascript-typescript/satisfies.md)
- Дженерики, Record: [../javascript-typescript/generics-and-record.md](../javascript-typescript/generics-and-record.md)
- Що виконується при імпорті: [../javascript-typescript/modules-and-imports.md](../javascript-typescript/modules-and-imports.md)