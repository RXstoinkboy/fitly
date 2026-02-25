import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { GalleryHorizontalEnd, Wand2 } from '@/icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
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
    </Tabs>
  );
}
