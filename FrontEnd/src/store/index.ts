import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        localStorage.setItem("authToken", token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("authToken");
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface LocationStoreItem {
  id: number;
  name: string;
  location_type: string;
  parent_id?: number;
  breadcrumb: string;
  children_count: number;
  description?: string;
  is_container?: boolean;
}

interface LocationState {
  selectedLocation: LocationStoreItem | null;
  currentParent: number | null;
  searchQuery: string;
  selectedItems: number[];
  setSelectedLocation: (location: LocationStoreItem | null) => void;
  setCurrentParent: (parentId: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedItems: (items: number[]) => void;
  toggleSelectedItem: (id: number) => void;
  clearSelection: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  selectedLocation: null,
  currentParent: null,
  searchQuery: "",
  selectedItems: [],
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setCurrentParent: (parentId) => set({ currentParent: parentId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedItems: (items) => set({ selectedItems: items }),
  toggleSelectedItem: (id) => {
    const { selectedItems } = get();
    const newSelection = selectedItems.includes(id)
      ? selectedItems.filter((item) => item !== id)
      : [...selectedItems, id];
    set({ selectedItems: newSelection });
  },
  clearSelection: () => set({ selectedItems: [] }),
}));
