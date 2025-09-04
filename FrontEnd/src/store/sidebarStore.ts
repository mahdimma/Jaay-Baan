import { create } from "zustand";

interface SidebarStore {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isSidebarOpen:
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
