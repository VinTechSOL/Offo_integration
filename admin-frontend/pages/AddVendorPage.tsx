import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCafe } from "../context/CafeContext";
import { useBranch } from "../context/BranchContext";
import { useLocation } from "@/context/LocationContext";
import toast from "react-hot-toast";
import { CafeApi } from "@/apis/CafeApi";

import { BranchForm } from "@/components/branch/BranchForm";
import { BranchFormData } from "@/components/branch/BranchFormtypes";

export const AddVendorPage: React.FC = () => {
  const navigate = useNavigate();

  const { setCafes } = useCafe();
  const { setBranches } = useBranch();

  const { cities, campuses, buildings } = useLocation();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- Cafe Details ---------------- */

  const [cafeName, setCafeName] = useState("");
  const [cafePhone, setCafePhone] = useState("");
  const [cafeEmail, setCafeEmail] = useState("");

  /* ---------------- Default Branch Name ---------------- */

  const [defaultBranchName, setDefaultBranchName] = useState("");

  useEffect(() => {
    if (cafeName.trim()) {
      setDefaultBranchName(`${cafeName} - Main`);
    } else {
      setDefaultBranchName("");
    }
  }, [cafeName]);

  const handleCreateVendor = async (
    form: BranchFormData,
  ) => {
    try {
      setSubmitting(true);
      console.log("Creating cafe...");

      /* ---------------- Create Cafeteria ---------------- */

      const cafe = await CafeApi.createCafeteria({
        cafe_name: cafeName,
        phone_number: cafePhone,
        email_id: cafeEmail || undefined,
      });

      console.log("Created cafe...");

      /* ---------------- Create Branch ---------------- */

      const branch = await CafeApi.createBranch(
        cafe.cafe_id,
        form,
      );

      console.log("Created branch...");
      console.log("updating context...");

      const selectedCity = cities.find(
        (c) => c.id === form.cityId,
      );

      const selectedCampus = campuses.find(
        (c) => c.id === form.campusId,
      );

      const selectedBuilding = buildings.find(
        (b) => b.id === form.buildingId,
      );

      /* ---------------- Update Cafes Context ---------------- */

      setCafes((prev) => [
        ...prev,
        {
          id: String(cafe.cafe_id),
          name: cafeName,
          phone: cafePhone,
          email: cafeEmail,
          isActive: true,
        },
      ]);

      /* ---------------- Update Branch Context ---------------- */

      setBranches((prev) => [
        ...prev,
        {
          id: String(branch.branch_id),

          cafeId: String(cafe.cafe_id),

          name: form.branchName,

          cityId: form.cityId,
          cityName: selectedCity?.name ?? "",

          campusId: form.campusId,
          campusName: selectedCampus?.name ?? "",

          buildingId: form.buildingId || undefined,
          buildingName: selectedBuilding?.name,

          opensAt: form.opensAt,
          closesAt: form.closesAt,

          imageUrl: branch.image_url,

          hasVendor: false,

          status: branch.is_active
            ? "Active"
            : "Disabled",
        },
      ]);

      console.log("navigating...");

      toast.success('Vendor created successfully!');

      setTimeout(() => {
        navigate('/branches');
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="bg-white rounded-xl shadow p-8 space-y-8">
        <h1 className="text-3xl font-bold">
          Create Vendor
        </h1>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold">
                Cafe Name *
              </label>

              <input
                value={cafeName}
                onChange={(e) =>
                  setCafeName(e.target.value)
                }
                className="border p-3 rounded-lg w-full mt-1"
                placeholder="Enter cafe name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Cafe Contact Number *
              </label>

              <input
                value={cafePhone}
                onChange={(e) =>
                  setCafePhone(e.target.value)
                }
                className="border p-3 rounded-lg w-full mt-1"
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Cafe Support Email
              </label>

              <input
                type="email"
                value={cafeEmail}
                onChange={(e) =>
                  setCafeEmail(e.target.value)
                }
                className="border p-3 rounded-lg w-full mt-1"
                placeholder="Enter support email"
              />
            </div>

            <div className="flex justify-end">
              <button
                disabled={!cafeName.trim() || !cafePhone.trim()}
                onClick={() => setStep(2)}
                className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <BranchForm
            mode="create"
            initialBranchName={defaultBranchName}
            submitText="Create Vendor"
            submitting={submitting}
            onBack={() => setStep(1)}
            onSubmit={handleCreateVendor}
          />
        )}
      </div>
    </div>
  );
};