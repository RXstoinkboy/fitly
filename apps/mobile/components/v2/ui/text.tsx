import { Text as TamaguiText, styled } from 'tamagui';

export const Text = styled(TamaguiText, {
  variants: {
    size: {
      s: {
        fontSize: '$4',
        lineHeight: '$5',
      },
      m: {
        fontSize: '$5',
        lineHeight: '$6',
      },
      l: {
        fontSize: '$6',
        lineHeight: '$7',
      },
      xl: {
        fontSize: '$7',
        lineHeight: '$8',
      },
      xxl: {
        fontSize: '$9',
        lineHeight: '$10',
      },
    },
    weight: {
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
        color: '$color11',
      },
      primary: {
        color: '$color12',
      },
    },
  } as const,
  defaultVariants: {
    size: 'm',
    weight: 'regular',
    type: 'primary',
  },
});
