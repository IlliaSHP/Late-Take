import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'

import { colors, radius, space } from '@app/tokens'

import type { TitleListItemResponse } from '@app/api'

import { CARD_CONFIG } from './config'

interface Props {
  title: TitleListItemResponse
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function TitleCard({ title, onPress }: Props) {
  const config = CARD_CONFIG[title.type]

  /*
  useSharedValue — хук для зберігання значення, яке відразу доступне в обох
  потоках (thread) — JS і UI — без мосту між ними. JS-потік лише зрідка
  записує нове цільове значення (наприклад, по натисканню), а UI-потік
  читає його щокадру, щоб намалювати поточний стан.
  
  Це потрібно, щоб Reanimated міг працювати з цим значенням прямо на UI-потоці:
  якщо тримати і логіку, і анімацію в одному (JS) потоці, все сповільнюється —
  анімації тормозять, а сама логіка теж виконується довше, бо змагається за той
  самий потік.
  
  Звичайні захоплені (closure) значення при перенесенні коду на інший потік
  копіюються одноразово, як знімок на момент створення — тому вони "застигають"
  і самі не оновлюються. useSharedValue навмисно зроблений інакше: значення не
  копіюється одноразово, а живе в пам'яті, видимій з обох потоків одразу, —
  тому завжди актуальне на обох, без потреби в новому знімку щоразу.
  
  Перший (JS) потік і так завжди спілкується з другим (UI) потоком — щось же має
  малювати екран, і цей UI-потік відповідає за відмалювання завжди, на будь-якому
  пристрої. Зазвичай дані передаються через міст (bridge), а це не супершвидко.
  Тому Reanimated замість цього запускає свої скрипти (воркліти — ті самі звичайні
  js-скрипти, просто виконуються на UI-потоці) прямо там: розгортає туди маленьку
  копію JS-двигуна й виконує вже готовий код воркліта (Babel лише позначає й готує
  цей код одноразово під час збірки застосунку — на телефоні в рантаймі Babel не
  бере участі). Завдяки цьому логіка анімації рахується там же, де й має врешті
  застосуватись, а не в JS-потоці з подальшою витратою часу й ресурсів на передачу
  результату через міст.
  
  UI-потік — не щось специфічне для анімацій, а взагалі відповідає за
  відмалювання всього інтерфейсу самого застосунку (не всього пристрою — у
  кожного застосунку свій власний UI-потік). Такий поділ на "потік логіки" й
  "потік відмальовування" — загальний архітектурний принцип, який є і в
  нативній Android/iOS-розробці, і в геймдеві, і в десктопних GUI-фреймворках.
  */
  const scale = useSharedValue(1)

  const animated = useAnimatedStyle(() => ({
    /*transform: [{ scale: scale.value }]*/
    transform: [{ scale: scale.get() }]
  }))

  // const handlePressIn = () => {
  //   scale.value = withSpring(0.95)
  // }
  const handlePressIn = () => {
    scale.set(withSpring(0.95))
  }
  const handlePressOut = () => {
    scale.set(withSpring(1))
  }

  return (
    <View
      style={{
        width: config.width,
        height: config.height
      }}
    >
      {config.stacked && (
        <>
          <View
            style={[
              styles.stack,
              {
                borderRadius: config.radius,
                top: -6,
                left: 8,
                right: 8,
                opacity: 0.25
              }
            ]}
          />
          <View
            style={[
              styles.stack,
              {
                borderRadius: config.radius,
                top: -3,
                left: 4,
                right: 4,
                opacity: 0.45
              }
            ]}
          />
        </>
      )}
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          animated,
          styles.card,
          {
            borderRadius: config.radius,
            borderWidth: config.glow ? 1 : 0,
            bordeColor: config.glow ?? 'transparent'
          }
        ]}
      >
        <Image
          source={title.coverUrl}
          style={StyleSheet.absoluteFill}
          contentFit='cover'
          transition={200}
        />

        {config.spine && (
          <>
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.65)',
                'rgba(255,255,255,0.12)',
                'transparent'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.spine}
            />
            <View style={styles.pages} />
          </>
        )}

        <View style={styles.badge}>
          {isGlassEffectAPIAvailable() ? (
            <GlassView
              style={styles.glass}
              glassEffectStyle='clear'
            >
              <config.icon
                size={13}
                color={colors.text.primary}
                strokeWidth={2.2}
              />
            </GlassView>
          ) : (
            <View style={[styles.glass, styles.fallback]}>
              <config.icon
                size={13}
                color={colors.text.primary}
                strokeWidth={2.2}
              />
            </View>
          )}
        </View>
      </AnimatedPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.bg.card
  },
  stack: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10
  },
  pages: {
    position: 'absolute',
    right: 0,
    top: 4,
    bottom: 4,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)'
  },
  badge: {
    position: 'absolute',
    left: space[2],
    bottom: space[2]
  },
  glass: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    overflow: 'hidden'
  },
  fallback: { backgroundColor: 'rgba(0,0,0,0.45)' }
})
