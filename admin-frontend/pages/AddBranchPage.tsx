import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { BranchForm } from "@/components/branch/BranchForm";
import { BranchFormData } from "@/components/branch/BranchFormtypes";

import { CafeApi } from "@/apis/CafeApi";

import { useCafe } from "../context/CafeContext";
import { useBranch } from "../context/BranchContext";
import { useLocation } from "@/context/LocationContext";

export const AddBranchPage: React.FC = () => {
  const navigate = useNavigate();

  const { cafes } = useCafe();
  const { setBranches } = useBranch();

  const { cities, campuses, buildings } = useLocation();

  const [cafeId, setCafeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateBranch = async (
    form: BranchFormData,
  ) => {
    if (!cafeId) {
      alert("Please select a cafeteria.");
      return;
    }

    try {
      setSubmitting(true);

      const branch = await CafeApi.createBranch(
        cafeId,
        form,
      );

      const selectedCity = cities.find(
        (c) => c.id === form.cityId,
      );

      const selectedCampus = campuses.find(
        (c) => c.id === form.campusId,
      );

      const selectedBuilding = buildings.find(
        (b) => b.id === form.buildingId,
      );

      setBranches((prev) => [
        ...prev,
        {
          id: String(branch.branch_id),

          cafeId,

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

      navigate("/branches");
    } catch (error) {
      console.error(error);
      alert("Failed to create branch.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">
          Add New Branch
        </h1>

        <div className="mb-8">
          <label className="text-sm font-semibold">
            Cafeteria *
          </label>

          <select
            value={cafeId}
            onChange={(e) => setCafeId(e.target.value)}
            className="border p-3 rounded-lg w-full mt-2"
          >
            <option value="">
              Select Cafeteria
            </option>

            {cafes.map((cafe) => (
              <option
                key={cafe.id}
                value={cafe.id}
              >
                {cafe.name}
              </option>
            ))}
          </select>
        </div>

        <BranchForm
          mode="create"
          submitText="Create Branch"
          submitting={submitting}
          onSubmit={handleCreateBranch}
        />
      </div>
    </div>
  );
};