import { Tabs } from 'expo-router';
import React, { type FC } from 'react';
import { LayoutGrid, Sparkles } from '@/icons';
import { XGroup, YStack, Button } from '@/components/v2/ui';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const CustomTabs: FC<BottomTabBarProps> = ({ state, navigation }) => {
  const activeRouteName = state.routes[state.index]?.name;
  const isGenerateFocused = activeRouteName === 'index';
  const isGalleryFocused = activeRouteName === 'gallery';
  const optionSize = '$5';
  const iconSize = 24;

  return (
    <XGroup position="absolute" b={'$2'} l={'50%'} style={{ transform: [{ translateX: '-50%' }] }}>
      <XGroup.Item>
        <Button
          value="index"
          size={optionSize}
          borderTopLeftRadius={9999}
          borderBottomLeftRadius={9999}
          onPress={() => navigation.navigate('index')}>
          <YStack items={'center'} gap={'$1'}>
            <Sparkles color={isGenerateFocused ? '$accent1' : '$color'} size={iconSize} />
            {/* <Text fontSize={'$2'} color={isGenerateFocused ? '$accent1' : '$color'}>
              Generate
            </Text> */}
          </YStack>
        </Button>
      </XGroup.Item>
      <XGroup.Item>
        <Button
          value="gallery"
          size={optionSize}
          borderTopRightRadius={9999}
          borderBottomRightRadius={9999}
          onPress={() => navigation.navigate('gallery')}>
          <YStack items={'center'} gap={'$1'}>
            <LayoutGrid color={isGalleryFocused ? '$accent1' : '$color'} size={iconSize} />
            {/* <Text fontSize={'$2'} color={isGalleryFocused ? '$accent1' : '$color'}>
              Gallery
            </Text> */}
          </YStack>
        </Button>
      </XGroup.Item>
    </XGroup>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabs {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarStyle: {
          position: 'absolute',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generate',
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
        }}
      />
    </Tabs>
  );
}
