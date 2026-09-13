import { create } from "zustand";

interface ConnectionStoreState {
  isConnected: boolean;
}

interface ConnectionStoreActions {
  setConnected: (isConnected: boolean) => void;
}

type ConnectionStore = ConnectionStoreState & ConnectionStoreActions;

const useConnectionStore = create<ConnectionStore>((set) => ({
  isConnected: false,
  setConnected: (isConnected) => set({ isConnected })
}));

export default useConnectionStore;
