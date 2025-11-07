import { styled, Button as TamaguiButton } from 'tamagui';

export const Button = styled(TamaguiButton, {
  variants: {
    ghost: {
      true: {
        backgroundColor: 'transparent',
        bordderWidth: 0,
        pressStyle: {
          backgroundColor: 'transparent',
          borderWidth: 0,
          color: 'red',
        },
      },
    },

    paddingSize: {
      0: {
        padding: 0,
      },
    },
  },
});
