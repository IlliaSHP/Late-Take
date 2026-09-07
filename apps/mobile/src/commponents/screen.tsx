import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, spaces } from '@app/tokens'

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
    paddingHorizontal: spaces[6]
  }
})
