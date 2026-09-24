# React Native: основи

> **Коротко.** Замість HTML — примітиви `View`, `Text`, `Pressable`. Весь текст — тільки в `<Text>`. Стилі — JS-об'єкти, кілька стилів передаються масивом. Довгі списки — через `FlatList`. Контент не повинен залазити під системні панелі — для цього safe area.

---

## 1. Примітиви замість HTML

У RN немає DOM і HTML-тегів (`div`, `p`, `button`). Є власні компоненти, які перетворюються на native-елементи Android / iOS:

- `View` — контейнер. Найближча аналогія — `div`, але це не він.
- `Text` — текст.
- `Pressable` — обробка натискань.
- `ScrollView`, `FlatList` — прокрутка і списки.
- `Image` — зображення.
- `TextInput` — поле вводу.

---

## 2. `Text`

Будь-який текст має бути всередині `<Text>`. Інакше застосунок падає з помилкою *"Text strings must be rendered within a `<Text>` component"*.

```tsx
<View>Hello</View>                // crash
<View><Text>Hello</Text></View>   // ок
```

Найчастіша пастка — умовний рендер через `&&` із числом:

```tsx
{count && <Badge />}       // при count = 0 рендерить 0 поза <Text> → crash
{count > 0 && <Badge />}   // ок
```

`0 && ...` повертає `0`, і React намагається показати його як текст. На web це просто вивело б "0", у RN — помилка.

Семантичних тегів (`p`, `h1`, `span`) немає. Заголовок — це `Text` зі своїм стилем.

---

## 3. `Pressable` vs `Button`

`Button` — готова проста кнопка з мінімумом налаштувань вигляду.

`Pressable` — низькорівнева обгортка для натискань: `onPress`, `onPressIn`, `onPressOut`, `onLongPress`, стан `pressed`, ripple на Android. Вигляд повністю твій, тому власні кнопки будують на `Pressable`:

```tsx
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
>
  <Text>Play</Text>
</Pressable>
```

---

## 4. `ScrollView` vs `FlatList`

`ScrollView` рендерить **увесь** вміст одразу. Підходить для екрана з фіксованою кількістю блоків.

`FlatList` рендерить лише те, що видно на екрані (плюс невеликий запас), і дорендерює при прокрутці. Для списків з API — результатів пошуку, каталогу фільмів — використовуй його:

```tsx
<FlatList
  data={results}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <MovieCard movie={item} />}
/>
```

`ScrollView` + `results.map(...)` на сотнях елементів дасть повільний старт і великий розхід пам'яті.

---

## 5. Стилі

Стилі — JS-об'єкти з camelCase-властивостями: `backgroundColor`, а не `background-color`.

```tsx
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 24,
  },
})
```

Відмінності від CSS:

- **Числа без одиниць.** `24` — це density-independent pixels, не `px`.
- **Немає каскаду й наслідування.** Стиль діє лише на свій елемент. Виняток — `Text` всередині `Text` успадковує стиль батьківського `Text`.
- **`StyleSheet.create` не обов'язковий** — звичайний об'єкт теж працює. Він дає перевірку властивостей і тримає стилі окремо від розмітки.

### Кілька стилів

Передаються масивом. Пізніший стиль перекриває попередній:

```tsx
style={[styles.root, styles.active]}

style={[{ backgroundColor: 'black' }, { backgroundColor: 'red' }]}   // → red
```

Масив може містити `false` / `undefined` — вони ігноруються. Тому зручно писати `[styles.button, isActive && styles.active]`.

Помилка, яку легко зробити:

```tsx
style={(styles.root, styles.view)}
```

Це не два стилі. Круглі дужки з комою — comma operator JavaScript: він обчислює обидва вирази і повертає останній. Результат — лише `styles.view`.

---

## 6. Flexbox у RN

Layout у RN — завжди flexbox, але зі своїми значеннями за замовчуванням:

- `flexDirection: 'column'` — елементи йдуть зверху вниз (на web за замовчуванням `row`).
- Кожен `View` уже flex-контейнер, `display: 'flex'` писати не треба.

`flex: 1` — "займи весь вільний простір уздовж головної осі батька". Якщо у двох сусідів `flex: 1`, вони ділять простір порівну. `flex: 1` і `flex: 2` — у пропорції 1:2.

Типова помилка: у кореневого `View` екрана немає `flex: 1`, і він стискається до розміру свого вмісту.

---

## 7. Safe area

Safe area — частина екрана, не закрита системними елементами: status bar, виріз камери, заокруглені кути, панель жестів / home indicator.

Використовуй бібліотеку `react-native-safe-area-context`. `SafeAreaView` із самого `react-native` застарів і на Android не працює.

### `SafeAreaView`

```tsx
import { SafeAreaView } from 'react-native-safe-area-context'

<SafeAreaView edges={['top']}>...</SafeAreaView>
```

Автоматично додає відступи. `edges` — **сторони** (не кути), з яких потрібен відступ: `top`, `right`, `bottom`, `left`.

У власному компоненті `Screen` тип обмежено до `('top' | 'bottom')[]` — дозволено лише верх і низ.

### `useSafeAreaInsets()`

```tsx
const insets = useSafeAreaInsets()
// { top: 44, right: 0, bottom: 24, left: 0 }
```

Повертає **числа**, а не стилі. Тому `style={insets.top}` не має сенсу — треба вказати, яка властивість отримує число:

```tsx
style={{ paddingTop: insets.top }}
```

Hook зручний, коли відступ потрібен не всьому екрану, а конкретному елементу — наприклад, кнопці, прилиплій до низу.

### `SafeAreaProvider`

Передає safe-area дані всім вкладеним компонентам. Expo Router уже додає його в корінь застосунку, тому вручну в Expo Router-проєкті він зазвичай не потрібен.

Він не застарів — потрібен там, де provider-а ще немає: у застосунку без Expo Router або в окремих кореневих обгортках.

---

## 8. Context і Provider

Provider передає значення всім нащадкам через Context.

- Різні контексти не заважають один одному: компонент може читати і SafeAreaContext, і ThemeContext одночасно.
- Якщо вкладено два provider-и **одного** контексту, нащадок отримує значення найближчого:

```text
ThemeProvider (dark)
└── ThemeProvider (light)
    └── Child   → light
```

---

## 9. Navigation ThemeProvider

`ThemeProvider` з React Navigation (на ньому побудований Expo Router) передає тему **лише navigation-компонентам**: фон navigator-ів, header, tab bar, кольори навігаційного тексту, фон під час переходу між екранами.

Твої `Text` і `View` він не стилізує. Їх стилізуєш сам своїми design tokens:

```tsx
color: colors.text.primary
backgroundColor: colors.bg.base
```

У темному застосунку тема все одно потрібна: без неї navigator має світлий фон за замовчуванням, і між темними екранами під час переходу видно світлі спалахи.

---

## 10. StatusBar

```tsx
import { StatusBar } from 'expo-status-bar'

<StatusBar style="light" />
```

`style` задає колір **вмісту** status bar (годинник, іконки), а не його фону. `light` — світлі іконки, для темного фону.

Без `style` колір визначається автоматично. Явний `light` корисний, коли застосунок завжди темний.

На Android із SDK 54 увімкнено edge-to-edge: застосунок малюється під status bar і навігаційною панеллю, а status bar прозорий. Тому "фон status bar" — це просто фон твого екрана під ним, а контент треба відсувати через safe area.

---

## 11. Native UI vs custom UI

"Native" — використання системних компонентів і поведінки Android / iOS.

- **Плюси:** системні жести, accessibility, клавіатура, анімації переходів, звичний для платформи вигляд, менше власного коду.
- **Мінуси:** менше контролю над виглядом, Android і iOS виглядають по-різному, частина можливостей залежить від версії ОС.

RN не обмежує тебе native-компонентами: можна зібрати свій UI з `View`, `Text`, `TextInput` і зробити його однаковим на обох платформах.

Типовий компроміс у великих застосунках: навігація, жести, системні речі — native; картки, кнопки, design system — власні компоненти.

---

## 12. Код під конкретну платформу

```tsx
import { Platform } from 'react-native'

if (Platform.OS === 'android') { ... }

const padding = Platform.select({ android: 16, ios: 20 })
```

Або окремі файли — bundler сам вибере потрібний:

```text
Component.tsx           # спільний / fallback
Component.android.tsx
Component.ios.tsx
Component.web.tsx
```

Імпортуєш завжди без суфікса: `import Component from './Component'`.