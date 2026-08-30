import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { constants } from '../constants';
import { Branch } from '../types';
import { useBranch } from '../context/BranchContext';
import { useCafe } from '../context/CafeContext';
import { useNavigate } from 'react-router-dom';
import { BranchForm } from '@/components/branch/BranchForm';
import { BranchFormData, initialBranchFormData, AdditionalBranchDocument } from '@/components/branch/BranchFormtypes';
import { CafeApi } from '@/apis/CafeApi';
import { StaffApi } from '@/apis/StaffApi';

export const BranchesPage: React.FC = () => {

  const { branches, setBranches } = useBranch();
  const { cafes, setCafes } = useCafe();

  const navigate = useNavigate();

  /* ================= State ================= */

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchFormData | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  const [isEditingCredential, setIsEditingCredential] = useState(false);
  const [copied, setCopied] = useState(false);

  const [vendorStaffId, setVendorStaffId] = useState<number | null>(null);

  const [createdVendor, setCreatedVendor] = useState<{
    firstName: string;
    lastName: string;
    username: string;
    temporaryPassword: string;
  } | null>(null);

  const [showVendorCreatedModal, setShowVendorCreatedModal] = useState(false);

  const [credentialForm, setCredentialForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
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
        const updatedVendor = await StaffApi.updateVendor(vendorStaffId, {
          first_name: credentialForm.firstName,
          last_name: credentialForm.lastName,
          username: credentialForm.username,
          is_active: credentialForm.isActive,
        });

        // Update the form with the values actually saved by backend
        setCredentialForm({
          firstName: updatedVendor.first_name,
          lastName: updatedVendor.last_name,
          username: updatedVendor.username,
          isActive: updatedVendor.is_active,
          createdAt: updatedVendor.created_at,
          lastReset: credentialForm.lastReset,
        });

        // Keep branch linked to vendor
        setBranches((prev) =>
          prev.map((b) =>
            b.id === selectedBranch?.id
              ? {
                  ...b,
                  hasVendor: true,
                }
              : b,
          ),
        );

        // Return to view mode
        setIsEditingCredential(false);
      } else {
        const result = await StaffApi.createVendor({
          first_name: credentialForm.firstName,
          last_name: credentialForm.lastName,
          username: credentialForm.username,
          branch_id: Number(selectedBranch.id),
        });

        setCreatedVendor({
          firstName: result.vendor.first_name,
          lastName: result.vendor.last_name,
          username: result.vendor.username,
          temporaryPassword: result.temporary_password,
        });

        setBranches((prev) =>
          prev.map((b) =>
            b.id === selectedBranch.id ? { ...b, hasVendor: true } : b,
          ),
        );

        setCredentialModalOpen(false);
        setShowVendorCreatedModal(true);
      }


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

      setCreatedVendor({
        firstName: credentialForm.firstName,
        lastName: credentialForm.lastName,
        username: credentialForm.username,
        temporaryPassword: result.new_password,
      });
      setCredentialModalOpen(false);
      setShowVendorCreatedModal(true);


    } catch (err) {

      console.error("Reset failed", err);

    }

  };

  const handleCopyCredentials = () => {
    if (!createdVendor) return;

    const text = `Vendor: ${createdVendor.firstName} ${createdVendor.lastName}

  Username: ${createdVendor.username}

  Temporary Password: ${createdVendor.temporaryPassword}`;

    navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => setCopied(false), 3000);
  };

  /* ================= Branch Edit ================= */

 const openEditModal = async (branch: Branch) => {
   try {
     const data = await CafeApi.getBranchById(Number(branch.id));

     /*
    |--------------------------------------------------------------------------
    | Convert backend branch → BranchFormData
    |--------------------------------------------------------------------------
    */

     const existingDocuments: AdditionalBranchDocument[] = (
       data.documents ?? []
     ).map((document) => ({
       id: `existing-${document.document_id}`,
       documentId: document.document_id,
       documentName: document.document_name,
       file: null,
       existingUrl: document.document_url,
     }));

     setEditingBranch({
       ...initialBranchFormData,

       // =====================================================
       // Basic
       // =====================================================

       branchName: data.branch_name,

       cityId: String(data.city_id),

       campusId: String(data.campus_id),

       buildingId: data.building_id !== null ? String(data.building_id) : '',

       opensAt: data.opens_at ? data.opens_at.slice(0, 5) : '',

       closesAt: data.closes_at ? data.closes_at.slice(0, 5) : '',

       imageFile: null,

       imageUrl: data.image_url ?? undefined,

       // =====================================================
       // Coordinates
       // =====================================================

       latitude: data.latitude !== null ? String(data.latitude) : '',

       longitude: data.longitude !== null ? String(data.longitude) : '',

       // =====================================================
       // Business
       // =====================================================

       registeredAddress: data.registered_address ?? '',

       businessAddress: data.business_address ?? '',

       businessType: data.business_type ?? '',

       // =====================================================
       // Compliance
       // =====================================================

       fssaiLicenseNumber: data.fssai_license_number ?? '',

       fssaiDocument: null,

       fssaiDocumentUrl: data.fssai_license_document_url ?? undefined,

       gstRegistrationNumber: data.gst_registration_number ?? '',

       gstDocument: null,

       gstDocumentUrl: data.gst_registration_document_url ?? undefined,

       // =====================================================
       // Bank
       // =====================================================

       bankAccountNumber: data.bank_account_number ?? '',

       ifscCode: data.ifsc_code ?? '',

       accountHolderName: data.account_holder_name ?? '',

       bankPassbook: null,

       bankPassbookUrl: data.bank_passbook_url ?? undefined,

       // =====================================================
       // Owner
       // =====================================================

       registeredOwnerName: data.registered_owner_name ?? '',

       ownerPhoneNumber: data.owner_phone_number ?? '',

       ownerEmail: data.owner_email ?? '',

       ownerProofDocument: null,

       ownerProofDocumentUrl: data.owner_proof_document_url ?? undefined,

       // =====================================================
       // Status
       // =====================================================

       isActive: data.is_active,

       // =====================================================
       // Additional Documents
       // =====================================================

       documents: existingDocuments,
     });

     /*
    |--------------------------------------------------------------------------
    | Set location context
    |
    | BranchForm also does this, but setting it here helps ensure
    | dependent Campus/Building options are ready when the form opens.
    |--------------------------------------------------------------------------
    */

     // Do NOT manually modify LocationContext here.
     // BranchForm handles city/campus initialization.

     setEditingBranchId(Number(branch.id));

     setIsEditModalOpen(true);
   } catch (err) {
     console.error('Failed to load branch details:', err);

     alert('Failed to load branch details.');
   }
 };

  const handleBranchSave = async (form: BranchFormData) => {
  if (!editingBranchId) return;

  try {
    await CafeApi.updateBranch(editingBranchId, form);

    // Fetch complete branch details after update
    const updated = await CafeApi.getBranchById(editingBranchId);

    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === String(editingBranchId)
          ? {
              ...branch,

              id: String(updated.branch_id),
              cafeId: String(updated.cafe_id),

              name: updated.branch_name,

              cityId: String(updated.city_id),
              cityName: updated.city_name ?? "",

              campusId: String(updated.campus_id),
              campusName: updated.campus_name ?? "",

              buildingId:
                updated.building_id !== null
                  ? String(updated.building_id)
                  : undefined,

              buildingName: updated.building_name ?? "",

              opensAt: updated.opens_at,
              closesAt: updated.closes_at,

              imageUrl: updated.image_url ?? undefined,

              status: updated.is_active
                ? "Active"
                : "Disabled",
            }
          : branch,
      ),
    );

    setEditingBranch(null);
    setEditingBranchId(null);
    setIsEditModalOpen(false);

  } catch (err) {
    console.error("Failed to update branch:", err);

    alert("Failed to update branch.");
  }
};


  const handleBranchStatusToggle = async (branch: Branch) => {
    try {
      const updated = await CafeApi.updateBranchStatus(
        Number(branch.id), 
        branch.status !== 'Active',
      );

      setBranches((prev) =>
        prev.map((b) =>
          b.id === branch.id
            ? {
                ...b,
                status: updated.is_active ? 'Active' : 'Disabled',
              }
            : b,
        ),
      );
    } catch (err) {
      console.error(err);

      alert('Unable to update branch status.');
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
        {branches.map((b) => {
          const cafe = cafes.find((c) => c.id === b.cafeId);

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

                  <p className="text-xs text-gray-400">{b.cityName}</p>

                  <div className="pt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Cafe:</span>{' '}
                      <span className="font-medium text-gray-800">
                        {cafe?.name || '—'}
                      </span>
                    </div>

                    <div className="text-gray-600">{cafe?.phone || '—'}</div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end w-44">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${
                        b.status === 'Active'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {b.status}
                    </span>

                    <button
                      onClick={() => handleBranchStatusToggle(b)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        b.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          b.status === 'Active'
                            ? 'translate-x-5'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    disabled={b.status !== 'Active'}
                    onClick={() => openCredentialModal(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs w-full font-medium ${
                      b.status !== 'Active'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : b.hasVendor
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {b.status !== 'Active'
                      ? 'Branch Disabled'
                      : b.hasVendor
                      ? '✓ View Credentials'
                      : 'Issue Credentials'}
                  </button>

                  <button
                    disabled={b.status !== 'Active'}
                    onClick={() => openEditModal(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs w-full font-medium ${
                      b.status !== 'Active'
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
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
        onClose={() => {
          setEditingBranch(null);
          setIsEditModalOpen(false);
        }}
        title="Edit Branch"
      >
        {editingBranch && (
          <BranchForm
            initialData={editingBranch}
            submitText="Save Changes"
            onSubmit={handleBranchSave}
            onBack={() => {
              setEditingBranch(null);
              setEditingBranchId(null);
              setIsEditModalOpen(false);
            }}
          />
        )}
      </Modal>

      {/* ================= Credential Modal ================= */}

      <Modal
        isOpen={credentialModalOpen}
        onClose={() => {
          setCredentialModalOpen(false);
          setSelectedBranch(null);
          setVendorStaffId(null);
          setIsEditingCredential(false);
        }}
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

                <p className="text-sm text-gray-500 mt-1">
                  {selectedBranch?.name}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Username</span>

                  <span>{credentialForm.username}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Password</span>

                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">Password hidden</span>

                      <button
                        onClick={handleResetPassword}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Note: Password cannot be viewed after creation. Reset Password to
                    generate a temporary password.
                  </p>
                
                </div>

                <div className="flex justify-between">
                  <span>Status</span>

                  <span
                    className={
                      credentialForm.isActive
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {credentialForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Created</span>

                  <span>{formatDate(credentialForm.createdAt)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>

                <input
                  value={credentialForm.firstName}
                  onChange={(e) =>
                    setCredentialForm({
                      ...credentialForm,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>

                <input
                  value={credentialForm.lastName}
                  onChange={(e) =>
                    setCredentialForm({
                      ...credentialForm,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>

                <input
                  value={credentialForm.username}
                  onChange={(e) =>
                    setCredentialForm({
                      ...credentialForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              {vendorStaffId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    Password cannot be edited. Use Reset Password instead.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditingCredential(false)}
                >
                  Cancel
                </Button>

                <Button onClick={handleSaveVendor}>Save</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showVendorCreatedModal}
        onClose={() => {
          setShowVendorCreatedModal(false);
          setCreatedVendor(null);

          if (selectedBranch) {
            openCredentialModal(selectedBranch);
          }
        }}
        title="Vendor Credentials Generated"
      >
        {createdVendor && (
          <div className="space-y-6">
            <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
              <div className="text-4xl mb-3">✅</div>

              <h3 className="text-lg font-semibold text-green-700">
                Credentials Generated Successfully
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Share these credentials securely with the vendor.
              </p>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Vendor</span>

                <span>
                  {createdVendor.firstName} {createdVendor.lastName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Username</span>

                <span>{createdVendor.username}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Temporary Password</span>

                <span className="font-mono text-blue-600">
                  {createdVendor.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                Share these credentials with the vendor. Ask them to log in once
                using the temporary password and immediately change it using the
                Forgot Password option.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCopyCredentials}>
                {copied ? 'Copied!' : 'Copy Credentials'}
              </Button>

              <Button
                onClick={() => {
                  setShowVendorCreatedModal(false);
                  setCreatedVendor(null);

                  if (selectedBranch) {
                    openCredentialModal(selectedBranch);
                  }
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

};

