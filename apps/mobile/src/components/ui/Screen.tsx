import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, space } from '@app/tokens'

interface Props {
  // children: React.ReactNode
  children: ReactNode
  edges?: ('top' | 'bottom')[]
}

export function Screen({ children, edges = ['top'] }: Props) {
  return (
    <SafeAreaView
      style={styles.root}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  )
}

//
// Similar manual implementation, but it overrides existing padding
// instead of adding the safe-area insets to it:
//
// export function Screen({ children, edges = ['top'] }: Props) {
//   const insets = useSafeAreaInsets()

//   return (
//     <View
//       style={[
//         styles.root,
//         edges.map(edge =>
//           edge === 'top'
//           ? { paddingTop: insets.top }
//           : { paddingBottom: insets.bottom }
//         )
//       ]}
//     >
//       {children}
//     </View>
//   )
// }
// //

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
    paddingHorizontal: space[6]
  }
})
