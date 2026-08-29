export interface AdditionalBranchDocument {
  id: string;

  // Existing DB document ID.
  // undefined means this is a newly added document.
  documentId?: number;

  documentName: string;

  // New file selected by the admin.
  file: File | null;

  // Existing file already stored in S3.
  existingUrl?: string;
}

export interface BranchFormData {
  // =========================================================
  // Basic
  // =========================================================

  branchName: string;

  cityId: string;
  campusId: string;
  buildingId: string;

  opensAt: string;
  closesAt: string;

  imageFile: File | null;
  imageUrl?: string;

  // =========================================================
  // Location
  // =========================================================

  latitude: string;
  longitude: string;

  // =========================================================
  // Business
  // =========================================================

  registeredAddress: string;
  businessAddress: string;
  businessType: string;

  // =========================================================
  // Compliance
  // =========================================================

  fssaiLicenseNumber: string;

  fssaiDocument: File | null;
  fssaiDocumentUrl?: string;

  gstRegistrationNumber: string;

  gstDocument: File | null;
  gstDocumentUrl?: string;

  // =========================================================
  // Bank
  // =========================================================

  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;

  bankPassbook: File | null;
  bankPassbookUrl?: string;

  // =========================================================
  // Owner
  // =========================================================

  registeredOwnerName: string;
  ownerPhoneNumber: string;
  ownerEmail: string;

  ownerProofDocument: File | null;
  ownerProofDocumentUrl?: string;

  // =========================================================
  // Status
  // =========================================================

  isActive: boolean;

  // =========================================================
  // Additional Documents
  // =========================================================

  documents: AdditionalBranchDocument[];
}

export const initialBranchFormData: BranchFormData = {
  // Basic

  branchName: "",

  cityId: "",
  campusId: "",
  buildingId: "",

  opensAt: "08:00",
  closesAt: "22:00",

  imageFile: null,
  imageUrl: undefined,

  // Location

  latitude: "",
  longitude: "",

  // Business

  registeredAddress: "",
  businessAddress: "",
  businessType: "",

  // Compliance

  fssaiLicenseNumber: "",
  fssaiDocument: null,
  fssaiDocumentUrl: undefined,

  gstRegistrationNumber: "",
  gstDocument: null,
  gstDocumentUrl: undefined,

  // Bank

  bankAccountNumber: "",
  ifscCode: "",
  accountHolderName: "",

  bankPassbook: null,
  bankPassbookUrl: undefined,

  // Owner

  registeredOwnerName: "",
  ownerPhoneNumber: "",
  ownerEmail: "",

  ownerProofDocument: null,
  ownerProofDocumentUrl: undefined,

  // Status

  isActive: true,

  // Additional documents

  documents: [],
};