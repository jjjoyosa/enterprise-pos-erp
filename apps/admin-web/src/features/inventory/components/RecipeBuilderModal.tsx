import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChefHat, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query'; 
import type { Product } from '../api/useProducts';

interface RecipeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null; 
  allProducts: Product[];  
}

export const RecipeBuilderModal: React.FC<RecipeBuilderModalProps> = ({ isOpen, onClose, product, allProducts }) => {
  const [ingredients, setIngredients] = useState<{ materialProductId: string; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient(); 
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setSuccessMessage(null);
      setErrorMessage(null);
      fetchRecipe();
    }
  }, [isOpen, product]);

  const fetchRecipe = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      const res = await fetch(`http://localhost:5000/api/v1/products/${product?._id}/recipe`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        setIngredients(data.ingredients.map((ing: any) => ({
          materialProductId: ing.materialProductId._id || ing.materialProductId,
          quantity: ing.quantity
        })));
      } else {
        setIngredients([]); 
      }
    } catch (error) {
      console.error('Failed to fetch recipe', error);
    }
  };

  const handleSave = async () => {
    if (!product) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('erp_token');
      const res = await fetch(`http://localhost:5000/api/v1/products/${product._id}/recipe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ingredients: ingredients.filter(i => i.materialProductId && i.quantity > 0) })
      });

      if (res.ok) {
        setSuccessMessage(`Recipe for ${product.name} saved successfully!`);
        
        
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage('Failed to save recipe. Please check your connection.');
      }
    } catch (error) {
      console.error('Save error', error);
      setErrorMessage('A network error occurred while saving the recipe.');
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { materialProductId: '', quantity: 1 }]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <ChefHat size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recipe Builder</h2>
              <p className="text-sm text-gray-500">Bill of Materials for: <span className="font-bold text-blue-600">{product.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-200/50 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- INLINE NOTIFICATIONS --- */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="text-green-600" size={20} />
            <p className="text-sm font-bold text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm font-bold text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Raw Ingredients</h3>
            <button onClick={addIngredientRow} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={16} /> Add Material
            </button>
          </div>

          {ingredients.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              No ingredients added. This item currently deducts as a standard retail product.
            </div>
          ) : (
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                  <div className="flex-1">
                    <select 
                      value={ing.materialProductId}
                      onChange={(e) => updateIngredient(index, 'materialProductId', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    >
                      <option value="">Select Raw Material...</option>
                      {allProducts.filter(p => p._id !== product._id).map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input 
                      type="number" 
                      min="0.01" step="0.01"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                      placeholder="Qty"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <button onClick={() => removeIngredient(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isLoading || successMessage !== null}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save size={18} /> {isLoading ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
};