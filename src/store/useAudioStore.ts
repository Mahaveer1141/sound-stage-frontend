import { create } from "zustand";

interface AudioStoreState {
  isMuted: boolean;
}

interface AudioStoreActions {
  setMuted: (isMuted: boolean) => void;
}

type AudioStore = AudioStoreState & AudioStoreActions;

const useAudioStore = create<AudioStore>((set) => ({
  isMuted: true,
  setMuted: (isMuted) => set({ isMuted })
}));

export default useAudioStore;
