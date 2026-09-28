import { colors, fontSize, radius, space } from "@app/tokens";
import { StyleSheet, Text } from "react-native";
import { TextInput, View, type TextInputProps } from "react-native";

interface Props extends TextInputProps {
  error?: string
}

export function Input({ error, ...props }: Props) {
  return (
    <View style={styles.root}>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        placeholderTextColor={colors.text.muted}
        {...props}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space[2] },
  input: {
    height: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.bg.card,
    color: colors.text.primary,
    fontSize: fontSize.base
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.status.error
  },
  error: {
    color: colors.status.error,
    fontSize: fontSize.sm,
    paddingHorizontal: space[2]
  }
})