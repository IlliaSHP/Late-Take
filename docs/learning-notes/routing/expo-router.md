# Expo Router

> **Коротко.** Файли в `src/app` — це routes. `_layout.tsx` задає структуру гілки, `index.tsx` — екран за замовчуванням, `(group)` групує без зміни URL, `[param]` — змінний сегмент. Params читаються через `useLocalSearchParams()`, і всі вони — рядки.

Загальні поняття (route, navigator, Stack vs Tabs, layout) — у [routing-foundations.md](./routing-foundations.md). Тут — як це працює саме в Expo Router.

API Expo Router змінюється між версіями Expo SDK, особливо все, що позначене `unstable-`. Звіряйся з документацією своєї версії SDK (розділ 12).

---

## 1. `src/app`

`src/app` — спеціальна папка: усе, що в ній лежить, router вважає routes.

```text
src/
├── app/                     # тільки routes і layouts
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── library.tsx
│   └── title/[type]/[id].tsx
├── components/
├── hooks/
└── utils/
```

Звичайні компоненти, hooks і утиліти тримай поза `src/app`, інакше router спробує зробити з них routes.

---

## 2. Спеціальні назви файлів

| Назва | Що означає | Приклад |
|---|---|---|
| `_layout.tsx` | layout для цієї папки і всього, що нижче | `app/_layout.tsx` — root layout |
| `index.tsx` | екран за замовчуванням для папки, в URL не потрапляє | `app/profile/index.tsx` → `/profile` |
| `(назва)/` | route group: групує файли, в URL не потрапляє | `app/(tabs)/library.tsx` → `/library` |
| `[param].tsx` | dynamic сегмент | `app/title/[type]/[id].tsx` → `/title/movie/123` |
| `[...rest].tsx` | catch-all: будь-яка кількість сегментів | `app/docs/[...path].tsx` → `/docs/a/b/c` |
| `+not-found.tsx` | екран для неіснуючого route | — |

### `_layout.tsx`

Default export цього файлу — компонент-layout для гілки. Layouts вкладаються, а не перезаписують один одного:

```text
app/_layout.tsx                 → Root Stack
app/(tabs)/_layout.tsx          → NativeTabs
app/(tabs)/search/_layout.tsx   → Search Stack
```

У файлі можна писати будь-який TS-код (типи, константи, допоміжні функції) — головне, щоб був default export компонента.

### Route groups

Група потрібна, щоб дати кільком routes спільний `_layout.tsx` (наприклад, для вкладок) без зайвого сегмента в URL: `(tabs)/library.tsx` — це `/library`, а не `/tabs/library`.

---

## 3. Params: `useLocalSearchParams()`

Повертає параметри поточного екрана: і з dynamic сегментів, і з query-рядка.

```tsx
// файл: app/title/[type]/[id].tsx
// URL:  /title/movie/123?from=library
const { type, id, from } = useLocalSearchParams<{
  type: string
  id: string
  from?: string
}>()
// type = 'movie', id = '123', from = 'library'
```

Що важливо:

- **Усі значення — рядки.** `id` тут `'123'`, а не `123`. Якщо API чекає число — `Number(id)`. Для catch-all `[...rest]` значення буде масивом рядків.
- **Hook не читає файли.** Коли компонент рендериться, router уже зіставив URL із шаблоном файлу. Hook просто віддає готовий результат.
- **Це object destructuring**, тому порядок не важливий: `{ id, type }` і `{ type, id }` — одне й те саме (див. [js-ts-basics.md](../javascript-typescript/js-ts-basics.md)).

### `useGlobalSearchParams()`

Схожий hook, але повертає params поточного URL усього застосунку, а не конкретного екрана, і оновлюється при будь-якій навігації — навіть в екранах, які лежать у фоні стопки. Це дає зайві ререндери, тому за замовчуванням бери `useLocalSearchParams`.

---

## 4. `useSegments()` і `usePathname()`

Файл `app/title/[type]/[id].tsx`, URL `/title/movie/123?from=library`:

- `useSegments()` → `['title', '[type]', '[id]']` — сегменти шаблону файлу, а не реальні значення.
- `usePathname()` → `'/title/movie/123'` — реальний шлях, без query.

Ключова різниця: `useSegments` бачить **групи**, а `usePathname` — ні. Для `app/(tabs)/library.tsx`:

- `useSegments()` → `['(tabs)', 'library']`
- `usePathname()` → `'/library'`

Тому `useSegments` використовують, щоб перевірити, в якій частині застосунку користувач, наприклад `segments[0] === '(auth)'`.

---

## 5. Typed routes

Вмикаються в app config (`experiments.typedRoutes: true`). TypeScript тоді знає всі routes застосунку: дає autocomplete у `href` і підсвічує помилку, якщо route не існує.

```tsx
<Link href="/library" />   // ок
<Link href="/libary" />    // помилка типу
```

Для dynamic routes зручно передавати `href` об'єктом — так TypeScript перевіряє і шлях, і params:

```tsx
<Link href={{ pathname: '/title/[type]/[id]', params: { type: 'movie', id: '123' } }} />

router.push({ pathname: '/title/[type]/[id]', params: { type, id } })
```

Typed routes не створюють routes — лише додають перевірку типів і підказки.

---

## 6. Переходи між екранами

Перехід запускають `<Link href>` або методи `router` (з `useRouter()` або імпорту `router` з `expo-router`):

- `router.push(href)` — новий екран зверху стопки;
- `router.replace(href)` — замінити поточний екран;
- `router.back()` — назад.

Router визначає, який екран відповідає `href`. Navigator (Stack / Tabs) визначає, як саме відбудеться перехід.

---

## 7. `Stack`

```tsx
import { Stack } from 'expo-router'

export default function RootLayout() {
  return <Stack />
}
```

Створює native stack navigator для гілки цього layout: стопка екранів, Back, жести, анімації, native header.

Header можна налаштовувати двома способами, їх можна змішувати:

- через options у layout: `<Stack.Screen name="details" options={{ headerShown: false }} />`;
- через компоненти прямо в екрані (з SDK 55): `<Stack.Title>`, `<Stack.SearchBar>`, `<Stack.Header>`.

### `Stack.Title`

```tsx
<Stack.Title>Search</Stack.Title>
```

Не рендерить текст у контенті екрана — задає title в header найближчого Stack. Може стояти прямо в компоненті екрана або всередині `Stack.Screen` у layout. Якщо для одного екрана відрендерено кілька `Stack.Title`, діє останній.

### `Stack.SearchBar`

```tsx
<Stack.SearchBar placeholder="Search" onChangeText={handleChange} />
```

Додає native поле пошуку в header і автоматично вмикає header (`headerShown: true`), бо поле — його частина.

Логіки пошуку в ньому немає. Воно дає тільки UI і callbacks, а що робити з текстом (state, запит до API, фільтрація) — вирішуєш ти. Що саме отримує `onChangeText` (рядок чи event), перевір у документації своєї SDK.

---

## 8. `NativeTabs`

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs'

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="library">...</NativeTabs.Trigger>
    </NativeTabs>
  )
}
```

`NativeTabs` — tab navigator, який використовує системний tab bar Android / iOS. Тому на різних платформах він виглядає по-різному.

`name` у `Trigger` зв'язує вкладку з route цього layout: `name="library"` — це `library.tsx` або ціла папка `library/` з усім її вмістом.

`NativeTabs.Trigger.Icon` — compound component: компонент, записаний як властивість іншого компонента (див. [js-ts-basics.md](../javascript-typescript/js-ts-basics.md)).

### Іконки

- `sf` — Apple SF Symbols (iOS). Можна задати окремо для звичайного і вибраного стану.
- `md` — Material Symbols (Android).

Це API SDK 55+. У SDK 54 іконки й підписи вкладок записувались інакше, тому старі приклади з інтернету можуть не підійти.

### `role="search"`

```tsx
<NativeTabs.Trigger name="search" role="search">
```

Спеціальна роль вкладки пошуку. На iOS дає системну інтеграцію пошуку з tab bar. На Android такої інтеграції немає — поле пошуку живе в header.

---

## 9. Search tab як вкладений Stack

```text
(tabs)/
└── search/
    ├── _layout.tsx    → <Stack />
    └── index.tsx      → екран пошуку
```

```tsx
// search/_layout.tsx
export default function SearchLayout() {
  return <Stack />
}
```

Stack усередині вкладки Search потрібен насамперед заради header: `Stack.Title` і `Stack.SearchBar` працюють тільки там, де є Stack.

Окрема сторінка результатів для цього не потрібна — усе може бути на одному `search/index.tsx`:

```text
SearchBar → onChangeText → state → запит до API → список результатів
```

Для списку результатів використовуй `FlatList`, а не `ScrollView` + `.map()` — див. [react-native-basics.md](../react-native/react-native-basics.md).

Пізніше в цей Stack можна додати дочірні екрани пошуку (наприклад, фільтри), і Back працюватиме всередині вкладки.

---

## 10. Хто чим керує

```text
Root Stack             → Tabs ↔ Title Details
└── NativeTabs         → Home ↔ Library ↔ Search ↔ Profile
    └── Search Stack   → екран пошуку ↔ дочірні екрани пошуку
```

Root Stack не керує напряму `search/index.tsx` — кожен navigator відповідає лише за свій рівень.

---

## 11. Web

Expo Router використовує те саме дерево routes на Web: `src/app/library.tsx` → `https://site.com/library`.

Для різного UI на платформах є platform-specific файли:

```text
_layout.tsx       → mobile: bottom tabs
_layout.web.tsx   → web: sidebar
```

Routes однакові, відрізняється лише обгортка.

---

## 12. Expo SDK і unstable API

Expo SDK — узгоджений набір версій: Expo, React Native, React, Expo Router, native modules. Оновлюються вони разом.

`unstable-` у шляху імпорту (`expo-router/unstable-native-tabs`) означає, що API ще може змінитися між версіями SDK. Тому документацію треба відкривати саме для своєї версії SDK (на docs.expo.dev є перемикач версії), а не latest.