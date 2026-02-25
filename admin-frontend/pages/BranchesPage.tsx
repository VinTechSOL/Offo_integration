import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { constants } from '../constants';
import { Branch } from '../types';
import { useBranch } from '../context/BranchContext';
import { useCafe } from '../context/CafeContext';
import { useNavigate } from 'react-router-dom';

export const BranchesPage: React.FC = () => {
  const {
    branches,
    setBranches,
    staffList,
    setStaffList
  } = useBranch();

  const { cafes } = useCafe();
  const navigate = useNavigate();

  /* ================= State ================= */

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});

  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditingCredential, setIsEditingCredential] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const [credentialForm, setCredentialForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    isActive: true,
    createdAt: '',
    lastReset: ''
  });

  /* ================= Helpers ================= */

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  /* ================= Credential Logic ================= */

  const openCredentialModal = (branch: Branch) => {
    const existingVendor = staffList.find(
      s => s.branchId === branch.id && s.role === 'VENDOR'
    );

    setSelectedBranch(branch);

    if (existingVendor) {
      setCredentialForm({
        firstName: existingVendor.firstName,
        lastName: existingVendor.lastName,
        username: existingVendor.username,
        password: existingVendor.password,
        isActive: existingVendor.isActive,
        createdAt: existingVendor.createdAt,
        lastReset: existingVendor.lastReset || existingVendor.createdAt
      });
      setIsEditingCredential(false);
    } else {
      setCredentialForm({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        isActive: true,
        createdAt: '',
        lastReset: ''
      });
      setIsEditingCredential(true);
    }

    setCredentialModalOpen(true);
  };

  const handleSaveVendor = () => {
    if (!selectedBranch) return;

    const now = new Date().toISOString();

    const existingIndex = staffList.findIndex(
      s => s.branchId === selectedBranch.id && s.role === 'VENDOR'
    );

    if (existingIndex !== -1) {
      const updated = [...staffList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...credentialForm,
        lastReset: now
      };
      setStaffList(updated);
    } else {
      const newStaff = {
        id: Date.now().toString(),
        branchId: selectedBranch.id,
        role: 'VENDOR' as const,
        firstName: credentialForm.firstName,
        lastName: credentialForm.lastName,
        username: credentialForm.username,
        password: credentialForm.password,
        isActive: credentialForm.isActive,
        createdAt: now,
        lastReset: now
      };
      setStaffList(prev => [...prev, newStaff]);
      setCredentialForm(prev => ({
        ...prev,
        createdAt: now,
        lastReset: now
      }));
    }

    setIsEditingCredential(false);
  };

  const handleResetPassword = () => {
    const newPass = Math.random().toString(36).slice(-8);
    const now = new Date().toISOString();

    setCredentialForm(prev => ({
      ...prev,
      password: newPass,
      lastReset: now
    }));
  };

  const handleCopyCredentials = () => {
    const text = `Username: ${credentialForm.username}
Password: ${credentialForm.password}`;

    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  /* ================= Branch Edit ================= */

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData(branch);
    setIsEditModalOpen(true);
  };

  const handleBranchSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    setBranches(
      branches.map(b =>
        b.id === editingBranch.id ? { ...b, ...formData } as Branch : b
      )
    );

    setIsEditModalOpen(false);
  };

  const handleViewOrders = (branchId: string) => {
    navigate(`${constants.routes.ORDERS}?branchId=${branchId}`);
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Branch Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage branches and vendor access credentials
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(constants.routes.VIEW_CAFES)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            View Cafes
          </button>

          <button
            onClick={() => navigate(constants.routes.ADD_VENDOR)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Vendor
          </button>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(b => {
          const cafe = cafes.find(c => c.id === b.cafeId);
          const vendor = staffList.find(
            s => s.branchId === b.id && s.role === 'VENDOR'
          );

          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex gap-6">

                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      className="w-full h-full object-cover"
                      alt="Branch"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
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

                {/* Actions */}
                <div className="flex flex-col justify-between items-end w-44">

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      b.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {b.status}
                  </span>

                  <button
                    onClick={() => openCredentialModal(b)}
                    className="border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition w-full"
                  >
                    {vendor ? 'View Credentials' : 'Issue Credentials'}
                  </button>

                  <button
                    onClick={() => openEditModal(b)}
                    className="border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition w-full"
                  >
                    Edit Branch
                  </button>

                  <button
                    onClick={() => handleViewOrders(b.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition w-full"
                  >
                    View Orders
                  </button>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= Credential Modal ================= */}

      <Modal
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        title="Vendor Credentials"
      >
        <div className="space-y-6">

          {!isEditingCredential ? (
            <>
              {/* Profile Section */}
              <div className="bg-gray-50 rounded-xl p-5 border">
                <p className="text-xs uppercase text-gray-400 font-semibold tracking-wide">
                  Vendor Profile
                </p>

                <div className="flex justify-between items-center mt-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {credentialForm.firstName} {credentialForm.lastName}
                  </h3>

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      credentialForm.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {credentialForm.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Credentials Section */}
              <div className="bg-white rounded-xl p-5 border shadow-sm space-y-4">

                <div className="flex justify-between items-center">
                  <p className="text-xs uppercase text-gray-400 font-semibold tracking-wide">
                    Access Credentials
                  </p>

                  <button
                    onClick={handleCopyCredentials}
                    className={`text-xs px-3 py-1.5 rounded-md transition font-medium ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {copied ? '✓ Copied' : 'Copy Credentials'}
                  </button>
                </div>

                <div className="flex justify-between items-center text-sm border-b pb-3">
                  <span className="text-gray-500 font-medium">Username</span>
                  <span className="font-semibold text-gray-900">
                    {credentialForm.username}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Password</span>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {showPassword
                        ? credentialForm.password
                        : '••••••••'}
                    </span>

                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>

                    <button
                      onClick={handleResetPassword}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
                  <div>
                    Issued On: {formatDate(credentialForm.createdAt)}
                  </div>
                  <div>
                    Last Reset:{' '}
                    {formatDate(
                      credentialForm.lastReset || credentialForm.createdAt
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setCredentialModalOpen(false)}
                >
                  Close
                </Button>

                <Button onClick={() => setIsEditingCredential(true)}>
                  Edit
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <FormField
                label="First Name"
                value={credentialForm.firstName}
                onChange={(e: any) =>
                  setCredentialForm({ ...credentialForm, firstName: e.target.value })
                }
              />
              <FormField
                label="Last Name"
                value={credentialForm.lastName}
                onChange={(e: any) =>
                  setCredentialForm({ ...credentialForm, lastName: e.target.value })
                }
              />
              <FormField
                label="Username"
                value={credentialForm.username}
                onChange={(e: any) =>
                  setCredentialForm({ ...credentialForm, username: e.target.value })
                }
              />
              <FormField
                label="Password"
                value={credentialForm.password}
                onChange={(e: any) =>
                  setCredentialForm({ ...credentialForm, password: e.target.value })
                }
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditingCredential(false)}
                >
                  Cancel
                </Button>

                <Button onClick={handleSaveVendor}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ================= Edit Branch Modal ================= */}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Branch"
      >
        <form onSubmit={handleBranchSave} className="space-y-4">
          <FormField
            label="Branch Name"
            value={formData.name || ''}
            onChange={(e: any) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
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
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

/* ================= Reusable Form Field ================= */

const FormField = ({
  label,
  value,
  onChange
}: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
    />
  </div>
);