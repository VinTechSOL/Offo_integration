import { BranchFormData } from "@/components/branch/BranchFormtypes";

export const buildBranchFormData = (
  cafeId: string | number | null,
  data: BranchFormData,
) => {
  const formData = new FormData();

  /* =========================================================
     BASIC
  ========================================================= */

  if (cafeId !== null) {
    formData.append(
      "cafe_id",
      String(cafeId),
    );
  }

  formData.append(
    "branch_name",
    data.branchName,
  );

  formData.append(
    "city_id",
    data.cityId,
  );

  formData.append(
    "campus_id",
    data.campusId,
  );

  if (data.buildingId) {
    formData.append(
      "building_id",
      data.buildingId,
    );
  }

  formData.append(
    "opens_at",
    data.opensAt,
  );

  formData.append(
    "closes_at",
    data.closesAt,
  );

  /* =========================================================
     COORDINATES
  ========================================================= */

  if (data.latitude !== "") {
    formData.append(
      "latitude",
      data.latitude,
    );
  }

  if (data.longitude !== "") {
    formData.append(
      "longitude",
      data.longitude,
    );
  }

  /* =========================================================
     STATUS
  ========================================================= */

  formData.append(
    "is_active",
    String(data.isActive),
  );

  /* =========================================================
     BUSINESS
  ========================================================= */

  if (data.registeredAddress !== "") {
    formData.append(
      "registered_address",
      data.registeredAddress,
    );
  }

  if (data.businessAddress !== "") {
    formData.append(
      "business_address",
      data.businessAddress,
    );
  }

  if (data.businessType !== "") {
    formData.append(
      "business_type",
      data.businessType,
    );
  }

  /* =========================================================
     COMPLIANCE
  ========================================================= */

  if (data.fssaiLicenseNumber !== "") {
    formData.append(
      "fssai_license_number",
      data.fssaiLicenseNumber,
    );
  }

  if (data.gstRegistrationNumber !== "") {
    formData.append(
      "gst_registration_number",
      data.gstRegistrationNumber,
    );
  }

  /* =========================================================
     BANK
  ========================================================= */

  if (data.bankAccountNumber !== "") {
    formData.append(
      "bank_account_number",
      data.bankAccountNumber,
    );
  }

  if (data.ifscCode !== "") {
    formData.append(
      "ifsc_code",
      data.ifscCode,
    );
  }

  if (data.accountHolderName !== "") {
    formData.append(
      "account_holder_name",
      data.accountHolderName,
    );
  }

  /* =========================================================
     OWNER
  ========================================================= */

  if (data.registeredOwnerName !== "") {
    formData.append(
      "registered_owner_name",
      data.registeredOwnerName,
    );
  }

  if (data.ownerPhoneNumber !== "") {
    formData.append(
      "owner_phone_number",
      data.ownerPhoneNumber,
    );
  }

  if (data.ownerEmail !== "") {
    formData.append(
      "owner_email",
      data.ownerEmail,
    );
  }

  /* =========================================================
     FILES
     
     IMPORTANT:
     Only append a file when a NEW file was selected.
     Existing URLs remain untouched in the database.
  ========================================================= */

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

  /* =========================================================
     ADDITIONAL DOCUMENTS
     
     Only NEW files are uploaded here.
  ========================================================= */

  data.documents.forEach((document) => {
    if (document.file) {

      formData.append(
        "other_document_names",
        document.documentName.trim(),
      );

      formData.append(
        "other_documents",
        document.file,
      );
    }
  });

  return formData;
};