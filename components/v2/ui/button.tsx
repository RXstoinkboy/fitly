import { styled, Button as TamaguiButton } from 'tamagui';

export const Button = styled(TamaguiButton, {
  variants: {
    type: {
      ghost: {
        backgroundColor: 'transparent',
        bordderWidth: 0,
        pressStyle: {
          backgroundColor: 'transparent',
          borderWidth: 0,
          color: '$color8',
        },
      },
    },
    stretched: {
      true: {
        width: '100%',
      },
    },
  } as const,
  defaultVariants: {
    stretched: false,
  },
});
