import React from 'react';
import { Sheet as TamaguiSheet } from 'tamagui';

// Provide a small wrapper that injects sensible defaults while keeping the
// original Tamagui API surface (Sheet.Overlay, Sheet.Handle, Sheet.Frame).
// Defaults can be overridden by passing props.

const rootDefaults = {
  snapPointsMode: 'fit',
  dismissOnSnapToBottom: true,
  unmountChildrenWhenHidden: true,
  transition: 'quick',
};

const Sheet: any = (props: any) => <TamaguiSheet {...rootDefaults} {...props} />;

const Overlay = (props: any) => (
  <TamaguiSheet.Overlay
    bg="$shadow3"
    transition="medium"
    enterStyle={{ opacity: 0 }}
    exitStyle={{ opacity: 0 }}
    {...props}
  />
);

const Handle = (props: any) => <TamaguiSheet.Handle bg="$accent12" {...props} />;

const Frame = (props: any) => (
  <TamaguiSheet.Frame p="$4" content="center" items="center" gap="$5" bg="$accent12" {...props} />
);

Sheet.Overlay = Overlay;
Sheet.Handle = Handle;
Sheet.Frame = Frame;

export { Sheet };
