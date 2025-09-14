import { styled, Button as TamaguiButton } from "tamagui";

export const Button = styled(TamaguiButton, {
  // animation: "bouncy",
  variants: {
    buttonSize: {
      sm: {
        height: "$2",
        fontSize: "$2",
        scaleIcon: 1,
      },
      md: {
        height: "$4",
        fontSize: "$4",
        scaleIcon: 1.5,
      },
      lg: {
        height: "$6",
        fontSize: "$6",
        scaleIcon: 2,
      },
    },
    primary: {
      true: {
        bg: "$accent7",
        color: "$color",
        pressStyle: {
          bg: "$accent6",
          scale: 0.95,
        },
      },
    },
    card: {
      true: {
        height: "auto",
        p: "$4",
        flex: 1,
        fontSize: "$4",
        bg: "$accent5",
        bordered: true,
        flexDirection: "column",
        scaleIcon: 3,
        pressStyle: {
          scale: 0.95,
          bg: "$accent6",
        },
      },
    },
  } as const,
  // defaultVariants: {
  //   size: "medium",
  //   card: false,
  // },
});
