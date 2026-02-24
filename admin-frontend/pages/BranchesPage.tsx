import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { constants } from '../constants';
import { Branch } from '../types';
import { useBranch } from '../context/BranchContext';
import { useCafe } from '../context/CafeContext';
import { useNavigate } from 'react-router-dom';

export const BranchesPage: React.FC = () => {
  const { branches, setBranches } = useBranch();
  const { cafes } = useCafe();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    branchId: string | null;
  }>({ isOpen: false, branchId: null });

  const openModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData(branch);
    setIsModalOpen(true);
  };

  const requestDeleteBranch = (id: string) => {
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
      setBranches(
        branches.map(b =>
          b.id === editingBranch.id ? { ...b, ...formData } as Branch : b
        )
      );
    }
    setIsModalOpen(false);
  };

  const handleViewOrders = (branchId: string) => {
    navigate(`${constants.routes.ORDERS}?branchId=${branchId}`);
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Branch Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all vendor branches and their details.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(constants.routes.VIEW_CAFES)}
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            View Cafes
          </button>

          <button
            onClick={() => navigate(constants.routes.ADD_VENDOR)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            + Add Vendor
          </button>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(b => {
          const cafe = cafes.find(c => c.id === b.cafeId);

          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex gap-5">

                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      alt="Branch"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Middle Content */}
                <div className="flex-1 space-y-1">

                  <h3 className="text-lg font-semibold text-gray-900">
                    {b.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {b.campusName} • {b.buildingName || '—'}
                  </p>

                  <p className="text-xs text-gray-400">
                    {b.cityName}
                  </p>

                  <div className="pt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Cafe:</span>{' '}
                      <span className="font-medium text-gray-800">
                        {cafe?.name || '—'}
                      </span>
                    </div>

                    <div className="text-gray-600">
                      {cafe?.phone || '—'}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col justify-between items-end w-32">

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
                      b.status === 'Active'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {b.status}
                  </span>

                  <button
                    onClick={() => openModal(b)}
                    className="text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleViewOrders(b.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition"
                  >
                    View Orders
                  </button>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Branch"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Branch Name
            </label>
            <input
              required
              type="text"
              value={formData.name || ''}
              onChange={e =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={formData.status || 'Active'}
              onChange={e =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'Active' | 'Disabled'
                })
              }
              className="mt-1 w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, branchId: null })
        }
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() =>
                setDeleteConfirmation({
                  isOpen: false,
                  branchId: null
                })
              }
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteBranch}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete this branch?
        </p>
      </Modal>

    </div>
  );
};