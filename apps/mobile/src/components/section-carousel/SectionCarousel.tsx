import { colors, fontSize, fontWeight, space } from "@app/tokens"
import { ChevronRight } from "lucide-react-native"
import { Pressable, View, Text, ScrollView, StyleSheet } from "react-native"

interface Props {
  title: string,
  onPressArrow?: () => void,
  children: React.ReactNode
}

export default function SectionCarousel({ title, onPressArrow, children }: Props) {
  return (
    <View style={styles.root}>
      <Pressable
        style={styles.header}
        onPress={onPressArrow}
        disabled={!onPressArrow}
      >
        <Text style={styles.title}>{title}</Text>
        {!!onPressArrow && <ChevronRight size={24} color={colors.text.primary} />}
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {children}
      </ScrollView>
      
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space[3], marginTop: space[5] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: space['layout-horizontal'],
    marginBottom: space[2]
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold
  },
  scroll: {paddingHorizontal: space['layout-horizontal'], gap: space[3]}
})