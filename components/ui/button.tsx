import { styled, Button as TamaguiButton } from "tamagui";

export const Button = styled(TamaguiButton, {
  animation: "bouncy",
  variants: {
    size: {
      small: {
        height: "$2",
        fontSize: "$2",
      },
      medium: {
        height: "$4",
        fontSize: "$4",
      },
      large: {
        height: "$6",
        fontSize: "$6",
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
    primary: {
      true: {
        rounded: "$radius.12",
        bg: "$accent7",
        color: "$color",
        pressStyle: {
          bg: "$accent6",
          scale: 0.95,
        },
      },
    },
  } as const,
  // defaultVariants: {
  //   size: "medium",
  //   card: false,
  // },
});
