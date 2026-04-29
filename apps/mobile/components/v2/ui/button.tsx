import { Button as ButtonDS, styled } from 'tamagui';

export const Button = styled(ButtonDS, {
  name: 'Button',
  variants: {
    ghost: {
      true: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          borderColor: 'transparent',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
          borderColor: 'transparent',
        },
        focusVisibleStyle: {
          outlineColor: '$outlineColor',
          outlineStyle: 'solid',
          outlineWidth: 2,
        },
      },
    },

    size: {
      xs: {
        height: '$2',
      },
      s: {
        height: '$3',
      },
      m: {
        height: '$4',
      },
      l: {
        height: '$5',
      },
    },
  } as const,

  defaultVariants: {
    size: 'm',
  },
});
