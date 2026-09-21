import { NativeTabs } from 'expo-router/unstable-native-tabs'

import { colors } from '@app/tokens'

export default function TabsLayout() {
  return (
    <NativeTabs
      backBehavior='history'
      tintColor={colors.text.primary}
      iconColor={{
        default: colors.text['little-muted'],
        selected: colors.text.primary
      }}
      labelStyle={{
        color: colors.text.primary
      }}
    >
      <NativeTabs.Trigger name='index'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md='home'
        />
        <NativeTabs.Trigger.Label>For You</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='library'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          md='favorite'
        />
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='profile'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.circle', selected: 'person.circle.fill' }}
          md='account_circle'
        />
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name='search'
        role='search'
      >
        <NativeTabs.Trigger.Icon md='search' />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
