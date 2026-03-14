import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { constants } from '../constants';
import { Branch } from '../types';
import { useBranch } from '../context/BranchContext';
import { useCafe } from '../context/CafeContext';
import { useNavigate } from 'react-router-dom';

import { CafeApi } from '@/apis/CafeApi';
import { StaffApi } from '@/apis/StaffApi';

export const BranchesPage: React.FC = () => {

  const { branches, setBranches } = useBranch();
  const { cafes, setCafes } = useCafe();

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

  const [vendorStaffId, setVendorStaffId] = useState<number | null>(null);

  const [credentialForm, setCredentialForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    isActive: true,
    createdAt: '',
    lastReset: ''
  });

  /* =========================================================
     LOAD CAFES + BRANCHES FROM BACKEND
  ========================================================= */

  useEffect(() => {

    const loadData = async () => {

      try {

        const cafesData = await CafeApi.getCafeterias();
        setCafes(
          cafesData.map((c: any) => ({
            id: String(c.cafe_id),
            name: c.cafe_name,
            phone: c.phone_number,
            email: c.email_id,
            isActive: c.is_active
          }))
        );

        /* ---------------- Load Branches in Parallel ---------------- */

        const branchResponses = await Promise.all(
          cafesData.map((cafe: any) =>
            CafeApi.getBranchesByCafe(cafe.cafe_id)
          )
        );

        const loadedBranches: Branch[] = [];

        branchResponses.forEach((branches: any[]) => {

          branches.forEach((b: any) => {

            loadedBranches.push({
              id: String(b.branch_id),
              cafeId: String(b.cafe_id),
              name: b.branch_name,
              cityId: String(b.city_id),
              cityName: b.city_name,
              campusId: String(b.campus_id),
              campusName: b.campus_name,
              buildingName: b.building_name,
              imageUrl: b.image_url,
              status: b.is_active ? "Active" : "Disabled"
            });

          });

        });

        setBranches(loadedBranches);

      } catch (err) {
        console.error("Failed loading branches", err);
      }

    };

    loadData();

  }, []);

  /* ================= Helpers ================= */

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  /* =========================================================
     LOAD VENDOR CREDENTIALS
  ========================================================= */

  const openCredentialModal = async (branch: Branch) => {

    setSelectedBranch(branch);

    try {

      const vendor = await StaffApi.getVendorByBranch(Number(branch.id));

      if (vendor) {

        setVendorStaffId(vendor.staff_id);

        setCredentialForm({
          firstName: vendor.first_name,
          lastName: vendor.last_name,
          username: vendor.username,
          password: "",
          isActive: vendor.is_active,
          createdAt: vendor.created_at,
          lastReset: vendor.created_at
        });

        setIsEditingCredential(false);

      } else {

        setVendorStaffId(null);

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

    } catch (err) {
      console.error("Vendor fetch failed", err);
    }

    setCredentialModalOpen(true);

  };

  /* =========================================================
     CREATE VENDOR
  ========================================================= */

  const handleSaveVendor = async () => {

    if (!selectedBranch) return;

    try {

      await StaffApi.createVendor({
        first_name: credentialForm.firstName,
        last_name: credentialForm.lastName,
        username: credentialForm.username,
        password: credentialForm.password,
        branch_id: Number(selectedBranch.id)
      });

      setIsEditingCredential(false);

    } catch (err) {

      console.error("Vendor creation failed", err);
      alert("Failed to create vendor");

    }

  };

  /* =========================================================
     RESET PASSWORD
  ========================================================= */

  const handleResetPassword = async () => {

    if (!vendorStaffId) return;

    try {

      const result = await StaffApi.resetVendorPassword(vendorStaffId);

      setCredentialForm(prev => ({
        ...prev,
        password: result.new_password
      }));

    } catch (err) {

      console.error("Reset failed", err);

    }

  };

  const handleCopyCredentials = () => {

    const text = `Username: ${credentialForm.username}
Password: ${credentialForm.password}`;

    navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => setCopied(false), 3000);

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

  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="space-y-10">

      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Vendors Management
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage branches and vendor access credentials
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => navigate(constants.routes.VIEW_CAFES)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            View Cafes
          </button>

          <button
            onClick={() => navigate(constants.routes.ADD_BRANCH)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Branch
          </button>

          <button
            onClick={() => navigate(constants.routes.ADD_VENDOR)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Vendor
          </button>

        </div>

      </div>

      {/* Branch Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {branches.map(b => {

          const cafe = cafes.find(c => c.id === b.cafeId);

          return (

            <div
              key={b.id}
              className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md"
            >

              <div className="flex gap-6">

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
                    className="border px-3 py-1.5 rounded-lg text-xs w-full"
                  >
                    Issue / View Credentials
                  </button>

                  <button
                    onClick={() => openEditModal(b)}
                    className="border px-3 py-1.5 rounded-lg text-xs w-full"
                  >
                    Edit Branch
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
              <div className="bg-gray-50 rounded-xl p-5 border">

                <p className="text-xs uppercase text-gray-400 font-semibold">
                  Vendor Profile
                </p>

                <h3 className="text-lg font-semibold mt-2">
                  {credentialForm.firstName} {credentialForm.lastName}
                </h3>

              </div>

              <div className="space-y-3">

                <div className="flex justify-between">
                  <span>Username</span>
                  <span>{credentialForm.username}</span>
                </div>

                <div className="flex justify-between">

                  <span>Password</span>

                  <div className="flex gap-2">

                    <span>
                      {showPassword
                        ? credentialForm.password
                        : '••••••••'}
                    </span>

                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Hide" : "Show"}
                    </button>

                    <button onClick={handleResetPassword}>
                      Reset
                    </button>

                  </div>

                </div>

              </div>

              <div className="flex justify-end gap-3">

                <Button onClick={() => setCredentialModalOpen(false)}>
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

              <div className="flex justify-end gap-3">

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

    </div>

  );

};

/* ================= Reusable Form Field ================= */

const FormField = ({ label, value, onChange }: any) => (

  <div>

    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>

    <input
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg p-2"
    />

  </div>

);