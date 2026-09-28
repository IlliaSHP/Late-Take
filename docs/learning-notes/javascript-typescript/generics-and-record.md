# Дженерики, Record, index signature, typeof і keyof у типах

Усе в цьому файлі це частина **TypeScript**. Існує тільки під час написання коду, після компіляції в JS зникає.

---

## Дженерик

**Дженерик це параметр для типу.** Функція приймає значення в круглих дужках `( )`, дженерик приймає **тип** у кутових дужках `< >`.

Головна роль дженерика: **зв'язати типи в різних місцях коду** («тут той самий тип, що й там»), коли сам тип наперед невідомий.

### Що робить `<T>`

`<T>` після назви функції (типу, інтерфейсу) **оголошує** параметр типу з назвою `T`. Сам по собі він нічого не робить, це тільки назва. Працює він там, де `T` використано.

Якщо `T` оголосити і ніде не використати, він нічого не змінює і сенсу не має.

Те, що в функції є дженерик, **не означає**, що функція має тип `T`. `T` це тип, який функція використовує у своїх параметрах, у тому, що повертає, чи в тілі.

### Покроково

```ts
function toArray<T>(value: T): T[] {
  return [value]
}
```

- `<T>`: оголосили параметр типу `T`
- `value: T`: аргумент має тип `T`
- `: T[]`: функція повертає масив з елементів типу `T`

Разом: **який тип передали, масив з такого типу і повернеться.**

Що робить TS при виклику `toArray('a')`:
1. дивиться на аргумент: `'a'` це `string`
2. вирішує: `T = string`
3. підставляє скрізь: `function toArray(value: string): string[]`
4. результат має тип `string[]`

Тип можна не писати: TS **сам вираховує** `T` з аргументу. Можна задати явно, тоді TS перевірить аргумент:

```ts
toArray('a')           // T = string (TS вирахував сам)
toArray<number>(5)     // T = number (задали явно)
toArray<number>('a')   // ❌ 'a' не number
```

### Чому не any

```ts
function toArrayAny(value: any): any[] { return [value] }

const a = toArrayAny('a')   // any[]      → TS більше нічого не знає про вміст
const b = toArray('a')      // string[]   → TS знає, що всередині рядки
```

`any` розриває зв'язок між вхідним і вихідним типом. Дженерик його зберігає.

### Усі варіанти, де використовується T

**1. У параметрі і в поверненні** (зв'язок «що прийшло, те й вийшло»):

```ts
function identity<T>(value: T): T {
  return value
}
identity(5)       // number
identity('hi')    // string
```

**2. У кількох параметрах** (параметри мають бути одного типу):

```ts
function pair<T>(a: T, b: T): T[] {
  return [a, b]
}
pair(1, 2)        // ✅ T = number
pair(1, 'a')      // ❌ 'a' не number
```

**3. Тільки в поверненні.** З аргументів TS вирахувати `T` не може, тому його передають явно. Так зроблено `http` у проекті:

```ts
export const http = async <T>(url: string, init?: RequestInit): Promise<T> => { ... }

http<authMobileRegisterResponse>('/auth/mobile/register', { ... })   // повернеться Promise<authMobileRegisterResponse>
```

Код, згенерований Orval, сам підставляє потрібний тип відповіді.

**4. У тілі функції:**

```ts
function first<T>(items: T[]): T | undefined {
  const result: T | undefined = items[0]   // T у тілі
  return result
}
first([1, 2, 3])   // number | undefined
```

**5. Всередині інших типів:** `T[]`, `Promise<T>`, `T | null`, `{ value: T }`, `Record<string, T>`.

**6. Кілька дженериків:**

```ts
function toPair<K, V>(key: K, value: V): [K, V] {
  return [key, value]
}
toPair('age', 20)   // [string, number]
```

**7. У типах та інтерфейсах.** Тут TS нічого не вираховує, тип передають завжди:

```ts
type Box<T> = { value: T }
interface ApiResponse<T> {
  data: T
  status: number
}

const a: Box<string> = { value: 'hi' }
const b: ApiResponse<string[]> = { data: ['a', 'b'], status: 200 }
```

**8. Значення за замовчуванням:**

```ts
type Box<T = string> = { value: T }
const a: Box = { value: 'hi' }      // T = string за замовчуванням
const b: Box<number> = { value: 5 }
```

**9. Стрілкова функція** (у `.tsx` пишуть `<T,>` з комою, щоб TS не сплутав з JSX-тегом):

```ts
const identity = <T,>(value: T): T => value
```

**10. З обмеженням** `extends`: нижче.

### Обмеження: extends

```ts
function getLength<T extends { length: number }>(value: T) {
  return value.length
}
```

`{ length: number }` це **тип об'єкта, у якого є властивість `length` з типом `number`**.

`T extends { length: number }` означає: `T` може бути **будь-яким** типом, але в нього **обов'язково** має бути властивість `length` типу `number`. Інші властивості можуть бути будь-які.

`length` тут це **властивість** (не метод): у рядків і масивів вона є (`'abc'.length` без дужок). TS перевіряє, чи в переданого значення є така властивість:

```ts
getLength('abc')                    // ✅ у string є length: number
getLength([1, 2])                   // ✅ у масиву є length: number
getLength({ length: 5, name: 'x' }) // ✅ length є, name - просто зайва властивість, це нормально
getLength(5)                        // ❌ у number нема length
getLength({ length: '5' })          // ❌ length є, але це string, а не number
```

**Навіщо extends:** без нього TS не дозволить звернутись до `value.length`, бо в довільного `T` цієї властивості може не бути:

```ts
function getLength<T>(value: T) {
  return value.length   // ❌ TS: у T може не бути length
}
```

**Навіщо тут дженерик, а не просто `value: { length: number }`:** щоб повернути точний тип.

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

const s = longest('abc', 'de')      // s: string   → s.toUpperCase() працює
const arr = longest([1, 2], [3])    // arr: number[]
```

Без дженерика функція повертала б `{ length: number }`, і TS не знав би, що це рядок.

У бекенді проекту так само: `_toListItem<T extends { _count: { titles: number } }>(item: T)` приймає будь-який об'єкт, у якого є `_count.titles`.

### Назва дженерика

Назва довільна: `T`, `TData`, `TValue`. Важлива вона тільки всередині оголошення.

**В оголошенні `< >` завжди створює нову назву**, навіть якщо написати назву існуючого типу:

```ts
type User = { name: string }

function f<User>(value: User) {}
// User тут НЕ твій тип, а новий параметр з назвою User.
// Справжній тип User всередині функції стає невидимим, і TS про це не попередить
```

З вбудованими типами (`string`, `number`) TS покаже помилку «Type parameter name cannot be 'string'». Тому дженерики називають `T`, `TData` і т.д.

TS розрізняє оголошення і використання **за місцем**:

```ts
function toArray<T>(...)   // одразу після назви при створенні функції → оголошення
type Box<T> = ...          // одразу після назви при створенні типу → оголошення

toArray<string>('a')       // при виклику → використання
const x: Box<number>       // там, де вказуєш тип → використання
```

### Дженерики в проекті

Тут дженерик **оголосили автори бібліотеки** (або автор `http.ts`), а ми **підставляємо** свій тип:

| Код | Що підставляємо |
|---|---|
| `useForm<TAuthForm>()` | які поля у форми |
| `z.ZodType<RegisterDto>` | який результат дає схема |
| `z.infer<typeof authSchema>` | з якої схеми витягти тип |
| `http<T>(url)` | тип відповіді запиту (підставляє код Orval) |
| `Promise<string \| null>` | що буде всередині Promise |
| `Control<TAuthForm>`, `ControllerRenderProps<TAuthForm>` | до якої форми належить |
| `Record<string, string>` | тип ключів і тип значень |
| `useState<User \| null>(null)` | тип стану, коли TS не може вирахувати його сам |

---

## typeof у типах

У JS `typeof x` повертає рядок: `'string'`, `'object'`.

**У позиції типу** (після `:`, у `< >`, після `type X =`) `typeof` означає інше: «дай TS-тип цієї змінної».

```ts
const user = { name: 'Illia', age: 20 }
type User = typeof user   // { name: string; age: number }
```

Потрібно, бо в `< >` можна передати **тільки тип**, а не змінну:

```ts
z.infer<authSchema>          // ❌ authSchema це змінна, а не тип
z.infer<typeof authSchema>   // ✅ тип цієї змінної
```

---

## keyof

`keyof Тип` дає **всі ключі типу як union рядків**. Значенням може бути будь-який **один** з цих ключів і нічого іншого:

```ts
type TAuthForm = { email: string; password: string }
type Keys = keyof TAuthForm   // 'email' | 'password'
```

Навіщо: обмежити значення **точним списком ключів типу**, і щоб цей список оновлювався сам. Порівняй три варіанти для пропса `name` у полі форми:

```ts
name: string                 // будь-який рядок: 'emial' теж пройде, опечатку TS не побачить
name: 'email' | 'password'   // тільки ці два, але список треба оновлювати руками
name: keyof TAuthForm        // тільки ключі TAuthForm, і список оновлюється сам
```

Додали в схему поле `name` → `TAuthForm` отримав ключ `name` → `keyof TAuthForm` тепер `'email' | 'password' | 'name'`, нічого міняти не треба.

Типове використання: доступ до поля об'єкта за ключем.

```ts
function getField(form: TAuthForm, key: keyof TAuthForm) {
  return form[key]
}

getField(form, 'email')   // ✅
getField(form, 'phone')   // ❌ такого ключа в TAuthForm нема
```

---

## Record

**`Record` це вбудований тип TypeScript.** Його ніхто не оголошує в проекті, він є завжди, як `string` чи `Array`.

Описує **об'єкт, у якого всі ключі одного типу і всі значення одного типу**:

```ts
Record<ТипКлючів, ТипЗначень>
```

Дженерики його не «розширюють», а **налаштовують**: перший каже, якими можуть бути ключі, другий, якими мають бути значення.

```ts
// ключі - будь-які рядки, значення - числа
const ages: Record<string, number> = {
  illia: 20,
  anna: 22
}

// ключі - будь-які рядки, значення - об'єкти з полем message
const errors: Record<string, { message: string }> = {
  email:    { message: 'Invalid email' },
  password: { message: 'Too short' }
}

errors.email = { message: 'ok' }   // ✅
errors.name  = { text: 'ok' }      // ❌ значення має мати message, а не text
```

### Record з конкретними ключами

Замість `string` можна дати список ключів (union). Тоді TS вимагатиме **всі** ці ключі:

```ts
type Status = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'

const labels: Record<Status, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress'
  // ❌ помилка: забув COMPLETED
}
```

Так зроблено в `packages/constants/src/index.ts`:

```ts
export const STATUS_LABELS: Record<LibraryEntryResponseStatus, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  DROPPED: 'Dropped'
}
```

`LibraryEntryResponseStatus` згенерований Orval з бекенду. Бекенд додасть новий статус → TS покаже, що для нього нема підпису.

### Record обмежує значення?

**Так.** Усі значення мають бути того типу, що в другому дженерику:

```ts
const a: Record<string, string> = {
  name: 'Illia',
  age: 20        // ❌ 20 не string
}
```

Якщо треба кілька типів значень, їх перелічують через `|`:

```ts
const a: Record<string, string | number> = {
  name: 'Illia',
  age: 20        // ✅
}
```

Ключі з конкретним списком теж обмежені: у `Record<Status, string>` не можна додати ключ, якого нема в `Status`.

### Тільки для об'єктів?

`Record` описує тільки **об'єкт** (ключ → значення). Масив чи функцію ним не описують. Але **значеннями** може бути що завгодно:

```ts
// значення - масиви
const genres: Record<string, string[]> = {
  movies: ['Drama', 'Comedy'],
  games: ['RPG', 'Shooter']
}

// значення - функції
const handlers: Record<string, () => void> = {
  save: () => console.log('saved'),
  delete: () => console.log('deleted')
}
handlers.save()
```

---

## Index signature: `{ [key: string]: Тип }`

Інший запис того самого, що `Record<string, Тип>`.

### Спершу JS: новий ключ можна додати присвоєнням

У звичайному JS до вже створеного об'єкта можна додати нову властивість, просто присвоївши їй значення:

```js
const obj = { a: 1 }
obj.b = 2
console.log(obj)   // { a: 1, b: 2 } - ключ b створився і одразу отримав значення
```

### TS за замовчуванням так не дозволяє

Якщо тип описує конкретні ключі, додати новий не можна:

```ts
const user: { name: string } = { name: 'Illia' }
user.age = 20   // ❌ TS: у типу нема властивості age
```

### Index signature дозволяє будь-які ключі

Коли назви ключів **наперед невідомі** (вони приходять з даних), тип каже: «ключ може бути будь-яким рядком, але значення мають бути такого типу»:

```ts
const translations: { [word: string]: string } = {
  hello: 'привіт',
  cat: 'кіт'
}

translations.bird = 'птах'   // ✅ створюється новий ключ bird зі значенням 'птах'
translations.fish = 42       // ❌ ключ будь-який, але значення має бути string
```

### Чому квадратні дужки

Це **не масив**. Синтаксис узято з JS, де квадратні дужки означають доступ до властивості за ключем, який лежить у змінній:

```js
const key = 'hello'
translations[key]   // 'привіт'
```

`[word: string]` у типі означає: «за будь-яким ключем типу `string`». `word` просто назва для читабельності, можна `[key: string]` чи `[x: string]`.

### Де використовується

Тільки в описах типів об'єктів (`type`, `interface`, тип змінної). Потрібен, коли ключі беруться з даних: словники, кеш, об'єкт помилок форми, дані, де ключами є id. Часто зустрічається в типах бібліотек і згенерованому коді.

Ці два записи однакові:

```ts
{ [key: string]: { message: string } }
Record<string, { message: string }>
```

`Record` коротший, тому в своєму коді його використовують частіше.