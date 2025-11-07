import { Stack } from 'expo-router';
import { Text, YStack } from 'tamagui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <YStack>
        <Text>Elo elo z ooops</Text>
      </YStack>
    </>
  );
}
