import { create } from 'zustand';
import api from '../lib/api';

export const useCartStore = create((set, get) => ({
  items: [],
  totalPrice: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/student/cart');
      set({
        items: data.data.cart.items || [],
        totalPrice: data.data.totalPrice || 0,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (courseId) => {
    const { data } = await api.post('/student/cart', { courseId });
    await get().fetchCart();
    return data;
  },

  removeFromCart: async (courseId) => {
    await api.delete(`/student/cart/${courseId}`);
    await get().fetchCart();
  },

  clearCart: () => set({ items: [], totalPrice: 0 }),

  getItemCount: () => get().items.length,
}));
