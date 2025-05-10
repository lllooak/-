import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface FanState {
  favorites: string[];
  orders: any[];
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    privacy: {
      showActivity: boolean;
      allowMessages: boolean;
    };
  };
  addFavorite: (creatorId: string) => void;
  removeFavorite: (creatorId: string) => void;
  updateSettings: (settings: Partial<FanState['settings']>) => void;
}

export const useFanStore = create<FanState>()(
  persist(
    (set) => ({
      favorites: [],
      orders: [],
      settings: {
        notifications: {
          email: true,
          push: true,
        },
        privacy: {
          showActivity: true,
          allowMessages: true,
        },
      },

      addFavorite: (creatorId) => {
        set((state) => ({
          favorites: [...state.favorites, creatorId],
        }));
      },

      removeFavorite: (creatorId) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== creatorId),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },
    }),
    {
      name: 'fan-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        settings: state.settings,
      }),
    }
  )
);
