import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, LinkProps, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ArrowLeft, ArrowRight } from '@tamagui/lucide-icons'

import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";
import { QueryClientProvider } from "@/lib/query-provider";
import { GarmentsProvider } from "@/context/garment-context";
import { useGetStatus } from "@/queries/onboarding/get-status";
import { OnboardingStatus, OnboardingStep } from "@/lib/onboarding/types";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "tamagui";
import { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/v2/ui/button";
import { useUpdateStatus } from "@/queries/onboarding/update-status";
import { useUpdateStep } from "@/queries/onboarding/update-step";
import { useGetStep } from "@/queries/onboarding/get-step";

type NextProps = {
  children?: ReactNode,
  href?: LinkProps['href'],
  step?: OnboardingStep,
}

// TODO: this will go to /components
const Next = ({
  children = 'Next',
  ...props
}: NextProps) => {
  const updateStatus = useUpdateStatus();
  const updateStep = useUpdateStep();

  const onNavigate = () => {
    if (!props.step) {
      return;
    }
    if (props.step === OnboardingStep.Finish) {
      updateStatus.mutate(OnboardingStatus.Completed);
    }

    updateStep.mutate(props.step);
  }

  return (<Link href={props.href ? props.href : `/onboarding/${props.step ?? OnboardingStep.Welcome}`} asChild>
    <Button iconAfter={<ArrowRight />} ghost paddingSize={0} onPress={onNavigate}>
      <Text>{children}</Text>
    </Button>
  </Link>)
}

const Back = ({
  step
}: {
  step: OnboardingStep,
}) => {
  const updateStep = useUpdateStep();

  return (<Link href={`/onboarding/${step}`} asChild>
    <Button icon={<ArrowLeft />} ghost paddingSize={0} onPress={() => { updateStep.mutate(step); }}>
      <Text>Back</Text>
    </Button>
  </Link>)
}

const stackScreenBaseOptions: ComponentProps<typeof Stack.Screen>['options'] = {
  headerTitleAlign: 'center',
  headerBackVisible: false,
}

const RootContent = () => {
  const { data } = useGetStatus();
  const step = useGetStep();
  const isOnboarded = data === OnboardingStatus.Completed;

  return <Stack screenOptions={
    stackScreenBaseOptions
  }>
    <Stack.Protected guard={!isOnboarded}>
      <Stack.Screen name="onboarding/welcome" options={{
        title: 'Welcome!',
        headerRight: () => <Next step={OnboardingStep.SelectUserPhoto} />,
      }}
        initialParams={{
          step: 1
        }}
      />
      <Stack.Screen name="onboarding/select-user-photo" options={{
        title: 'Prepare photo',
        headerRight: () => <Next step={OnboardingStep.SelectGarments} />,
        headerLeft: () => <Back step={OnboardingStep.Welcome} />,
      }} initialParams={{
        step: 2
      }} />
      <Stack.Screen name="onboarding/select-garments" options={{
        title: "Photo is ready",
        headerRight: () => <Next step={OnboardingStep.Finish} />,
        headerLeft: () => <Back step={OnboardingStep.SelectUserPhoto} />,
      }} initialParams={{
        step: 3
      }} />
      <Stack.Screen name="onboarding/finish" options={{
        title: 'Congratulations!',
        headerRight: () => <Next href={'/(tabs)'}>Done!</Next>,
        headerLeft: () => <Back step={OnboardingStep.SelectGarments} />,
      }} initialParams={{
        step: 4
      }} />
    </Stack.Protected>
    <Stack.Protected guard={isOnboarded}>
      <Stack.Screen name="(tabs)" />
    </Stack.Protected>
    <Stack.Screen name="+not-found" />
    {/* TODO: clothes selection drawer */}
    {/* TODO: modal with image zoom -n */}
  </Stack>
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme === "dark" ? "dark" : "light"}
      >
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <GarmentsProvider>
            <SafeAreaProvider>
              <RootContent />
            </SafeAreaProvider>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </GarmentsProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
