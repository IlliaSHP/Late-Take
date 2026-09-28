# Resolver і zodResolver

## Слово

**resolve** англійською: «вирішувати, розв'язувати». **resolver**: «той, хто вирішує».

У програмуванні слово зустрічається часто, і **в кожному місці означає своє**:
- **react-hook-form**: функція, що перевіряє дані форми (про це файл)
- **Promise**: «зарезолвився» = успішно виконався
- **DNS resolver**: перетворює `google.com` на IP-адресу
- **Vite, webpack**: resolve імпортів = знайти, де лежить файл з `import ... from '@app/api'`
- **GraphQL**: функція, що дістає дані для поля запиту

Спільна ідея: отримав питання → знайшов відповідь.

---

## Resolver у react-hook-form

**Resolver це налаштування `useForm`, у яке кладуть функцію перевірки всієї форми.** Викликає цю функцію сама форма.

```tsx
useForm({ resolver: функція })
//        ↑ місце   ↑ те, що форма викличе
```

Правила форма може отримати двома способами:
- **свої, вбудовані**: пропс `rules` у кожному `Controller` (`rules={{ minLength: { value: 6, message: '...' } }}`)
- **ззовні, через resolver**: одна функція на всю форму. Так роблять, коли правила вже описані в Zod, щоб не дублювати їх у кожному полі

### Що форма вимагає від функції

- **отримує**: об'єкт зі значеннями всіх полів
- **повертає**: `{ values, errors }`
  - все добре → `values` з даними, `errors` порожній
  - є помилки → `values` порожній, в `errors` помилки за назвами полів

Що всередині функції, форму не цікавить. Логіку або пишуть самі, або отримують готову від бібліотеки.

### Коли форма викликає resolver

За замовчуванням (`mode: 'onSubmit'`, `reValidateMode: 'onChange'`):
- при натисканні кнопки (`handleSubmit`)
- після першої невдалої спроби, **при кожній зміні поля**: виправив email → помилка зникає одразу

### Resolver руками, без Zod

Щоб було видно, що це звичайна функція:

```ts
const myResolver = async (values: TAuthForm) => {
  const errors: Record<string, { type: string; message: string }> = {}

  if (!values.email.includes('@')) {
    errors.email = { type: 'email', message: 'Invalid email' }
  }
  if (values.password.length < 6) {
    errors.password = { type: 'min', message: 'Password must be at least 6 characters' }
  }

  if (Object.keys(errors).length > 0) {
    return { values: {}, errors }   // є помилки
  }
  return { values, errors: {} }     // все добре
}

useForm<TAuthForm>({ resolver: myResolver })   // це працювало б
```

---

## zodResolver

**Функція з пакета `@hookform/resolvers`, яка з Zod-схеми створює resolver для react-hook-form.**

```tsx
import { zodResolver } from '@hookform/resolvers/zod'

useForm<TAuthForm>({ resolver: zodResolver(authSchema) })
```

### Навіщо

Zod і react-hook-form повертають помилки в різних форматах:

```ts
// Zod (safeParse) повертає:
{
  success: false,
  error: {
    issues: [
      { path: ['email'],    message: 'Invalid email' },
      { path: ['password'], message: 'Password must be at least 6 characters' }
    ]
  }
}

// react-hook-form чекає:
{
  values: {},
  errors: {
    email:    { type: '...', message: 'Invalid email' },
    password: { type: '...', message: 'Password must be at least 6 characters' }
  }
}
```

`zodResolver` **перетворює формат відповіді Zod у формат, потрібний react-hook-form**. Додаткової перевірки він не робить, перевіряє тільки Zod.

### Хто його написав

**Команда react-hook-form**, не Zod. Zod нічого не знає про react-hook-form і повертає свій формат для всіх. У пакеті `@hookform/resolvers` є перетворювачі і для інших бібліотек: `yupResolver`, `valibotResolver`, `joiResolver`, `classValidatorResolver` та інші. Для кожної свій, бо кожна повертає помилки по-своєму.

Є і новий спільний стандарт **Standard Schema**, який підтримують Zod, Valibot та інші, і для нього є `standardSchemaResolver`.

### Що всередині (спрощено)

```ts
function zodResolver(schema) {
  // повертає НОВУ функцію - це і є resolver
  return async (values) => {
    const result = schema.safeParse(values)          // 1. Zod перевіряє

    if (result.success) {
      return { values: result.data, errors: {} }     // 2а. все добре
    }

    const errors = {}                                 // 2б. перетворення формату
    for (const issue of result.error.issues) {
      const field = issue.path[0]                     // 'email' або 'password'
      errors[field] = { type: issue.code, message: issue.message }
    }
    return { values: {}, errors }
  }
}
```

Це **функція, що повертає функцію**:
- `zodResolver(authSchema)` викликаєш **ти** → отримуєш функцію-resolver
- саму функцію-resolver викликає **react-hook-form**, коли треба перевірити форму

`resolver` у `useForm` і функція від `zodResolver` це одне й те саме: у налаштування кладеться функція «перевірка Zod + перетворення формату».

---

## Ланцюжок від схеми до помилки на екрані

```
auth.ts
  authSchema = z.object({ email: ..., password: ... })   ← правила
      ↓ імпорт
register.tsx
  zodResolver(authSchema)                   ← робимо з правил функцію-resolver
      ↓
  useForm({ resolver: ... })                ← віддаємо її формі
      ↓ користувач натиснув кнопку
  handleSubmit → resolver(значення)         ← форма викликає resolver
      ↓
  authSchema.safeParse(значення)            ← всередині Zod перевіряє
      ↓
  { errors: { email: { message } } }        ← перетворення у формат форми
      ↓
  <Controller name='email'> бере errors.email → fieldState.error.message → Input
```

## Чому name у Controller = ключ у схемі

```
ключ email у схемі
  → issue.path[0] = 'email'
  → errors.email
  → <Controller name='email'> бере errors.email
```

Назви не збігаються → помилка лежить під одним ключем, а `Controller` шукає під іншим, і на екрані її не видно.