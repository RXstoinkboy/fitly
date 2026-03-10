import { Tabs } from 'expo-router';
import React from 'react';
import { GalleryHorizontalEnd, Settings, Wand2 } from '@/icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generate',
          headerShown: false,
          animation: 'shift',
          tabBarIcon: ({ color, size }) => <Wand2 color={color as any} size={size} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          headerShown: false,
          animation: 'shift',
          tabBarIcon: ({ color, size }) => (
            <GalleryHorizontalEnd color={color as any} size={size} />
          ),
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
