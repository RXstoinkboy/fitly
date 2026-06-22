import { useState, useEffect } from 'react';

const loadingStates = [
  'Sending images...',
  'Analyzing content...',
  'Generating image...',
  'Hold on...',
  'Almost there...',
];

export const useLoadingState = ({ isPending }: { isPending: boolean }) => {
  const [loadingState, setLoadingState] = useState<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let intervalTime = 3000;

    if (isPending) {
      setLoadingState(0);
      interval = setInterval(() => {
        setLoadingState((prev) => {
          if (prev === null) {
            return 0;
          }

          if (prev >= loadingStates.length - 1) {
            return prev;
          }

          return prev + 1;
        });
      }, intervalTime);
    } else {
      setLoadingState(null);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPending]);

  return loadingStates[loadingState ?? 0];
};
