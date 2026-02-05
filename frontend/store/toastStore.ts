import { create } from "zustand";

interface ToastState {
  message: string | null;
  showError: (msg: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  showError: (msg) => set({ message: msg }),
  clear: () => set({ message: null }),
}));
