import { createContext, PropsWithChildren, useState } from "react";

export const GarmentsContext = createContext<{
  top?: string;
  bottom?: string;
  setTop: (top: string) => void;
  setBottom: (bottom: string) => void;
}>({
  top: undefined,
  bottom: undefined,
  setTop: () => {},
  setBottom: () => {},
});

export const GarmentsProvider = ({ children }: PropsWithChildren) => {
  const [top, setTop] = useState<string | undefined>();
  const [bottom, setBottom] = useState<string | undefined>();

  const setTopGarment = (topGarment: string) => {
    setTop(topGarment);
  };

  const setBottomGarment = (bottomGarment: string) => {
    setBottom(bottomGarment);
  };

  return (
    <GarmentsContext
      value={{
        top,
        bottom,
        setTop: setTopGarment,
        setBottom: setBottomGarment,
      }}
    >
      {children}
    </GarmentsContext>
  );
};
