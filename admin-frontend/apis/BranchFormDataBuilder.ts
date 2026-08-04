import { BranchFormData } from "@/components/branch/BranchFormtypes";

export const buildBranchFormData = (
  cafeId: string | number | null,
  data: BranchFormData,
) => {
  const formData = new FormData();

  /* ---------------- Basic ---------------- */

  if (cafeId !== null) {
    formData.append("cafe_id", String(cafeId));
  }

  formData.append("branch_name", data.branchName);

  formData.append("city_id", data.cityId);
  formData.append("campus_id", data.campusId);

  if (data.buildingId) {
    formData.append("building_id", data.buildingId);
  }

  formData.append("opens_at", data.opensAt);
  formData.append("closes_at", data.closesAt);

  if (data.latitude) {
    formData.append("latitude", data.latitude);
  }

  if (data.longitude) {
    formData.append("longitude", data.longitude);
  }

  formData.append("is_active", String(data.isActive));

  /* ---------------- Business ---------------- */

  if (data.registeredAddress) {
    formData.append(
      "registered_address",
      data.registeredAddress,
    );
  }

  if (data.businessAddress) {
    formData.append(
      "business_address",
      data.businessAddress,
    );
  }

  if (data.businessType) {
    formData.append(
      "business_type",
      data.businessType,
    );
  }

  /* ---------------- Compliance ---------------- */

  if (data.fssaiLicenseNumber) {
    formData.append(
      "fssai_license_number",
      data.fssaiLicenseNumber,
    );
  }

  if (data.gstRegistrationNumber) {
    formData.append(
      "gst_registration_number",
      data.gstRegistrationNumber,
    );
  }

  /* ---------------- Bank ---------------- */

  if (data.bankAccountNumber) {
    formData.append(
      "bank_account_number",
      data.bankAccountNumber,
    );
  }

  if (data.ifscCode) {
    formData.append(
      "ifsc_code",
      data.ifscCode,
    );
  }

  if (data.accountHolderName) {
    formData.append(
      "account_holder_name",
      data.accountHolderName,
    );
  }

  /* ---------------- Owner ---------------- */

  if (data.registeredOwnerName) {
    formData.append(
      "registered_owner_name",
      data.registeredOwnerName,
    );
  }

  if (data.ownerPhoneNumber) {
    formData.append(
      "owner_phone_number",
      data.ownerPhoneNumber,
    );
  }

  if (data.ownerEmail) {
    formData.append(
      "owner_email",
      data.ownerEmail,
    );
  }

  /* ---------------- Files ---------------- */

  if (data.imageFile) {
    formData.append(
      "image",
      data.imageFile,
    );
  }

  if (data.fssaiDocument) {
    formData.append(
      "fssai_document",
      data.fssaiDocument,
    );
  }

  if (data.gstDocument) {
    formData.append(
      "gst_document",
      data.gstDocument,
    );
  }

  if (data.ownerProofDocument) {
    formData.append(
      "owner_document",
      data.ownerProofDocument,
    );
  }

  if (data.bankPassbook) {
    formData.append(
      "bank_passbook",
      data.bankPassbook,
    );
  }

  data.documents.forEach((doc) => {
    if (doc.file) {
      formData.append(
        "other_documents",
        doc.file,
      );
    }
  });

  return formData;
};