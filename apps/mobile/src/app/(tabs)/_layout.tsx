import { NativeTabs } from 'expo-router/unstable-native-tabs'

import { colors } from '@app/tokens'

export default function TabsLayout() {
  return (
    <NativeTabs
      minimizeBehavior='onScrollDown'
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
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

/*<Tabs
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.text['little-muted'],
    tabBarStyle: {
      backgroundColor: colors.bg.base,
      borderTopColor: colors.border
    }
  }}
>
  <Tabs.Screen
    name='index'
    options={{
      title: 'Home',
      tabBarIcon: ({ color }) => (
        <Home
          color={color}
          size={22}
        />
      )
    }}
  />

  <Tabs.Screen
    name='library'
    options={{
      title: 'Библиотека',
      tabBarIcon: ({ color }) => (
        <Library
          color={color}
          size={22}
        />
      )
    }}
  />

  <Tabs.Screen
    name='search'
    options={{
      title: 'Поиск',
      tabBarIcon: ({ color }) => (
        <Search
          color={color}
          size={22}
        />
      )
    }}
  />

  <Tabs.Screen
    name='profile'
    options={{
      title: 'Профиль',
      tabBarIcon: ({ color }) => (
        <User
          color={color}
          size={22}
        />
      )
    }}
  />
</Tabs>*/
