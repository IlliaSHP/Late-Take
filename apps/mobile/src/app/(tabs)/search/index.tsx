import { Stack } from 'expo-router'
import { Platform, ScrollView, Text } from 'react-native'

import { colors } from '@app/tokens'

const androidSearchProps = Platform.select({
  android: {
    textColor: colors.primary,
    headerIconColor: colors.primary,
    hintTextColor: colors.primary,
    shouldShowHintSearchIcon: false
  },
  default: {}
})

export default function Search() {
  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar
        placement='automatic'
        placeholder='search...'
        onChangeText={() => {}}
        {...androidSearchProps}
      ></Stack.SearchBar>
      <ScrollView>
        <Text style={
          Platform.OS === 'android'
            ? { color: colors.primary }
            : null
          }
        >
          Items
        </Text>
      </ScrollView>
    </>
  )
}
