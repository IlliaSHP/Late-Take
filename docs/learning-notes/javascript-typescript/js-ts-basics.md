# JavaScript / TypeScript: база

> **Коротко.** Expression дає значення, statement — команда; у JSX всередині `{}` можна писати лише expression. Однакові дужки мають різний сенс у різному контексті. Object destructuring працює за назвами, array — за позиціями. Функція — теж значення, тому в неї можуть бути властивості (на цьому побудовані compound components).

---

## 1. Expression vs statement

**Expression** обчислюється в значення: `5 + 10`, `user.name`, `[styles.root, styles.view]`, `isActive ? 'on' : 'off'`.

**Statement** — команда програмі: `return`, `if`, `for`, `const x = ...`.

У JSX всередині `{}` можна писати тільки expression:

```tsx
style={styles.root}          // ок
style={return styles.root}   // помилка: return — statement

{isOpen ? <Menu /> : null}   // ок: тернарний оператор — expression
{if (isOpen) <Menu />}       // помилка: if — statement
```

Тому в JSX умови пишуть через `? :` або `&&`, а не через `if`.

---

## 2. Круглі дужки `()`

- Групування: `2 * (3 + 4)`.
- Виклик функції: `hello()`.
- Параметри функції: `function hello(name) {}`.
- Обгортка багаторядкового JSX у `return`.

Навіщо дужки в `return (...)`: JavaScript автоматично ставить `;` у кінці рядка з `return`, якщо одразу після нього перенос. Без дужок:

```tsx
return
  <View />
// JS читає як: return;  → функція повертає undefined
```

З дужками вираз починається на тому ж рядку, що й `return`, і все працює:

```tsx
return (
  <View />
)
```

Самі дужки нічого не повертають — повертає `return`. Дужки лише тримають багаторядковий вираз разом.

---

## 3. Квадратні дужки `[]`

- Масив: `const values = [1, 2, 3]`.
- Array destructuring: `const [first, second] = values`.
- Доступ до властивості через змінну: `object[key]`. Якщо `key = 'top'`, це те саме, що `object.top`.

---

## 4. Фігурні дужки `{}`

- Об'єкт: `const user = { name: 'Illia' }`.
- Object destructuring: `const { name } = user`.
- Блок коду: `if (condition) { ... }`.
- Вираз у JSX: `<Text>{name}</Text>`.

Подвійні `{{ }}` у JSX — не окремий синтаксис. Зовнішні дужки означають "тут JS-вираз", внутрішні — це об'єкт: `style={{ paddingTop: 10 }}`.

---

## 5. Destructuring

### Object — за назвами

```js
const params = { type: 'movie', id: '123' }

const { id, type } = params   // порядок не важливий
const { type, id } = params   // те саме
const { aaa } = params        // undefined — такої властивості немає
```

Перейменування:

```js
const { id: itemId, type: mediaType } = params
```

### Array — за позиціями

```js
const values = ['movie', '123']

const [first, second] = values    // first = 'movie', second = '123'
const [banana, potato] = values   // те саме, назви довільні
```

Саме тому `useState` повертає масив: у `const [count, setCount] = useState(0)` назви обираєш сам.

### Props

```tsx
function Screen({ children, edges = ['top'] }: Props) { ... }
```

- React викликає компонент з одним аргументом — об'єктом props `{ children, edges }`.
- `{ children, edges }` — цей об'єкт одразу деструктурується.
- `edges = ['top']` — значення за замовчуванням, якщо `edges` не передали (`undefined`).
- `: Props` — тип усього об'єкта props.

---

## 6. Функція — теж значення

Значення в JS — це не лише `10`, `'hello'`, `true`, `{}`, `[]`, а й функції. Функцію можна записати в змінну, передати аргументом, покласти у властивість об'єкта:

```js
const fn = hello
run(hello)
obj.fn = hello
```

Водночас функція — об'єкт, тому в неї самої можуть бути властивості:

```js
function hello() {}
hello.version = 1
```

---

## 7. Compound components

На цьому побудовано API на кшталт `NativeTabs.Trigger.Icon`: компоненти записані як властивості інших компонентів.

```js
function NativeTabs() {}
function Trigger() {}
function Icon() {}

NativeTabs.Trigger = Trigger
Trigger.Icon = Icon
```

`<NativeTabs.Trigger.Icon />` означає: взяти властивість `Trigger` у `NativeTabs`, у неї — властивість `Icon`, і відрендерити компонент, що там лежить. Крапка нічого не викликає, лише читає властивість.

Навіщо так роблять: одним імпортом отримуєш усю групу пов'язаних компонентів, і з назви видно, що `Icon` належить саме до `Trigger`.

---

## 8. Чому компоненти з великої літери

JSX розрізняє теги за регістром:

- `<Screen />` — це змінна `Screen`, тобто твій компонент.
- `<screen />` — вбудований тег-рядок `'screen'`.

На web lowercase-теги — це HTML (`div`, `p`). У RN вбудованих тегів немає, тому `<view>` просто дасть помилку.

Звичайні функції пишуть з маленької літери (`calculatePrice`), компоненти — PascalCase (`Screen`).

---

## 9. API

API (Application Programming Interface) — набір публічних функцій, компонентів і правил, через які твій код працює з бібліотекою чи сервісом.

HTTP API (запити до сервера) — лише один різновид. `useState`, `router.push()`, `useLocalSearchParams()`, `<Stack />`, `<Link />` — теж API: API React, API Expo Router.

---

## 10. Imports

```tsx
import { View } from 'react-native'
```

Означає: "візьми export `View` з модуля `react-native` і дай йому в цьому файлі ім'я `View`".

`View`, `Stack`, `useRouter` — не ключові слова JavaScript (як `const`, `if`, `return`). Мова про них нічого не знає, тому їх треба імпортувати або оголосити самому.

Види імпортів:

```tsx
import { View, Text } from 'react-native'   // named: назва має збігатися з export
import Screen from './Screen'                // default: назву обираєш сам
import type { Props } from './types'         // лише тип, зникає після компіляції
```

Різні бібліотеки можуть експортувати однакову назву (наприклад, `Button`). Конфлікт вирішують перейменуванням:

```tsx
import { Button as RNButton } from 'react-native'
```

---

## 11. TypeScript: type inference

TypeScript часто сам виводить тип зі значення:

```ts
const age = 20   // TS уже знає: number
```

Писати `const age: number = 20` не потрібно. Явні типи корисні там, де ти задаєш **контракт** — що функція приймає і повертає, які props у компонента:

```ts
function getUser(id: string): User { ... }

interface Props {
  title: string
}
```

---

## 12. `as const`

```ts
// без as const
const durations = { fast: 150, normal: 250, slow: 400 }
// тип: { fast: number; normal: number; slow: number }

// з as const
const durations = { fast: 150, normal: 250, slow: 400 } as const
// тип: { readonly fast: 150; readonly normal: 250; readonly slow: 400 }
```

`as const` робить значення readonly і зберігає точні літерали замість загального `number`.

Практична користь — з такого об'єкта можна отримати union-тип:

```ts
type Duration = (typeof durations)[keyof typeof durations]
// 150 | 250 | 400
```

Так значення і тип задаються в одному місці й не розходяться.

---

## 13. Назви типів: `TButtonVariant`

```ts
export type TButtonVariant = 'primary' | 'secondary'
export type TButtonSize = 'small' | 'medium' | 'large'
```

Префікс `T` (від Type) — convention, не вимога TypeScript. Можна писати `ButtonVariant`. Головне — один стиль у всьому проєкті.

Назва в однині, бо тип описує одне значення (`size = 'small'`). Множина — для колекцій: `const buttonVariants = { ... }`.