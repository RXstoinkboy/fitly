import { Text as TamaguiText, styled } from 'tamagui';

export const Text = styled(TamaguiText, {
  variants: {
    size: {
      s: {
        fontSize: '$4',
        lineHeight: '$4',
      },
      m: {
        fontSize: '$5',
        lineHeight: '$5',
      },
      l: {
        fontSize: '$6',
        lineHeight: '$6',
      },
      xl: {
        fontSize: '$7',
        lineHeight: '$7',
      },
      xxl: {
        fontSize: '$9',
        lineHeight: '$9',
      },
    },
    weigth: {
      regular: {
        fontWeight: '400',
      },
      bold: {
        fontWeight: '700',
      },
      semiBold: {
        fontWeight: '600',
      },
    },
    type: {
      secondary: {
        color: '$color12',
      },
      primary: {
        color: '$color12',
      },
    },
  } as const,
  defaultVariants: {
    size: 'm',
    weigth: 'regular',
    type: 'primary',
  },
});
