# satisfies

## Що це

`satisfies` це **оператор TypeScript** (з версії 4.9). Не Zod і не React: частина самої мови TS, як `as` чи `typeof`.

```ts
значення satisfies Тип
```

Робить дві речі:
1. **перевіряє**, що значення підходить під тип. Не підходить → червона помилка в редакторі
2. **не змінює** тип значення: TS далі бачить точний тип значення, а не тип справа

Перекладається як «задовольняє»: «перевір, що це задовольняє тип».

## Три способи і різниця

```ts
type Colors = Record<string, string | number[]>

// 1. Без типу: жодної перевірки
const a = { red: '#f00', green: [0, 255, 0] }

// 2. Через `: Тип`: перевірка є, АЛЕ тип змінної стає Colors
const b: Colors = { red: '#f00', green: [0, 255, 0] }
b.red.toUpperCase()   // ❌ TS: red може бути string АБО number[], у масиву нема toUpperCase

// 3. Через satisfies: перевірка є, І тип лишається точним
const c = { red: '#f00', green: [0, 255, 0] } satisfies Colors
c.red.toUpperCase()   // ✅ TS пам'ятає, що red саме string
```

| | Перевірка | Тип змінної |
|---|---|---|
| без типу | нема | точний |
| `: Тип` | є | стає `Тип` (подробиці втрачаються) |
| `satisfies Тип` | є | точний |

Використовують, коли потрібна перевірка, але точний тип втрачати не можна: конфіги, об'єкти з константами, Zod-схеми.

## У проекті: auth.ts

```ts
export const authSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
}) satisfies z.ZodType<RegisterDto>
```

- **зліва**: Zod-схема. Після перевірки вона дає дані `{ email: string; password: string }`
- **справа**: `z.ZodType<RegisterDto>` = «Zod-схема, яка після перевірки дає дані формату `RegisterDto`» (про `ZodType` детально в [../forms/zod.md](../forms/zod.md))

TS порівнює: те, що дає схема, збігається з `RegisterDto`? Так → ок.

Що буде, коли щось зміниться:

| Ситуація | Результат |
|---|---|
| бекенд додав **обов'язкове** поле `name` | ❌ помилка: у схемі нема `name` |
| бекенд додав **необов'язкове** поле `name?` | ✅ без помилки: його можна не надсилати |
| у схемі поле названо `mail` замість `email` | ❌ помилка |
| бекенд змінив тип поля (наприклад, на `number`) | ❌ помилка |

Після помилки: додаєш поле в схему (`name: z.string()`) і інпут у форму.

`RegisterDto` оновлюється, коли перезапускаєш Orval (див. [../api/openapi-swagger-orval.md](../api/openapi-swagger-orval.md)).

### Чому не `: z.ZodType<RegisterDto>`

```ts
export const authSchema: z.ZodType<RegisterDto> = z.object({ ... })
```

Перевірка теж спрацює, але тип `authSchema` стане загальним «якась схема для RegisterDto». TS забуде, що це саме `z.object` з полями `email` і `password`, і перестануть працювати методи, які є тільки в об'єктних схем:

```ts
authSchema.shape.email                    // ❌ з `: Тип`, ✅ з satisfies
authSchema.extend({ name: z.string() })   // ❌ з `: Тип`, ✅ з satisfies
authSchema.pick({ email: true })          // ❌ з `: Тип`, ✅ з satisfies
```

`.extend`, `.pick` потрібні, щоб зробити з схеми нову (наприклад, схему логіну з частини полів).

## Дві різні перевірки в auth.ts

| | `satisfies z.ZodType<RegisterDto>` | `authSchema` (Zod) |
|---|---|---|
| Що перевіряє | саму схему: чи її поля збігаються з DTO | дані, які ввів користувач |
| Коли | під час написання коду (червоне підкреслення) | коли застосунок працює (натиснули кнопку) |
| Хто | TypeScript | Zod |