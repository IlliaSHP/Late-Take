import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { Image } from 'expo-image'
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

  const scale = useSharedValue(1)
  const glow = useSharedValue(0)
  
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }]
  }))
  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glow.get(),
    boxShadow: [{
      offsetX: 0,
      offsetY: 0,
      blurRadius: glow.get(),
      spreadDistance: 0,
      color: colors.accent[title.type],
      inset: true,
    }]
  }))

  const handlePressIn = () => {
    scale.set(withSpring(0.94, { stiffness: 1300 }))
    glow.set(withSpring(8))
  }
  const handlePressOut = () => {
    scale.set(withSpring(1))
    glow.set(withSpring(0))
    
  }

  return (
    <View
      style={{
        width: 114,
        height: 171
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
            // borderWidth: config.glow ? 1 : 0,
            // borderColor: config.glow ?? 'transparent'
          }
        ]}
      >
        <Image
          source={title.coverUrl}
          style={StyleSheet.absoluteFill}
          contentFit='cover'
          transition={200}
        />
        <Animated.View
          style={[
            // position: 'absolute',
            // inset: 0,
            // ===
            StyleSheet.absoluteFill,
            animatedGlow,
            {
              borderRadius: config.radius,
            }
          ]}
        />

        {/*{config.spine && (
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
        )}*/}

        <View
          style={[
            styles.badge,
          ]}
        >
          {isGlassEffectAPIAvailable() ? (
            <GlassView
              style={styles.glass}
              glassEffectStyle='regular'
            >
              <config.icon
                size={13}
                color={colors.text.primary}
                strokeWidth={2.2}
              />
            </GlassView>
          ) : (
              <View
                style={[
                  styles.glass,
                  // styles.fallback,
                  {
                    backgroundColor: colors.accent[title.type]
                  }
                ]}
              >
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // базове тонке кільце, скрізь однакове
    boxShadow: [
      {
        offsetX: 0, offsetY: 0, blurRadius: 3, spreadDistance: 1,
        color: 'rgba(0, 0, 0, 0.35)',
        inset: true,
      }
    ],
  },
  // fallback: { backgroundColor: 'rgba(0,0,0,0.45)' }
})
