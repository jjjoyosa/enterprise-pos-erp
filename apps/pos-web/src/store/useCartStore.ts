import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  maxStock: number; 
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  
  addItem: (product: { _id: string; name: string; basePrice: number; stock: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  // Updated interface to accept optional rule
  setDiscount: (amount: number, rule?: any) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[], discount: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.max(0, subtotal - discount);
  const tax = total - (total / 1.12); 
  return { subtotal, tax, total };
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,

  addItem: (product) => set((state) => {
    if (product.stock <= 0) return state;
    const existingItem = state.items.find(item => item.productId === product._id);
    let newItems;
    if (existingItem) {
      if (existingItem.quantity >= product.stock) return state;
      newItems = state.items.map(item => 
        item.productId === product._id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
          : item
      );
    } else {
      newItems = [...state.items, {
        productId: product._id,
        name: product.name,
        unitPrice: product.basePrice,
        quantity: 1,
        maxStock: product.stock, 
        subtotal: product.basePrice
      }];
    }
    return { items: newItems, ...calculateTotals(newItems, state.discount) };
  }),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) return state; 
    const newItems = state.items.map(item => {
      if (item.productId === productId) {
        const safeQuantity = Math.min(quantity, item.maxStock);
        return { ...item, quantity: safeQuantity, subtotal: safeQuantity * item.unitPrice };
      }
      return item;
    });
    return { items: newItems, ...calculateTotals(newItems, state.discount) };
  }),

  removeItem: (productId) => set((state) => {
    const newItems = state.items.filter(item => item.productId !== productId);
    return { items: newItems, ...calculateTotals(newItems, state.discount) };
  }),

  // Updated action logic
  setDiscount: (discount, rule) => set((state) => {
    let finalDiscount = discount;
    if (rule) {
      const rawSubtotal = state.items.reduce((sum, item) => sum + item.subtotal, 0);
      if (rule.target === 'SPECIFIC_ITEM' && rule.targetProductId) {
        const targetItem = state.items.find(i => i.productId === rule.targetProductId);
        if (targetItem) {
          const itemSubtotal = targetItem.unitPrice * targetItem.quantity;
          finalDiscount = rule.type === 'PERCENTAGE' 
            ? itemSubtotal * (rule.value / 100) 
            : Math.min(itemSubtotal, rule.value);
        }
      } else {
        finalDiscount = rule.type === 'PERCENTAGE' 
          ? rawSubtotal * (rule.value / 100) 
          : rule.value;
      }
    }
    const totals = calculateTotals(state.items, finalDiscount);
    return { discount: finalDiscount, ...totals };
  }),

  clearCart: () => set({ items: [], subtotal: 0, tax: 0, discount: 0, total: 0 })
}));