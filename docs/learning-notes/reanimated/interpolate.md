# interpolate (react-native-reanimated)

```tsx
interpolate(value, inputRange, outputRange, extrapolation?)
```

Бере поточне число і перетворює його у значення властивості (ширина, прозорість, зсув тощо).

## Параметри

**1. `value`** — поточне значення, яке передаєш. Наприклад `scrollX.get()`.

**2. `inputRange`** — масив чисел: проміжок, з якого по яке число відбувається інтерполяція.
- Числа йдуть по зростанню.
- Мінімум 2 числа, але можна й більше: `[0, 100, 200]`.

**3. `outputRange`** — масив значень властивості на конкретних числах з `inputRange`.
- Довжина така сама, як у `inputRange`.
- `inputRange[0]` → `outputRange[0]`, `inputRange[1]` → `outputRange[1]` і т.д.
- Між точками значення рахується автоматично.

```tsx
interpolate(scrollX.get(), [0, 100, 200], [6, 18, 6])
// scroll = 0   → 6
// scroll = 50  → 12
// scroll = 100 → 18
// scroll = 200 → 6
```

**4. `extrapolation`** (необов'язковий) — що робити, якщо `value` вийшов за межі `inputRange`.

| Значення | Що робить |
|---|---|
| `Extrapolation.EXTEND` / `'extend'` | Продовжує рахувати далі. **За замовчуванням** |
| `Extrapolation.CLAMP` / `'clamp'` | Зупиняється на крайньому значенні `outputRange` |
| `Extrapolation.IDENTITY` / `'identity'` | Повертає сам `value` |

Приклад: `interpolate(150, [0, 100], [0, 1], ...)`
- `EXTEND` → `1.5`
- `CLAMP` → `1`
- `IDENTITY` → `150`

Можна задати окремо для лівої і правої сторони:

```tsx
{ extrapolateLeft: Extrapolation.CLAMP, extrapolateRight: Extrapolation.EXTEND }
```

## Де використовується

`interpolate` використовують всередині `useAnimatedStyle`, щоб значення обраховувалось на UI-потоці на кожному кадрі, а не в JS-потоці.

```tsx
const animatedStyle = useAnimatedStyle(() => ({
  opacity: interpolate(scrollY.get(), [0, 100], [0, 1], Extrapolation.CLAMP),
}));

<Animated.View style={animatedStyle} />
```

Повертає тільки число. Для кольорів є `interpolateColor`.