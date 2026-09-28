# Zod

## Що це і навіщо

**Zod** це бібліотека (`zod`) для **перевірки даних, коли застосунок уже працює** (у рантаймі). Працює і на фронті, і на беку, бо це звичайний JS.

Навіщо: TypeScript перевіряє тільки **код під час написання** і після компіляції зникає. Що ввів користувач в інпут, TS перевірити не може: для нього `'abc'` це просто `string`, як і правильний email. Це перевіряє Zod.

Без Zod ту саму перевірку пишуть вручну:

```ts
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email'
if (password.length < 6) errors.password = 'Password must be at least 6 characters'
```

З Zod правила описуються декларативно, а тип даних можна отримати з них автоматично.

Схожі бібліотеки: Yup, Valibot, ArkType. Синтаксис різний, ідея та сама.

---

## Схема

**Схема в Zod це об'єкт (значення), який містить правила і вміє перевіряти ними дані.**

Схеми **створюють функції Zod**:

```ts
z.email                    // функція (створює схему)
z.email('Invalid email')   // виклик функції → повертає СХЕМУ
```

Перевірити, що схема це об'єкт:

```ts
const s = z.email()
console.log(typeof s)   // 'object'
```

У цього об'єкта є методи: `parse`, `safeParse`, `min`, `optional` та інші.

Тому правильні назви:
- `z.email`, `z.string`, `z.object` це **функції, що створюють схему**
- те, що вони повертають, це **схема**
- `.min(6)` це **метод схеми**, який повертає **нову** схему з додатковим правилом

```ts
z.string().min(6, '...')
// z.string()  → схема «рядок»
// .min(6)     → нова схема «рядок, мінімум 6 символів»
```

## z

`z` це об'єкт, який експортує пакет `zod`. У ньому лежать усі функції (`z.object`, `z.string`...) і типи (`z.ZodType`, `z.infer`...).

```ts
import { z } from 'zod'
```

## Основні функції

```ts
z.string()                 // рядок
z.number()                 // число
z.boolean()                // true/false
z.email()                  // рядок у форматі щось@щось.щось
z.array(z.string())        // масив рядків
z.object({ ... })          // об'єкт з полями (нижче)

z.string().min(6)          // мінімум 6 символів
z.string().max(100)        // максимум 100
z.string().optional()      // поле необов'язкове: string | undefined
```

У Zod 4 email пишеться `z.email()`. У старих туторіалах (Zod 3) буде `z.string().email()`, це те саме.

## Текст помилки

Текст помилки це **необов'язковий** аргумент. Без нього Zod показує стандартну помилку англійською.

```ts
z.email()                                // стандартна помилка
z.email('Invalid email')                 // свій текст

z.string().min(6)                        // 6 - мінімум, помилка стандартна
z.string().min(6, 'Password too short')  // 1-й аргумент: число, 2-й: текст помилки
```

У кожної функції свої параметри: `min` першим приймає число, тому текст іде другим. `z.email` числа не потребує, тому текст перший.

---

## z.object

`z.object` приймає **звичайний JS-об'єкт** і створює з нього схему для об'єкта:

```ts
const authSchema = z.object({
  email:    z.email('Invalid email'),     // ключ = назва поля | значення = схема цього поля
  password: z.string().min(6, '...')      // ключ = назва поля | значення = схема цього поля
})
```

- **ключі** це **назви полів** у даних, які будуть перевірятись. Ключ схемою не є
- **значення ключів** це маленькі схеми, кожна для свого поля
- **результат `z.object(...)`** це велика схема, зібрана з маленьких

Під час перевірки Zod іде по ключах: ключ `email` → бере `data.email` → перевіряє схемою з цього ключа. Потім `password`.

**Важливо:** рядок `email: z.email(...)` **нічого не перевіряє** в момент виконання. Він створює правило і кладе його в ключ. Перевірка відбувається пізніше, коли в схему передадуть дані (`parse`/`safeParse`).

Ключі мають збігатися з `name` полів форми (`<Controller name='email' />`), бо помилки повертаються за ключами схеми (див. [resolver.md](resolver.md)).

---

## parse і safeParse

Це **методи кожної схеми**. Приймають будь-які дані і перевіряють їх правилами схеми.

### parse

```ts
authSchema.parse({ email: 'illia@gmail.com', password: '123456' })
// ✅ повертає ці самі дані

authSchema.parse({ email: 'abc', password: '123' })
// ❌ кидає помилку ZodError. Виконання зупиняється, код нижче не виконається
```

«Кидає помилку» = те саме, що `throw new Error()`. Щоб програма не впала, ловлять через `try/catch`:

```ts
try {
  authSchema.parse(data)
} catch (error) {
  console.log(error)   // ZodError з описом проблем
}
```

### safeParse

Те саме, але помилку **не кидає**, а повертає об'єкт з результатом:

```ts
authSchema.safeParse({ email: 'abc', password: '123' })
// {
//   success: false,
//   error: {
//     issues: [
//       { path: ['email'],    message: 'Invalid email' },
//       { path: ['password'], message: 'Password must be at least 6 characters' }
//     ]
//   }
// }

authSchema.safeParse({ email: 'illia@gmail.com', password: '123456' })
// { success: true, data: { email: 'illia@gmail.com', password: '123456' } }
```

- `success`: чи пройшла перевірка
- `data`: перевірені дані (тільки при успіху)
- `error.issues`: масив проблем; у кожної `path` (яке поле) і `message` (текст помилки)

Коли що:
- `parse`: погані дані це аварія, треба зупинитись
- `safeParse`: погані дані це нормальна ситуація (форма), треба просто дізнатись, що не так

У формі ти їх сам не викликаєш: `zodResolver` викликає `safeParse` всередині (див. [resolver.md](resolver.md)).

Слово `parse` («розібрати») зустрічається і поза Zod: `JSON.parse('{"a":1}')` розбирає рядок в об'єкт. У Valibot `v.parse(schema, data)`, у Yup замість нього `.validate()`. У Zod `parse` означає: розібрати невідомі дані і отримати гарантовано правильні.

---

## z.infer

**Утиліта-тип Zod: читає правила схеми і вираховує TS-тип даних, які схема перевіряє.**

```ts
export type TAuthForm = z.infer<typeof authSchema>
// { email: string; password: string }
```

- `z.email()` → `string`
- `z.string()` → `string`
- `.optional()` → `| undefined`

`typeof` потрібен, бо в `< >` можна передати тільки тип, а `authSchema` це змінна (див. [../javascript-typescript/generics-and-record.md](../javascript-typescript/generics-and-record.md)).

Правила на кшталт `.min(6)` в тип **не потрапляють**: TS не вміє описати «рядок мінімум 6 символів», тільки «рядок». Довжину перевіряє лише Zod у рантаймі.

Навіщо: правила пишуться один раз, тип береться з них, а не пишеться вдруге руками.

---

## Типи схем і z.ZodType

### Кожна схема має свій TS-тип

Як у будь-якого значення в TS, у схеми є тип. Наведи курсор на змінну в редакторі, і побачиш його:

```ts
const a = z.string()        // тип: ZodString
const b = z.email()         // тип: ZodEmail
const c = z.object({ ... }) // тип: ZodObject<{ email: ZodEmail; password: ZodString }>
```

`ZodString`, `ZodEmail`, `ZodObject` це окремі типи з Zod, кожен для свого виду схем.

### ZodType це загальний тип для будь-якої схеми

`z.ZodType` це **тип** (не функція і не об'єкт з типами всередині). Під нього підходить будь-яка Zod-схема. Його пишуть тільки там, де пишуть типи: після `:`, після `satisfies`, у `< >`.

Дженерик уточнює, **які дані дає схема після перевірки**:

```ts
z.ZodType<string>                             // будь-яка схема, що дає string
z.ZodType<{ email: string; password: string }> // будь-яка схема, що дає такий об'єкт
```

### Навіщо він потрібен: приклад

Функція, яка приймає **будь-яку** схему, що перевіряє рядок:

```ts
function check(schema: z.ZodType<string>, value: unknown) {
  return schema.parse(value)
}

check(z.string(), 'abc')   // ✅ z.string() дає string
check(z.email(), 'abc')    // ✅ z.email() теж дає string
check(z.number(), 5)       // ❌ z.number() дає number, а не string
```

Параметр `schema` не прив'язаний до конкретного виду схеми (`ZodString` чи `ZodEmail`), важливо тільки, що вона дає `string`. Саме для цього і є `ZodType`.

### У проекті

```ts
satisfies z.ZodType<RegisterDto>
```

= «перевір, що `authSchema` це Zod-схема, яка дає дані формату `RegisterDto`». Детально в [../javascript-typescript/satisfies.md](../javascript-typescript/satisfies.md).

---

## Zod-схема проти DTO

- **DTO** відповідає на питання «які поля і якого типу». Це тип: нічого не перевіряє, після компіляції зникає
- **Zod-схема** відповідає на питання «чи правильно заповнені дані». Це значення: існує в рантаймі, реально перевіряє дані, і правил у ній більше, ніж у типі (формат email, мінімум символів)

З Zod-схеми можна отримати тип (`z.infer`), і цей тип має ту саму форму, що й DTO.

Детально про DTO: [../api/schemas-and-dto.md](../api/schemas-and-dto.md).