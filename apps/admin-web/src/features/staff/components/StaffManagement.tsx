import React, { useState } from 'react';
import type { Employee } from '../api/useStaff';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '../api/useStaff';
import { Users, Plus, Shield, Loader2, Edit, Trash2, AlertCircle } from 'lucide-react';

export const StaffManagement = () => {
  const { data: staff = [], isLoading } = useStaff();
  const { mutate: createStaff, isPending: isCreating } = useCreateStaff();
  const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaff();
  const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Employee | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'CASHIER' | 'MANAGER' | 'ADMIN';
    pinCode: string;
  }>({ 
    name: '', 
    email: '', 
    role: 'CASHIER', 
    pinCode: '' 
  });
  
  const openCreateForm = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', role: 'CASHIER', pinCode: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingStaff(employee);
    setFormData({ 
      name: employee.name, 
      email: employee.email, 
      role: employee.role, 
      pinCode: '' 
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff) {
      const payload: any = { ...formData };
      if (!payload.pinCode) delete payload.pinCode; 

      updateStaff({ id: editingStaff._id, data: payload }, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingStaff(null);
        }
      });
    } else {
      createStaff(formData, {
        onSuccess: () => {
          setIsFormOpen(false);
          setFormData({ name: '', email: '', role: 'CASHIER', pinCode: '' });
        }
      });
    }
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      deleteStaff(staffToDelete._id, {
        onSuccess: () => setStaffToDelete(null)
      });
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" /> Staff Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage POS access, roles, and secure PINs.</p>
        </div>
        
        <button 
          onClick={isFormOpen ? () => setIsFormOpen(false) : openCreateForm} 
          className={`${isFormOpen ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'} px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors`}
        >
          {isFormOpen ? 'Cancel' : <><Plus size={18} /> Add New Employee</>}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
            {editingStaff ? 'Edit Employee' : 'New Employee Details'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">System Role</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="CASHIER">POS Cashier</option>
                <option value="MANAGER">Store Manager</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                POS PIN Code (4-6 digits) {editingStaff && <span className="text-gray-400 font-normal ml-1">(Leave blank to keep current)</span>}
              </label>
              <input 
                type="password" required={!editingStaff} minLength={4} maxLength={6} pattern="\d*"
                placeholder="e.g. 1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})}
              />
            </div>
            <div className="col-span-2 mt-2">
              <button disabled={isCreating || isUpdating} type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center">
                {(isCreating || isUpdating) ? <Loader2 className="animate-spin" size={20} /> : (editingStaff ? 'Update Employee' : 'Save Employee')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Archive Employee?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to remove <strong>{staffToDelete.name}</strong>? They will instantly lose access to the POS and Admin dashboards.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStaffToDelete(null)} className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex justify-center items-center">
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="p-4 pl-6">Employee Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading staff...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No staff members found.</td></tr>
            ) : (
              staff.map((emp) => (
                <tr key={emp._id} className="hover:bg-blue-50/30 transition-colors text-sm group">
                  <td className="p-4 pl-6 font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Users size={16} /></div>
                    {emp.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border flex w-max items-center gap-1 ${
                      emp.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      emp.role === 'MANAGER' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {emp.role === 'ADMIN' && <Shield size={12} />}
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{emp.email}</td>
                  <td className="p-4">
                    <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-md text-xs font-bold">
                      Active
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => openEditForm(emp)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setStaffToDelete(emp)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Archive Employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};