import { Tabs } from 'expo-router'
import { Home, Library, Search, User } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
          ),
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
          ),
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
          ),
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
          ),
        }}
      />
    </Tabs>
  )
}