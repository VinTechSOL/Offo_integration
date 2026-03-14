import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCafe } from "../context/CafeContext";
import { useBranch } from "../context/BranchContext";
import { useLocation } from "@/context/LocationContext";
import { CafeApi } from "@/apis/CafeApi";

export const AddVendorPage: React.FC = () => {

  const navigate = useNavigate();

  const { setCafes } = useCafe();
  const { setBranches } = useBranch();

  const {
    cities,
    campuses,
    buildings,
    setSelectedCityId,
    setSelectedCampusId
  } = useLocation();

  const [step, setStep] = useState<1 | 2>(1);

  /* ---------------- Cafe ---------------- */

  const [cafeName, setCafeName] = useState("");
  const [cafePhone, setCafePhone] = useState("");
  const [cafeEmail, setCafeEmail] = useState("");

  /* ---------------- Branch ---------------- */

  const [branchName, setBranchName] = useState("");
  const [cityId, setCityId] = useState("");
  const [campusId, setCampusId] = useState("");
  const [buildingId, setBuildingId] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (cafeName) {
      setBranchName(`${cafeName} - Main`);
    }
  }, [cafeName]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreateVendor = async () => {

    try {

      /* -------- Create Cafeteria -------- */

      const cafe = await CafeApi.createCafeteria({
        cafe_name: cafeName,
        phone_number: cafePhone,
        email_id: cafeEmail || undefined
      });

      const cafeId = cafe.cafe_id;

      /* -------- Create Branch -------- */

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

      setCafes(prev => [
        ...prev,
        {
          id: String(cafe.cafe_id),
          name: cafeName,
          phone: cafePhone,
          email: cafeEmail,
          isActive: true
        }
      ]);

      setBranches(prev => [
        ...prev,
        {
          id: String(branch.branch_id),
          cafeId: String(cafe.cafe_id),
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
      alert("Failed to create vendor");
    }
  };

  return (

    <div className="max-w-3xl mx-auto py-12 bg-white p-10 rounded-xl shadow space-y-8">

      <h1 className="text-3xl font-bold">
        Create Vendor
      </h1>

      {step === 1 && (

        <div className="space-y-5">

          <div>
            <label className="text-sm font-semibold">
              Cafe Name
            </label>
            <input
              className="border p-3 rounded w-full mt-1"
              value={cafeName}
              onChange={e => setCafeName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">
              Phone
            </label>
            <input
              className="border p-3 rounded w-full mt-1"
              value={cafePhone}
              onChange={e => setCafePhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">
              Email
            </label>
            <input
              className="border p-3 rounded w-full mt-1"
              value={cafeEmail}
              onChange={e => setCafeEmail(e.target.value)}
            />
          </div>

          <button
            disabled={!cafeName || !cafePhone}
            onClick={() => setStep(2)}
            className="bg-black text-white px-6 py-3 rounded disabled:opacity-40"
          >
            Next
          </button>

        </div>

      )}

      {step === 2 && (

        <div className="space-y-5">

          <input
            className="border p-3 rounded w-full"
            value={branchName}
            onChange={e => setBranchName(e.target.value)}
          />

          <select
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value)
              setSelectedCityId(e.target.value)
            }}
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
            onChange={(e) => {
              setCampusId(e.target.value)
              setSelectedCampusId(e.target.value)
            }}
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
            onChange={(e) => setBuildingId(e.target.value)}
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
            <img
              src={imagePreview}
              className="h-40 rounded-lg object-cover"
            />
          )}

          <div className="flex gap-4">

            <button
              onClick={() => setStep(1)}
              className="border px-5 py-2 rounded"
            >
              Back
            </button>

            <button
              onClick={handleCreateVendor}
              className="bg-green-600 text-white px-5 py-2 rounded"
            >
              Create Vendor
            </button>

          </div>

        </div>

      )}

    </div>
  );
};