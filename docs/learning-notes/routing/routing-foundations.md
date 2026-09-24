# Routing: основи

> **Коротко.** Route — адреса екрана. Router знає, які routes існують і який екран показати. Navigator (Stack, Tabs) визначає, як екрани однієї гілки поводяться між собою. Layout — спільний батько для гілки routes.

Цей файл — про загальну логіку, не прив'язану до конкретної бібліотеки. Як це зроблено саме в Expo Router — у [expo-router.md](./expo-router.md).

---

## 1. Route, routing, navigation

- **Route** — адреса, якій відповідає екран: `/library`, `/profile`, `/title/movie/123`.
- **Routing** — логіка зіставлення: за route визначити, який екран показати.
- **Navigation** — сам перехід між routes: Library → Movie → Actor.

Route і посилання — різні речі. Route існує, навіть якщо на нього немає жодної кнопки. `<Link>` чи `router.push()` лише запускають перехід.

---

## 2. Static і dynamic routes

**Static route** — усі сегменти відомі наперед: `/profile`, `/settings/account`.

**Dynamic route** містить змінний сегмент. В Expo Router його позначають квадратними дужками в назві файлу:

```text
app/title/[type]/[id].tsx
```

Такий файл обробляє будь-який URL вигляду `/title/<щось>/<щось>`. Для `/title/movie/123` router створить params:

```ts
{ type: 'movie', id: '123' }
```

Дужки нічого не "витягують" самі. Вони кажуть router-у: на цьому місці буде змінне значення, збережи його під цим ім'ям. Назва довільна: файл `[banana]/[potato].tsx` дав би `{ banana: 'movie', potato: '123' }`.

В інших router-ах та сама ідея записується інакше, наприклад `/title/:type/:id` (React Router, Express). Це інша нотація тієї самої ідеї, а не синтаксис Expo Router.

---

## 3. File-based routing

File-based routing — підхід, у якому router будує список routes зі структури файлів:

```text
app/
├── index.tsx            → /
├── library.tsx          → /library
└── title/
    └── [type]/
        └── [id].tsx     → /title/movie/123
```

Це можливість конкретного framework-а, а не JavaScript і не Node.js. Node.js — лише середовище виконання JS, routing він сам не робить. Порівняй: Next.js і Expo Router будують routes з файлів, а Express (теж працює на Node.js) описує routes кодом — `app.get('/library', handler)`. Так само база даних не створює routes: routing належить рівню застосунку / framework-а.

Спеціальні назви файлів у кожного framework-а свої: `index.tsx`, `page.tsx`, `_layout.tsx`, `[slug].tsx` тощо.

### Папка — ще не сторінка

Папка задає сегмент шляху, але екран з'являється тільки там, де є route-файл. Якщо є лише `title/[type]/[id].tsx`, то `/title/movie/123` працює, а `/title` — ні.

Щоб з'явився `/title`, потрібен `title/index.tsx`. Для `/title/movie` — `title/[type]/index.tsx`.

---

## 4. Navigator

`Stack`, `Tabs`, `Drawer` — navigator-и.

Список routes router уже отримав із файлів. Navigator вирішує, **як екрани певної гілки пов'язані між собою**:

- тримає navigation state — що відкрито зараз і що було до того;
- дає поведінку — Back, жести, анімації переходів;
- дає UI — header, tab bar.

Router знає, **які** routes існують. Navigator визначає, **як** вони поводяться.

---

## 5. Stack

Stack працює як стопка (LIFO — last in, first out): новий екран кладеться зверху, Back знімає верхній.

```text
Home → Movie → Actor     state: [Home, Movie, Actor], активний Actor
Back                     state: [Home, Movie]
Back                     state: [Home]
```

Це природна модель для "зайшов глибше — повернувся тим самим шляхом".

Основні дії:

- **`push`** — завжди кладе новий екран зверху, навіть якщо такий уже є в стопці. `A → push B → push A → push B` дасть стопку `[A, B, A, B]`, і Back пройде її у зворотному порядку.
- **`replace`** — замінює верхній екран, стопка не росте. Типовий випадок — після логіну замінити екран входу, щоб Back на нього не повертав.
- **`back`** — знімає верхній екран.

Крім історії, Stack відповідає за native header (title, кнопки, search bar), жести "назад", анімації переходу й режими показу (звичайний екран, modal). Тому налаштування header — це API саме Stack-а:

```tsx
<Stack.Screen name="details" options={{ headerShown: false }} />
```

---

## 6. Tabs

Tabs моделюють не "зайшов глибше", а **кілька рівноправних основних секцій**: Home, Library, Search, Profile. Navigator тримає список секцій і те, яка з них зараз активна. Секції не лежать одна на одній.

Звідси різниця зі Stack:

- Повторний тап по активній вкладці не створює новий екран. Десять тапів по Search — це все одно одна секція Search, а не десять записів в історії.
- Tabs теж можуть мати історію (Back повертає на попередню вкладку), але це історія **вибраних вкладок**, а не стопка окремих екранів. Як саме працює Back, залежить від налаштувань navigator-а і платформи.

Tabs також мають свій UI: tab bar, іконки, підписи, badge, кольори активної вкладки.

### Чому не зробити весь застосунок на Tabs

Бо це різні UX-моделі. Home / Library / Search / Profile — гарні вкладки. Movie 123, Actor 51, Edit Profile — ні: це екрани, у які заходять, дивляться і повертаються назад.

Основні секції — Tabs. Деталі й вкладені екрани — Stack.

---

## 7. Вкладена навігація

Navigator-и вкладаються один в одного. Кожна вкладка може містити власний Stack:

```text
Tabs
├── Home
├── Library
│   └── Stack
│       ├── Library (список)
│       └── Library Item (/library/123)
└── Profile
```

Tab navigator керує лише своїми вкладками. `library/[id].tsx` не стає окремою вкладкою — ним керує Stack усередині Library.

Однакові назви файлів у різних гілках не конфліктують: `library/details.tsx` і `search/details.tsx` — це різні routes `/library/details` і `/search/details`.

Типова схема застосунку:

```text
Root Stack
├── Tabs
│   ├── Home
│   ├── Library
│   ├── Search
│   │   └── Search Stack
│   └── Profile
└── Title Details
```

Кожен navigator керує своїм рівнем: Root Stack — переходом між Tabs і Title Details, Tabs — перемиканням секцій, Search Stack — екранами всередині Search.

Дочірній navigator не замінює батьківський. Коли ти всередині Search, Tabs і Root Stack продовжують існувати — саме тому tab bar не зникає.

---

## 8. Layout і Slot

**Layout** — спільний батьківський компонент для гілки routes. Він визначає, чим ця гілка обгорнута і як вона навігаційно поводиться.

У layout зазвичай кладуть:

- navigator (Stack / Tabs / Drawer);
- providers (theme, auth, safe area);
- спільний header / footer;
- завантаження шрифтів, splash screen.

Layout не обов'язково глобальний. Root layout діє на весь застосунок, вкладений — лише на свою гілку (наприклад, тільки на вкладки або тільки на Search). Тож layout — це не "глобальні налаштування", а "спільне для цієї гілки".

Layout не обов'язково містить navigator. Можна просто показати поточний дочірній route через `Slot`:

```tsx
export default function Layout() {
  return (
    <>
      <Header />
      <Slot />
      <Footer />
    </>
  )
}
```

`Slot` — місце, куди підставляється поточний дочірній екран: на `/profile` там буде Profile, на `/library` — Library. Історії переходів і анімацій `Slot` не дає, бо це не navigator.

---

## 9. Route tree і navigation tree

Це два пов'язані, але різні дерева:

- **Route tree** — які routes існують: `/`, `/library`, `/title/movie/123`. В Expo Router формується з файлів.
- **Navigation tree** — як ці routes організовані navigator-ами (схема Root Stack → Tabs → Search Stack вище). Формується layout-ами.

Повна картина:

```text
Файли
→ router визначає routes
→ layouts задають спільну структуру гілок
→ navigator-и зберігають state і дають поведінку та UI
```

---

## 10. Deep links

Deep link відкриває конкретний екран усередині застосунку ззовні — з браузера, повідомлення, push-нотифікації:

```text
myapp://title/movie/123
```

Застосунок отримує посилання, router знаходить відповідний route і відкриває екран.

В Expo Router кожен route-файл автоматично доступний як deep link, окремо описувати їх не треба. Потрібно лише задати `scheme` у конфігу застосунку (`app.json` / `app.config`). В Expo Go посилання мають вигляд `exp://...`, а в dev client і production-збірці — з твоєю схемою (`myapp://...`).

Не плутай із workspace link у monorepo — див. [packages-aliases-links.md](../monorepo/packages-aliases-links.md).

---

## 11. Router на Web

Router потрібен не лише тому, що на mobile немає адресного рядка. Його загальна задача — зв'язати адресу з UI, і на Web вона та сама: `/library` → компонент Library.

Різниця в тому, хто це робить. У класичному багатосторінковому сайті браузер при переході завантажує новий HTML із сервера. У SPA (React-застосунок) сторінка одна, і router підміняє компоненти за URL без перезавантаження.