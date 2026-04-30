import { Button as ButtonDS, styled } from 'tamagui';

export const Button = styled(ButtonDS, {
  name: 'Button',
  variants: {
    kind: {
      ghost: {
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

      cta: {
        backgroundColor: '$accent1',
        borderColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$accent1',
          borderColor: 'transparent',
        },
        pressStyle: {
          backgroundColor: '$accent1',
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
