
import React, { useState } from 'react';
import Card from '../components/common/Card.tsx';
import Button from '../components/common/Button.tsx';
import Modal from '../components/common/Modal.tsx';
import { constants } from '../constants.ts';
import { Branch } from '../types.ts';
import { useBranch } from '../context/BranchContext.tsx';
import { useNavigate } from 'react-router-dom';

export const BranchesPage: React.FC = () => {
  const { branches, setBranches, currentBranchId, setCurrentBranchId } = useBranch();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});
  
  // Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, branchId: string | null }>({
      isOpen: false,
      branchId: null
  });

  const openModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData(branch);
    } else {
      setEditingBranch(null);
      setFormData({ status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const requestDeleteBranch = (id: string) => {
    if (branches.length <= 1) {
        alert("You cannot delete the only remaining branch.");
        return;
    }
    if (id === currentBranchId) {
        alert("You cannot delete the currently selected branch. Please switch branches first.");
        return;
    }
    setDeleteConfirmation({ isOpen: true, branchId: id });
  };

  const confirmDeleteBranch = () => {
    if (deleteConfirmation.branchId) {
        setBranches(branches.filter(b => b.id !== deleteConfirmation.branchId));
        setDeleteConfirmation({ isOpen: false, branchId: null });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      setBranches(branches.map(b => b.id === editingBranch.id ? { ...b, ...formData } as Branch : b));
    } else {
      const newBranch = { ...formData, id: Math.random().toString(36).substr(2, 9) } as Branch;
      setBranches([...branches, newBranch]);
    }
    setIsModalOpen(false);
  };


  const handleViewOrders = (branchId: string) => {
      setCurrentBranchId(branchId);
      navigate(constants.routes.ORDERS);
  };

  return (
    <div className="space-y-8">
       {/* Header Section */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your Cafe Locations and details.</p>
        </div>
        <button 
            onClick={() => openModal()} 
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
        >
            <span className="mr-2 text-lg">+</span> Add Branch
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {branches.map(b => (
          <div key={b.id} className={`bg-white rounded-xl p-6 shadow-sm border flex flex-col transition-all ${b.id === currentBranchId ? 'border-offoOrange ring-1 ring-offoOrange bg-orange-50/10' : 'border-gray-100'}`}>
             {/* Card Header */}
             <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${b.id === currentBranchId ? 'bg-orange-100 text-offoOrange' : 'bg-blue-100 text-blue-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1 4h1" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <h3 className="text-lg font-bold text-gray-900 leading-tight">{b.name}</h3>
                             {b.id === currentBranchId && <span className="text-[10px] bg-offoOrange text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Current</span>}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{b.address}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${b.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {b.status}
                    </span>
                    <button onClick={() => requestDeleteBranch(b.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete Branch">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
             </div>

             {/* Divider */}
             <div className="border-t border-gray-100 mb-4"></div>

             {/* Details List */}
             <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-900">Manager:</span>
                    <span className="text-gray-500">{b.manager}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-900">Contact:</span>
                    <span className="text-gray-500">{b.contact}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-900">Location:</span>
                    <span className="text-gray-500 truncate max-w-[200px]">{b.latitude}, {b.longitude}</span>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => openModal(b)}
                    className="w-full px-4 py-2 border border-orange-500 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors focus:outline-none"
                >
                    Edit Details
                </button>
                {b.id !== currentBranchId ? (
                    <button 
                        onClick={() => setCurrentBranchId(b.id)}
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Switch To
                    </button>
                ) : (
                    <button disabled className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-200">
                        Selected
                    </button>
                )}
                
                <button 
                    onClick={() => handleViewOrders(b.id)}
                    className="w-full px-4 py-2 border border-green-500 text-green-500 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors focus:outline-none"
                >
                    View Orders
                </button>
             </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingBranch ? "Edit Branch" : "Add New Branch"}
      >
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch Name</label>
              <input 
                required
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-offoOrange focus:ring-offoOrange border p-2"
                placeholder="e.g. Main Campus Cafe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea 
                required
                value={formData.address || ''} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-offoOrange focus:ring-offoOrange border p-2"
                rows={3}
                placeholder="Building, Street, Area..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.manager || ''} 
                  onChange={(e) => setFormData({...formData, manager: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-offoOrange focus:ring-offoOrange border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input 
                  required
                  type="tel" 
                  value={formData.contact || ''} 
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-offoOrange focus:ring-offoOrange border p-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input 
                    type="text" 
                    value={formData.latitude || ''} 
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-offoOrange focus:ring-offoOrange border p-2"
                    placeholder="12.9716"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input 
                    type="text" 
                    value={formData.longitude || ''} 
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-offoOrange focus:ring-offoOrange border p-2"
                    placeholder="77.5946"
                    />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select 
                value={formData.status || 'Active'} 
                onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Disabled'})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-offoOrange focus:ring-offoOrange border p-2"
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Branch</Button>
            </div>
         </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, branchId: null })}
        title="Confirm Deletion"
        footer={
            <>
                <Button variant="ghost" onClick={() => setDeleteConfirmation({ isOpen: false, branchId: null })}>Cancel</Button>
                <Button variant="danger" onClick={confirmDeleteBranch}>Delete</Button>
            </>
        }
      >
          <p className="text-gray-600">Are you sure you want to delete this branch? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};
