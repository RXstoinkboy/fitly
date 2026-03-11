import { Tabs } from 'expo-router';
import React from 'react';
import { LayoutGrid, Sparkles, Settings } from '@/icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generate',
          headerShown: false,
          animation: 'shift',
          tabBarIcon: ({ color, size }) => <Sparkles color={color as any} size={size} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          headerShown: false,
          animation: 'shift',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color as any} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          animation: 'shift',
          tabBarIcon: ({ color, size }) => <Settings color={color as any} size={size} />,
        }}
      />
    </Tabs>
  );
}
