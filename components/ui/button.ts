import { styled, Button as TamaguiButton } from "tamagui";

export const Button = styled(TamaguiButton, {
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
        fontSize: "$5",
        scaleIcon: 1.4,
      },
    },
    primary: {
      true: {
        bg: "$color12",
        color: "$color1",
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
      outlined: {
        height: "$10",
        width: "$6",
        p: "$4",
        fontSize: "$4",
        borderColor: '$color10',
        flexDirection: "column",
        scaleIcon: 1,
        bg: "transparent",
        pressStyle: {
          scale: 0.95,
          borderColor: "$borderColorHover",
        },
      },
    },
  } as const,
  // defaultVariants: {
  //   size: "medium",
  //   card: false,
  // },
});
