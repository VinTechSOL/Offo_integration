export interface AdditionalBranchDocument {
  id: string;
  documentName: string;
  file: File | null;
}

export interface BranchFormData {
  // Basic
  branchName: string;
  cityId: string;
  campusId: string;
  buildingId: string;

  opensAt: string;
  closesAt: string;

  imageFile: File | null;
  imageUrl?: string;

  // Location coordinates
  latitude: string;
  longitude: string;

  // Business
  registeredAddress: string;
  businessAddress: string;
  businessType: string;

  // Compliance
  fssaiLicenseNumber: string;
  fssaiDocument: File | null;

  gstRegistrationNumber: string;
  gstDocument: File | null;

  // Bank
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankPassbook: File | null;

  // Owner
  registeredOwnerName: string;
  ownerPhoneNumber: string;
  ownerEmail: string;
  ownerProofDocument: File | null;

  // Status
  isActive: boolean;

  // Additional documents
  documents: AdditionalBranchDocument[];
}

export const initialBranchFormData: BranchFormData = {
  branchName: "",

  cityId: "",
  campusId: "",
  buildingId: "",

  opensAt: "08:00",
  closesAt: "22:00",

  imageFile: null,

  latitude: "",
  longitude: "",

  registeredAddress: "",
  businessAddress: "",
  businessType: "",

  fssaiLicenseNumber: "",
  fssaiDocument: null,

  gstRegistrationNumber: "",
  gstDocument: null,

  bankAccountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  bankPassbook: null,

  registeredOwnerName: "",
  ownerPhoneNumber: "",
  ownerEmail: "",
  ownerProofDocument: null,

  isActive: true,

  documents: [],
};