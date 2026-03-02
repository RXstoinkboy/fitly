import React, { ComponentProps } from 'react';
import { Sheet as TamaguiSheet, SheetProps } from 'tamagui';

// Provide a small wrapper that injects sensible defaults while keeping the
// original Tamagui API surface (Sheet.Overlay, Sheet.Handle, Sheet.Frame).
// Defaults can be overridden by passing props.

type OverlayProps = ComponentProps<typeof TamaguiSheet.Overlay>;
type HandleProps = ComponentProps<typeof TamaguiSheet.Handle>;
type FrameProps = ComponentProps<typeof TamaguiSheet.Frame>;

interface SheetComponent extends React.FC<SheetProps> {
  Overlay: React.FC<OverlayProps>;
  Handle: React.FC<HandleProps>;
  Frame: React.FC<FrameProps>;
}

const rootDefaults: SheetProps = {
  snapPointsMode: 'fit',
  dismissOnSnapToBottom: true,
  unmountChildrenWhenHidden: true,
  transition: 'quick',
};

const Sheet: SheetComponent = (props) => <TamaguiSheet {...rootDefaults} {...props} />;

const Overlay: React.FC<OverlayProps> = (props) => (
  <TamaguiSheet.Overlay
    bg="$shadow3"
    transition="medium"
    enterStyle={{ opacity: 0 }}
    exitStyle={{ opacity: 0 }}
    {...props}
  />
);

const Handle: React.FC<HandleProps> = (props) => (
  <TamaguiSheet.Handle bg="$background" {...props} />
);

const Frame: React.FC<FrameProps> = (props) => (
  <TamaguiSheet.Frame p="$4" content="center" items="center" gap="$5" bg="$background" {...props} />
);

Sheet.Overlay = Overlay;
Sheet.Handle = Handle;
Sheet.Frame = Frame;

export { Sheet };
