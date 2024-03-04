import {
  Tabs,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Entypo, AntDesign, Feather, FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const segments = useSegments();
  const router = useRouter();

  const navigationState = useRootNavigationState();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Entypo name={'home'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name='friends'
        options={{
          tabBarLabel: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name='user-friends' color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name='feed'
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Feather
              name='activity'
              color={color}
              size={size}
              style={{ height: size - 1, width: size - 1, textAlign: 'center' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name='user' color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
