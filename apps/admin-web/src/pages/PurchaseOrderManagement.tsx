import React, { useState } from 'react';
import { usePurchaseOrders, useCreatePO, useUpdatePOStatus } from '../hooks/usePurchaseOrders';
import { useSuppliers } from '../hooks/useSuppliers';
import { useProducts } from '../features/inventory/api/useProducts'; 
import { ClipboardList, Plus, FileText, CheckCircle, Send, X, Trash2 } from 'lucide-react';

export const PurchaseOrderManagement = () => {
  const { data: pos, isLoading } = usePurchaseOrders();
  const { data: suppliers } = useSuppliers();
  const { data: products } = useProducts();
  
  const createMutation = useCreatePO();
  const statusMutation = useUpdatePOStatus();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ supplierId: '', notes: '' });
  const [poItems, setPoItems] = useState([{ productId: '', quantity: 1, unitCost: 0 }]);

  const handleAddItem = () => setPoItems([...poItems, { productId: '', quantity: 1, unitCost: 0 }]);
  
  const handleRemoveItem = (index: number) => {
    if (poItems.length === 1) return; // Keep at least one row
    const newItems = poItems.filter((_, i) => i !== index);
    setPoItems(newItems);
  };
  
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...poItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPoItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({ ...formData, items: poItems });
    setIsModalOpen(false);
    setFormData({ supplierId: '', notes: '' });
    setPoItems([{ productId: '', quantity: 1, unitCost: 0 }]);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'SENT': return 'bg-purple-100 text-purple-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" /> Purchase Orders
          </h2>
          <p className="text-gray-500 text-sm mt-1">Draft, approve, and track orders sent to suppliers.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
          <Plus size={18} /> New Purchase Order
        </button>
      </div>

      {/* PO List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">PO Number</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Supplier</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Total Amount</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
              <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr> : 
             pos?.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No Purchase Orders found.</td></tr> :
             pos?.map((po: any) => (
              <tr key={po._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-blue-600 flex items-center gap-2">
                  <FileText size={16}/> {po.poNumber}
                </td>
                <td className="p-4 font-bold text-gray-900">{po.supplierId?.name || 'Unknown'}</td>
                <td className="p-4 font-mono font-bold text-gray-900">₱{po.totalAmount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(po.status).replace('bg-', 'border-').replace('100', '200')} ${getStatusColor(po.status)}`}>
                    {po.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2 justify-end">
                  {po.status === 'DRAFT' && (
                    <button onClick={() => statusMutation.mutate({ id: po._id, status: 'APPROVED' })} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Approve">
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {po.status === 'APPROVED' && (
                    <button onClick={() => statusMutation.mutate({ id: po._id, status: 'SENT' })} className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="Mark as Sent">
                      <Send size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-[850px] max-h-[90vh] flex flex-col border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="text-blue-600" size={20} /> Draft Purchase Order
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Supplier *</label>
                <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all">
                  <option value="">-- Choose a Supplier --</option>
                  {suppliers?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-gray-900">Order Line Items *</label>
                  <button type="button" onClick={handleAddItem} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    + Add Product
                  </button>
                </div>
                
                {/* ADDED: Column Headers for the Line Items */}
                <div className="flex gap-3 px-3 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 mb-3">
                  <div className="flex-1">Product</div>
                  <div className="w-24">Qty</div>
                  <div className="w-32">Unit Cost (₱)</div>
                  <div className="w-24 text-right">Total</div>
                  <div className="w-8"></div> {/* Spacer for the trash icon */}
                </div>
                
                <div className="space-y-3">
                  {poItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex-1">
                        <select required value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="w-full border-none bg-transparent outline-none focus:ring-0 text-sm">
                          <option value="">Select Product...</option>
                          {products?.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="w-24 border-l pl-3">
                        <input type="number" required min="1" placeholder="0" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full border-none bg-transparent outline-none focus:ring-0 text-sm p-0" />
                      </div>
                      <div className="w-32 border-l pl-3">
                        <input type="number" required min="0" step="0.01" placeholder="0.00" value={item.unitCost} onChange={e => handleItemChange(index, 'unitCost', Number(e.target.value))} className="w-full border-none bg-transparent outline-none focus:ring-0 text-sm p-0" />
                      </div>
                      <div className="w-24 border-l pl-3 text-right font-mono font-bold text-blue-700 text-sm">
                        {(item.quantity * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      
                      {/* ADDED: Remove Line Item Button */}
                      <div className="w-8 flex justify-center border-l border-gray-100 pl-2">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(index)}
                          className={`p-1.5 rounded-md transition-colors ${poItems.length > 1 ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                          disabled={poItems.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending || poItems.some(i => !i.productId)} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                  {createMutation.isPending ? 'Drafting...' : 'Save Draft PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};