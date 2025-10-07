import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from './store/useCartStore';

function App() {
  const items = useCartStore((state) => state.items);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">POS Terminal Ready</h1>
        <p className="mt-2 text-gray-500">Zustand Cart initialized with {items.length} items.</p>
      </div>
    </div>
  );
}

export default App;