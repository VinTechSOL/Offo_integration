import React, { useEffect, useState } from 'react';

import { useLocation } from '@/context/LocationContext';

import {
  AdditionalBranchDocument,
  BranchFormData,
  initialBranchFormData,
} from './BranchFormtypes';

const MAX_IMAGE_SIZE = 400 * 1024; // 400 KB
const MAX_DOCUMENT_SIZE = 1 * 1024 * 1024; // 1 MB

/* =========================================================
   PDF BADGE
========================================================= */

const PdfBadge: React.FC<{
  fileName: string;
  fileSize?: number;
}> = ({ fileName, fileSize }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <svg
        className="w-8 h-8 shrink-0 text-red-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M4 18h12a2 2 0 002-2V6l-4-4H4a2 2 0 00-2 2v12a2 2 0 002 2zm0-14h7v4h4v10H4V4z" />
      </svg>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{fileName}</p>

        <p className="text-xs text-red-500">
          PDF Document
          {fileSize ? ` • ${(fileSize / (1024 * 1024)).toFixed(2)} MB` : ''}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   FILE PREVIEW
========================================================= */

interface FilePreviewProps {
  file: File | null;
  existingUrl?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, existingUrl }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* -------------------------------------------------------
     Create object URL only when File changes
  ------------------------------------------------------- */

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /* -------------------------------------------------------
     New file
  ------------------------------------------------------- */

  if (file) {
    if (file.type.startsWith('image/') && previewUrl) {
      return (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500">New file preview</p>

          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="h-40 max-w-full object-cover rounded-lg border"
          />
        </div>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500">New file</p>

          <PdfBadge fileName={file.name} fileSize={file.size} />
        </div>
      );
    }

    return (
      <div className="mt-3">
        <p className="text-sm text-gray-600">{file.name}</p>
      </div>
    );
  }

  /* -------------------------------------------------------
     Existing file
  ------------------------------------------------------- */

  if (existingUrl) {
    const cleanUrl = existingUrl.split('?')[0];

    const isPdf = cleanUrl.toLowerCase().endsWith('.pdf');

    const fileName = cleanUrl.split('/').pop() || 'Existing document';

    if (isPdf) {
      return (
        <div className="mt-3 space-y-3">
          <p className="text-xs font-medium text-gray-500">Existing document</p>

          <PdfBadge fileName={fileName} />

          <a
            href={existingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View PDF →
          </a>
        </div>
      );
    }

    return (
      <div className="mt-3 space-y-3">
        <p className="text-xs font-medium text-gray-500">Existing document</p>

        <img
          src={existingUrl}
          alt="Existing document"
          className="h-40 max-w-full object-cover rounded-lg border"
        />

        <a
          href={existingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Open document →
        </a>
      </div>
    );
  }

  return null;
};

/* =========================================================
   PROPS
========================================================= */

interface BranchFormProps {
  mode?: 'create' | 'edit';

  initialBranchName?: string;

  initialData?: Partial<BranchFormData>;

  submitText?: string;

  onSubmit: (data: BranchFormData) => void | Promise<void>;

  onBack?: () => void;

  submitting?: boolean;
}

/* =========================================================
   COMPONENT
========================================================= */

export const BranchForm: React.FC<BranchFormProps> = ({
  mode = 'create',
  initialBranchName = '',
  initialData = {},
  submitText,
  onSubmit,
  onBack,
  submitting = false,
}) => {
  const {
    cities,
    campuses,
    buildings,
    setSelectedCityId,
    setSelectedCampusId,
  } = useLocation();

  /* =======================================================
     INITIAL FORM
  ======================================================= */

  const getInitialForm = (): BranchFormData => ({
    ...initialBranchFormData,

    branchName: initialBranchName,

    ...initialData,
  });

  const [form, setForm] = useState<BranchFormData>(getInitialForm);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [sameAddress, setSameAddress] = useState(false);

  const [error, setError] = useState('');

  /* =======================================================
     IMAGE OBJECT URL CLEANUP
  ======================================================= */

  useEffect(() => {
    if (!form.imageFile) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(form.imageFile);

    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.imageFile]);

  /* =======================================================
     INITIAL LOCATION STATE
  ======================================================= */

  useEffect(() => {
    setSelectedCityId(form.cityId);

    if (form.campusId) {
      setSelectedCampusId(form.campusId);
    }

    setSameAddress(
      form.registeredAddress !== '' &&
        form.registeredAddress === form.businessAddress,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDocumentFile = (
    file: File | null,
    onValid: (file: File | null) => void,
  ) => {
    if (!file) {
      onValid(null);
      return;
    }

    const isAllowedType =
      file.type === 'application/pdf' || file.type.startsWith('image/');

    if (!isAllowedType) {
      setError('Only PDF or image files are allowed.');
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      setError('Document must be 1 MB or smaller.');
      return;
    }

    onValid(file);
    setError('');
  };

  /* =======================================================
     GENERIC FIELD UPDATE
  ======================================================= */

  const updateField = <K extends keyof BranchFormData>(
    field: K,
    value: BranchFormData[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError('');
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Branch image must be 400 KB or smaller.');
      e.target.value = '';
      return;
    }

    updateField('imageFile', file);

    setError('');
  };

  /* =======================================================
     LOCATION
  ======================================================= */

  const handleCityChange = (cityId: string) => {
    setForm((prev) => ({
      ...prev,

      cityId,

      campusId: '',
      buildingId: '',
    }));

    setSelectedCityId(cityId);

    setSelectedCampusId('');

    setError('');
  };

  const handleCampusChange = (campusId: string) => {
    setForm((prev) => ({
      ...prev,

      campusId,

      buildingId: '',
    }));

    setSelectedCampusId(campusId);

    setError('');
  };

  /* =======================================================
     ADDRESS
  ======================================================= */

  const handleSameAddress = (checked: boolean) => {
    setSameAddress(checked);

    if (checked) {
      updateField('businessAddress', form.registeredAddress);
    }
  };

  /* =======================================================
     ADDITIONAL DOCUMENTS
  ======================================================= */

  const addDocument = () => {
    const document: AdditionalBranchDocument = {
      id: crypto.randomUUID(),

      documentName: '',

      file: null,

      existingUrl: undefined,
    };

    setForm((prev) => ({
      ...prev,

      documents: [...prev.documents, document],
    }));
  };

  const updateDocumentName = (id: string, documentName: string) => {
    setForm((prev) => ({
      ...prev,

      documents: prev.documents.map((document) =>
        document.id === id
          ? {
              ...document,
              documentName,
            }
          : document,
      ),
    }));
  };

  const updateDocumentFile = (id: string, file: File | null) => {
    setForm((prev) => ({
      ...prev,

      documents: prev.documents.map((document) =>
        document.id === id
          ? {
              ...document,
              file,
            }
          : document,
      ),
    }));

    setError('');
  };

  const removeDocument = (id: string) => {
    setForm((prev) => ({
      ...prev,

      documents: prev.documents.filter((document) => document.id !== id),
    }));
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!form.branchName.trim()) {
      return 'Branch name is required.';
    }

    if (!form.cityId) {
      return 'Please select a city.';
    }

    if (!form.campusId) {
      return 'Please select a campus.';
    }

    if (!form.opensAt) {
      return 'Opening time is required.';
    }

    if (!form.closesAt) {
      return 'Closing time is required.';
    }

    if (form.opensAt >= form.closesAt) {
      return 'Closing time must be later than opening time.';
    }

    if (!form.ownerPhoneNumber.trim()) {
      return 'Owner phone number is required.';
    }

    if (!/^[0-9]{10}$/.test(form.ownerPhoneNumber)) {
      return 'Owner phone number must contain 10 digits.';
    }

    if (
      form.ownerEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)
    ) {
      return 'Please enter a valid owner email address.';
    }

    /*
     * Validate additional documents.
     *
     * Existing documents are valid even
     * though file === null because they
     * already exist in S3.
     */

    for (const document of form.documents) {
      const hasNewFile = !!document.file;

      const hasExistingFile = !!document.existingUrl;

      const hasName = !!document.documentName.trim();

      if (!hasName && hasNewFile) {
        return 'Please enter a name for every uploaded document.';
      }

      if (hasName && !hasNewFile && !hasExistingFile) {
        return `Please upload a file for "${document.documentName}".`;
      }
    }

    return null;
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    await onSubmit(form);
  };

  const buttonText =
    submitText ?? (mode === 'edit' ? 'Save Changes' : 'Create Branch');

  /* =======================================================
     UI
  ======================================================= */

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

          <p className="text-sm text-gray-500 mt-1">
            Branch identity, location and operating hours.
          </p>
        </div>

        {/* Branch Name */}

        <div>
          <label className="text-sm font-semibold">Branch Name *</label>

          <input
            value={form.branchName}
            onChange={(e) => updateField('branchName', e.target.value)}
            placeholder="Enter branch name"
            className="border p-3 rounded-lg w-full mt-1"
          />
        </div>

        {/* City */}

        <div>
          <label className="text-sm font-semibold">City *</label>

          <select
            value={form.cityId}
            onChange={(e) => handleCityChange(e.target.value)}
            className="border p-3 rounded-lg w-full mt-1"
          >
            <option value="">Select City</option>

            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campus */}

        <div>
          <label className="text-sm font-semibold">Campus *</label>

          <select
            value={form.campusId}
            onChange={(e) => handleCampusChange(e.target.value)}
            disabled={!form.cityId}
            className="border p-3 rounded-lg w-full mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Campus</option>

            {campuses
              .filter((campus) => campus.cityId === form.cityId)
              .map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
          </select>
        </div>

        {/* Building */}

        <div>
          <label className="text-sm font-semibold">Building</label>

          <select
            value={form.buildingId}
            onChange={(e) => updateField('buildingId', e.target.value)}
            disabled={!form.campusId}
            className="border p-3 rounded-lg w-full mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Building</option>

            {buildings
              .filter((building) => building.campusId === form.campusId)
              .map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
          </select>
        </div>

        {/* Operating Hours */}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">Opens At *</label>

            <input
              type="time"
              value={form.opensAt}
              onChange={(e) => updateField('opensAt', e.target.value)}
              className="border p-3 rounded-lg w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Closes At *</label>

            <input
              type="time"
              value={form.closesAt}
              onChange={(e) => updateField('closesAt', e.target.value)}
              className="border p-3 rounded-lg w-full mt-1"
            />
          </div>
        </div>

        {/* Branch Image */}

        <div>
          <label className="text-sm font-semibold">Branch Image</label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="block mt-2"
          />

          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, WebP • Maximum size: 400 KB
          </p>

          {imagePreview ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                New image preview
              </p>

              <img
                src={imagePreview}
                alt="New branch preview"
                className="h-44 w-full object-contain rounded-lg border bg-gray-50"
              />
            </div>
          ) : form.imageUrl ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Existing branch image
              </p>

              <img
                src={form.imageUrl}
                alt="Existing branch"
                className="h-44 w-full object-contain rounded-lg border bg-gray-50"
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* =====================================================
          BUSINESS DETAILS
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold">Business Details</h2>

          <p className="text-sm text-gray-500 mt-1">
            Registered and operating information for this branch.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold">Registered Address</label>

          <textarea
            value={form.registeredAddress}
            onChange={(e) => {
              const value = e.target.value;

              updateField('registeredAddress', value);

              if (sameAddress) {
                updateField('businessAddress', value);
              }
            }}
            rows={3}
            placeholder="Enter registered address"
            className="border p-3 rounded-lg w-full mt-1"
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={sameAddress}
            onChange={(e) => handleSameAddress(e.target.checked)}
          />
          Business address is same as registered address
        </label>

        <div>
          <label className="text-sm font-semibold">Business Address</label>

          <textarea
            value={form.businessAddress}
            disabled={sameAddress}
            onChange={(e) => updateField('businessAddress', e.target.value)}
            rows={3}
            placeholder="Enter business address"
            className="border p-3 rounded-lg w-full mt-1 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Business Type</label>

          <select
            value={form.businessType}
            onChange={(e) => updateField('businessType', e.target.value)}
            className="border p-3 rounded-lg w-full mt-1"
          >
            <option value="">Select Business Type</option>

            <option value="PROPRIETORSHIP">Proprietorship</option>

            <option value="PARTNERSHIP">Partnership</option>

            <option value="LLP">LLP</option>

            <option value="PRIVATE_LIMITED">Private Limited</option>

            <option value="PUBLIC_LIMITED">Public Limited</option>

            <option value="OTHER">Other</option>
          </select>
        </div>
      </section>

      {/* =====================================================
          COMPLIANCE
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">Compliance</h2>

          <p className="text-sm text-gray-500 mt-1">
            FSSAI and GST registration details.
          </p>
        </div>

        {/* FSSAI */}

        <div className="space-y-3">
          <h3 className="font-semibold">FSSAI</h3>

          <input
            value={form.fssaiLicenseNumber}
            onChange={(e) => updateField('fssaiLicenseNumber', e.target.value)}
            placeholder="FSSAI License Number"
            className="border p-3 rounded-lg w-full"
          />

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) =>
              handleDocumentFile(e.target.files?.[0] ?? null, (file) =>
                updateField('fssaiDocument', file),
              )
            }
          />

          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, JPG, PNG, WebP • Maximum size: 1 MB
          </p>

          <FilePreview
            file={form.fssaiDocument}
            existingUrl={form.fssaiDocumentUrl}
          />
        </div>

        <hr />

        {/* GST */}

        <div className="space-y-3">
          <h3 className="font-semibold">GST</h3>

          <input
            value={form.gstRegistrationNumber}
            onChange={(e) =>
              updateField('gstRegistrationNumber', e.target.value)
            }
            placeholder="GST Registration Number"
            className="border p-3 rounded-lg w-full"
          />

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) =>
              handleDocumentFile(e.target.files?.[0] ?? null, (file) =>
                updateField('gstDocument', file),
              )
            }
          />

          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, JPG, PNG, WebP • Maximum size: 1 MB
          </p>

          <FilePreview
            file={form.gstDocument}
            existingUrl={form.gstDocumentUrl}
          />
        </div>
      </section>

      {/* =====================================================
          BANK DETAILS
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold">Bank Details</h2>

          <p className="text-sm text-gray-500 mt-1">
            Settlement account information.
          </p>
        </div>

        <input
          value={form.accountHolderName}
          onChange={(e) => updateField('accountHolderName', e.target.value)}
          placeholder="Account Holder Name"
          className="border p-3 rounded-lg w-full"
        />

        <input
          value={form.bankAccountNumber}
          onChange={(e) =>
            updateField('bankAccountNumber', e.target.value.replace(/\D/g, ''))
          }
          inputMode="numeric"
          placeholder="Bank Account Number"
          className="border p-3 rounded-lg w-full"
        />

        <input
          value={form.ifscCode}
          onChange={(e) =>
            updateField('ifscCode', e.target.value.toUpperCase())
          }
          placeholder="IFSC Code"
          className="border p-3 rounded-lg w-full"
        />

        <div>
          <label className="text-sm font-semibold">Bank Passbook / Proof</label>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) =>
              handleDocumentFile(e.target.files?.[0] ?? null, (file) =>
                updateField('bankPassbook', file),
              )
            }
            className="block mt-2"
          />

          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, JPG, PNG, WebP • Maximum size: 1 MB
          </p>

          <FilePreview
            file={form.bankPassbook}
            existingUrl={form.bankPassbookUrl}
          />
        </div>
      </section>

      {/* =====================================================
          OWNER DETAILS
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold">Owner Details</h2>

          <p className="text-sm text-gray-500 mt-1">
            Registered owner contact and verification details.
          </p>
        </div>

        <input
          value={form.registeredOwnerName}
          onChange={(e) => updateField('registeredOwnerName', e.target.value)}
          placeholder="Registered Owner Name"
          className="border p-3 rounded-lg w-full"
        />

        <div>
          <label className="text-sm font-semibold">Owner Phone Number *</label>

          <input
            type="tel"
            inputMode="numeric"
            value={form.ownerPhoneNumber}
            onChange={(e) =>
              updateField(
                'ownerPhoneNumber',
                e.target.value.replace(/\D/g, '').slice(0, 10),
              )
            }
            maxLength={10}
            placeholder="10-digit phone number"
            className="border p-3 rounded-lg w-full mt-1"
          />

          <p className="text-xs text-gray-500 mt-1">
            This number will be used for vendor password recovery and OTP
            verification.
          </p>
        </div>

        <input
          type="email"
          value={form.ownerEmail}
          onChange={(e) => updateField('ownerEmail', e.target.value)}
          placeholder="Owner Email"
          className="border p-3 rounded-lg w-full"
        />

        <div>
          <label className="text-sm font-semibold">Owner Proof Document</label>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) =>
              handleDocumentFile(e.target.files?.[0] ?? null, (file) =>
                updateField('ownerProofDocument', file),
              )
            }
            className="block mt-2"
          />

          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, JPG, PNG, WebP • Maximum size: 1 MB
          </p>

          <FilePreview
            file={form.ownerProofDocument}
            existingUrl={form.ownerProofDocumentUrl}
          />
        </div>
      </section>

      {/* =====================================================
          COORDINATES
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold">Coordinates</h2>

          <p className="text-sm text-gray-500 mt-1">
            Optional precise branch location.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => updateField('latitude', e.target.value)}
            placeholder="Latitude"
            className="border p-3 rounded-lg w-full"
          />

          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => updateField('longitude', e.target.value)}
            placeholder="Longitude"
            className="border p-3 rounded-lg w-full"
          />
        </div>
      </section>

      {/* =====================================================
          ADDITIONAL DOCUMENTS
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold">Additional Documents</h2>

          <p className="text-sm text-gray-500 mt-1">
            Upload any additional branch-related documents.
          </p>
        </div>

        {form.documents.map((document, index) => (
          <div key={document.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">
                Document {index + 1}
              </span>

              <button
                type="button"
                onClick={() => removeDocument(document.id)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>

            <input
              value={document.documentName}
              onChange={(e) => updateDocumentName(document.id, e.target.value)}
              placeholder="Document Name"
              className="border p-3 rounded-lg w-full"
            />

            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) =>
                handleDocumentFile(e.target.files?.[0] ?? null, (file) =>
                  updateDocumentFile(document.id, file),
                )
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, JPG, PNG, WebP • Maximum size: 1 MB
            </p>

            <FilePreview
              file={document.file}
              existingUrl={document.existingUrl}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addDocument}
          className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50"
        >
          + Add Document
        </button>
      </section>

      {/* =====================================================
          STATUS
      ===================================================== */}

      <section className="border border-gray-200 rounded-xl p-6">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="font-semibold">Branch Active</p>

            <p className="text-sm text-gray-500">
              Allow this branch to operate on the platform.
            </p>
          </div>

          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField('isActive', e.target.checked)}
            className="w-5 h-5"
          />
        </label>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* =====================================================
          BUTTONS
      ===================================================== */}

      <div className="flex justify-end gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="border border-gray-300 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Back
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-7 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? 'Saving...' : buttonText}
        </button>
      </div>
    </form>
  );
};
