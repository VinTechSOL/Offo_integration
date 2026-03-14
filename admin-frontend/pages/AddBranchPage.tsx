import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCafe } from "../context/CafeContext";
import { useBranch } from "../context/BranchContext";
import { useLocation } from "@/context/LocationContext";
import { CafeApi } from "@/apis/CafeApi";

export const AddBranchPage: React.FC = () => {

  const navigate = useNavigate();

  const { cafes } = useCafe();
  const { setBranches } = useBranch();

  const { cities, campuses, buildings } = useLocation();

  const [cafeId, setCafeId] = useState("");
  const [branchName, setBranchName] = useState("");

  const [cityId, setCityId] = useState("");
  const [campusId, setCampusId] = useState("");
  const [buildingId, setBuildingId] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreateBranch = async () => {

    if (!cafeId || !branchName || !cityId || !campusId) {
      alert("Please fill all required fields");
      return;
    }

    try {

      const formData = new FormData();

      formData.append("cafe_id", cafeId);
      formData.append("branch_name", branchName);
      formData.append("city_id", cityId);
      formData.append("campus_id", campusId);

      if (buildingId) {
        formData.append("building_id", buildingId);
      }

      formData.append("opens_at", "08:00");
      formData.append("closes_at", "22:00");
      formData.append("is_active", "true");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const branch = await CafeApi.createBranch(formData);

      const selectedCity = cities.find(c => c.id === cityId);
      const selectedCampus = campuses.find(c => c.id === campusId);

      setBranches(prev => [
        ...prev,
        {
          id: String(branch.branch_id),
          cafeId,
          name: branchName,
          cityId,
          cityName: selectedCity?.name || "",
          campusId,
          campusName: selectedCampus?.name || "",
          buildingName: buildings.find(b => b.id === buildingId)?.name,
          imageUrl: branch.image_url,
          status: "Active"
        }
      ]);

      navigate("/branches");

    } catch (err) {
      console.error(err);
      alert("Failed to create branch");
    }
  };

  return (

    <div className="max-w-3xl mx-auto py-12 bg-white p-10 rounded-xl shadow space-y-6">

      <h1 className="text-3xl font-bold">
        Add New Branch
      </h1>

      <select
        value={cafeId}
        onChange={e => setCafeId(e.target.value)}
        className="border p-3 rounded w-full"
      >
        <option value="">Select Cafe</option>

        {cafes.map(cafe => (
          <option key={cafe.id} value={cafe.id}>
            {cafe.name}
          </option>
        ))}
      </select>

      <input
        value={branchName}
        onChange={e => setBranchName(e.target.value)}
        className="border p-3 rounded w-full"
        placeholder="Branch Name"
      />

      <select
        value={cityId}
        onChange={e => setCityId(e.target.value)}
        className="border p-3 rounded w-full"
      >
        <option value="">Select City</option>

        {cities.map(city => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>

      <select
        value={campusId}
        onChange={e => setCampusId(e.target.value)}
        className="border p-3 rounded w-full"
      >
        <option value="">Select Campus</option>

        {campuses
          .filter(c => c.cityId === cityId)
          .map(campus => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
      </select>

      <select
        value={buildingId}
        onChange={e => setBuildingId(e.target.value)}
        className="border p-3 rounded w-full"
      >
        <option value="">Select Building</option>

        {buildings
          .filter(b => b.campusId === campusId)
          .map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
      </select>

      <input type="file" onChange={handleImageUpload} />

      {imagePreview && (
        <img src={imagePreview} className="h-40 rounded-lg object-cover" />
      )}

      <button
        onClick={handleCreateBranch}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        Create Branch
      </button>

    </div>
  );
};