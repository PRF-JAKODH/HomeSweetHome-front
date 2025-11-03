// stores/checkout-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartResponse } from '@/types/order'; // CartResponse 타입을 재사용

type CheckoutStore = {
  items: CartResponse[];
  setItems: (items: CartResponse[]) => void;
  clearItems: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set({ items }),
      clearItems: () => set({ items: [] }),
    }),
    { 
      name: 'checkout-storage', // 세션 스토리지에 저장될 키 이름
      storage: createJSONStorage(() => sessionStorage), // localStorage 대신 sessionStorage 사용
    }
  )
);