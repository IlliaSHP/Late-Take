// Host і Slider з універсального @expo/ui:
// на iOS рендеряться як SwiftUI-компоненти, на Android — як Jetpack Compose.
//
// SwiftUI — UI-фреймворк Apple (iPhone, iPad, Mac, Watch, TV), мова Swift.
// Jetpack Compose — аналог від Google для Android, мова Kotlin.
// Обидва декларативні, як React: описуєш UI для стану, фреймворк сам оновлює екран.
//
// Варіант тільки для iOS:
//   import { Host, Slider } from '@expo/ui/swift-ui'
//   ...
//   void Haptics.selectionAsync()   // замість playTick()
// JSX і props Slider (value, min, max, step, onValueChange) — ті самі, що нижче.
import { Host, Slider } from '@expo/ui'
// Haptics — тактильний відгук телефона (Taptic Engine на iPhone, вібромотор на Android)
import * as Haptics from 'expo-haptics'
import { Platform, StyleSheet, Text, View } from 'react-native'

import { REVIEW_RATING } from '@app/constants'

import { colors, fontSize, fontWeight, space } from '@app/tokens'

interface Props {
  // Поточний рейтинг; null — користувач ще нічого не вибрав
  value: number | null
  // Передає вибраний рейтинг батьківському компоненту (формі відгуку)
  onChange: (value: number) => void
}

// Короткий тактильний «тік» при зміні рейтингу.
// Режими expo-haptics:
//  - selectionAsync() — легкий тік при зміні вибору (iOS і Android)
//  - impactAsync(стиль) — «удар»: Light, Medium, Heavy, Rigid, Soft
//  - notificationAsync(тип) — сигнал результату: Success, Warning, Error
//  - performAndroidHapticsAsync(тип) — тільки Android, системний haptic-ефект
// На iOS використовуємо selectionAsync.
// На Android — Segment_Frequent_Tick: дуже м'який тік для слайдерів;
// якщо мотор телефона не вміє м'яко вібрувати, система його пропускає.
// Кожен виклик повертає Promise; void — явно позначаємо, що не чекаємо його
function playTick() {
  if (Platform.OS === 'android') {
    void Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Frequent_Tick)
    return
  }

  void Haptics.selectionAsync()
}

export function RatingSlider({ value, onChange }: Props) {
  // Обробник руху бігунка.
  // Slider викликає його щоразу, коли користувач тягне бігунок, і передає нове значення
  const onValueChange = (nextValue: number) => {
    // Нативний слайдер може віддати дробове число — округлюємо до цілого рейтингу
    const rating = Math.round(nextValue)
    if (rating === value) return

    // Тік на кожне нове ціле значення
    playTick()
    // Передаємо новий рейтинг батьку
    onChange(rating)
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.value}>{value ?? '-'}</Text>
        <Text style={styles.max}>/{REVIEW_RATING.max}</Text>
      </View>

      {/* Host — контейнер між UI React Native і нативним UI-фреймворком
          (SwiftUI на iOS, Jetpack Compose на Android).
          Щоб вставити SwiftUI/Compose-компонент у дерево React Native, потрібен цей
          контейнер-міст; будь-який компонент з @expo/ui має лежати всередині Host.
          Висота задана явно, щоб нативний вміст отримав місце в layout */}
      <Host style={styles.host}>
        {/* Slider — нативний повзунок, контрольований через value.
            Поки рейтинг не вибрано (null), бігунок стоїть на мінімумі.
            step={1} — тільки цілі значення від min до max */}
        <Slider
          value={value ?? REVIEW_RATING.min}
          min={REVIEW_RATING.min}
          max={REVIEW_RATING.max}
          step={1}
          onValueChange={onValueChange}
        />
      </Host>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space[4] },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: space[1]
  },
  value: {
    color: colors.text.primary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums']
  },
  max: {
    color: colors.text.muted,
    fontSize: fontSize.lg
  },
  host: {
    height: 44
  }
})