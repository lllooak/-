import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface AdminState {
  settings: {
    platformFee: number;
    minRequestPrice: number;
    maxRequestPrice: number;
    defaultDeliveryTime: number;
    maxDeliveryTime: number;
    allowedFileTypes: string[];
    maxFileSize: number;
    autoApproveCreators: boolean;
    requireEmailVerification: boolean;
    enableDisputes: boolean;
    disputeWindow: number;
    payoutThreshold: number;
    payoutSchedule: string;
  };
  updateSettings: (settings: Partial<AdminState['settings']>) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      settings: {
        platformFee: 10,
        minRequestPrice: 5,
        maxRequestPrice: 1000,
        defaultDeliveryTime: 24,
        maxDeliveryTime: 72,
        allowedFileTypes: ['mp4', 'mov', 'avi'],
        maxFileSize: 100,
        autoApproveCreators: false,
        requireEmailVerification: true,
        enableDisputes: true,
        disputeWindow: 48,
        payoutThreshold: 50,
        payoutSchedule: 'weekly',
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
      name: 'admin-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
