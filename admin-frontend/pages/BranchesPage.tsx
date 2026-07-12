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
              buildingId: b.building_id ? String(b.building_id) : undefined,
              buildingName: b.building_name,
              opensAt: b.opens_at,
              closesAt: b.closes_at,
              imageUrl: b.image_url,
              hasVendor: b.has_vendor,
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

        setBranches(prev =>
          prev.map(b =>
            b.id === branch.id
              ? { ...b, hasVendor: true}
              : b
          )
        );

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

        setBranches(prev =>
          prev.map(b =>
            b.id === branch.id
              ? { ...b, hasVendor: false}
              : b
          )
        );

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

  const handleSaveVendor = async () => 
  {

    if (!selectedBranch) return;

    try {

      if (vendorStaffId) {

        await StaffApi.updateVendor(
          vendorStaffId,
          {  
            first_name: credentialForm.firstName,
            last_name: credentialForm.lastName,
            username: credentialForm.username,
            is_active: credentialForm.isActive,
          }
        );

      } else {

        await StaffApi.createVendor({
          first_name: credentialForm.firstName,
          last_name: credentialForm.lastName,
          username: credentialForm.username,
          password: credentialForm.password,
          branch_id: Number(selectedBranch.id),
        });


        setBranches(prev =>
          prev.map(b =>
            b.id === selectedBranch.id
              ? { ...b, hasVendor: true}
              : b
          )
        );

      }

      setCredentialModalOpen(false);

      openCredentialModal(selectedBranch);

    } catch (err) {

      console.error(err);

      alert("Failed to save vendor");

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
        password: result.new_password,
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

    setFormData({
      name: branch.name,

      cityId: branch.cityId,
      campusId: branch.campusId,

      buildingId: branch.buildingId,

      opensAt: branch.opensAt,
      closesAt: branch.closesAt,

      status: branch.status,
    });

    setIsEditModalOpen(true);

  };

  const handleBranchSave = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!editingBranch) return;

    try {

      const updated = await CafeApi.updateBranch(
        Number(editingBranch.id),
        {
          branch_name: formData.name || "",

          city_id: Number(formData.cityId),

          campus_id: Number(formData.campusId),

          building_id: formData.buildingId
            ? Number(formData.buildingId)
            : null,

          opens_at: formData.opensAt || "",

          closes_at: formData.closesAt || "",

          is_active:
            formData.status === "Active",
        }
      );

      setBranches(prev =>
        prev.map(branch =>
          branch.id === editingBranch.id
            ? {
                ...branch,

                name: updated.branch_name,

                cityId: String(updated.city_id),

                campusId: String(updated.campus_id),

                buildingId: updated.building_id
                  ? String(updated.building_id)
                  : undefined,

                buildingName: updated.building_name,

                opensAt: updated.opens_at,

                closesAt: updated.closes_at,

                status: updated.is_active
                  ? "Active"
                  : "Disabled",
              }
            : branch
        )
      );

      setIsEditModalOpen(false);

      setEditingBranch(null);

    } catch (err) {

      console.error(err);

      alert("Failed to update branch");

    }

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
            onClick={() => navigate(constants.routes.ADD_LOCATION)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Location
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
                    className={`px-3 py-1.5 rounded-lg text-xs w-full font-medium ${
                      b.hasVendor
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {b.hasVendor ? "✓ View Credentials" : "Issue Credentials"}
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

      {/* ================= Edit Branch Modal ================= */}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Branch"
      >

        <form
          onSubmit={handleBranchSave}
          className="space-y-4"
        >

          <FormField
            label="Branch Name"
            value={formData.name || ""}
            onChange={(e: any) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <FormField
            type="time"
            label="Opening Time"
            value={formData.opensAt || ""}
            onChange={(e: any) =>
              setFormData({
                ...formData,
                opensAt: e.target.value,
              })
            }
          />


          <FormField
            type="time"
            label="Closing Time"
            value={formData.closesAt || ""}
            onChange={(e: any) =>
              setFormData({
                ...formData,
                closesAt: e.target.value,
              })
            }
          />

          <div className="flex justify-end gap-3">

            <Button
              variant="ghost"
              onClick={() =>
                setIsEditModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button type="submit">
              Save Changes
            </Button>

          </div>

        </form>

      </Modal>



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

                <div className="space-y-2">

                  <div className="flex justify-between items-center">

                    <span>Password</span>

                    <div className="flex items-center gap-3">

                      <span className="text-gray-500">
                        {credentialForm.password
                          ? credentialForm.password
                          : "Password hidden"}
                      </span>

                      <button
                        onClick={handleResetPassword}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Reset Password
                      </button>

                    </div>
            
                  </div>

                  {!credentialForm.password && (
                    <p className="text-xs text-gray-500">
                      Passwords cannot be viewed after creation for security reasons.
                      Click <strong>Reset Password</strong> to generate a temporary password only if one don't remember the password,
                      then share it with the vendor.
                    </p>
                  )}

                </div>

              </div>

              <div className="flex justify-end gap-3">

                <Button onClick={() => setCredentialModalOpen(false)}>
                  Close
                </Button>

                <Button 
                  onClick={ () => {
                    setIsEditingCredential(true);
                  }}
                >
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


              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">

                <p className="text-sm text-amber-800 font-medium">
                  Password cannot be viewed or edited.
                </p>

                <p className="text-xs text-amber-700 mt-1">
                  If the vendor forgets the password, use
                  <strong> Reset Password</strong> from the credentials screen.
                  A temporary password will be generated.
                </p>

              </div>


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

const FormField = ({ label, value, onChange, type = "text" }: any) => (

  <div>

    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg p-2"
    />

  </div>

);