import { create } from 'zustand';

type PhotoModalState = {
  visible: boolean;
  toggle: (visible?: boolean) => void;
};

export const usePhotoModalStore = create<PhotoModalState>()((set) => ({
  visible: false,
  toggle: (visible?: boolean) =>
    set((state) => ({
      visible: visible ?? !state.visible,
    })),
}));
