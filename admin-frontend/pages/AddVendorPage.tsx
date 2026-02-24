import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { useBranch } from '../context/BranchContext';
import { useCity } from '../context/CityContext';
import { useCampus } from '../context/CampusContext';
import { Branch } from '../types';

export const AddVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const { cafes, setCafes } = useCafe();
  const { setBranches } = useBranch();
  const { cities } = useCity();
  const { campuses } = useCampus();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  /* =========================
     Cafe State
  ========================= */
  const [selectedCafeId, setSelectedCafeId] = useState('');
  const [isCreatingCafe, setIsCreatingCafe] = useState(false);
  const [cafeName, setCafeName] = useState('');
  const [cafePhone, setCafePhone] = useState('');
  const [cafeEmail, setCafeEmail] = useState('');
  const [cafeActive, setCafeActive] = useState(true);

  /* =========================
     Branch State
  ========================= */
  const [branchName, setBranchName] = useState('');
  const [cityId, setCityId] = useState('');
  const [campusId, setCampusId] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [opensAt, setOpensAt] = useState('09:00');
  const [closesAt, setClosesAt] = useState('18:00');
  const [branchActive, setBranchActive] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /* Auto-fill Branch Name */
  useEffect(() => {
    if (isCreatingCafe && cafeName) {
      setBranchName(`${cafeName} - Main`);
    }
  }, [cafeName, isCreatingCafe]);

  /* =========================
     Image Upload
  ========================= */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  /* =========================
     Step Handlers
  ========================= */
  const handleCafeNext = () => {
    if (isCreatingCafe) {
      if (!cafeName || !cafePhone) {
        alert('Cafe Name and Phone are required');
        return;
      }

      const newCafe = {
        id: Date.now().toString(),
        name: cafeName,
        phone: cafePhone,
        email: cafeEmail,
        isActive: cafeActive
      };

      setCafes(prev => [...prev, newCafe]);
      setSelectedCafeId(newCafe.id);
    }

    if (!selectedCafeId && !isCreatingCafe) {
      alert('Please select or create a cafe');
      return;
    }

    setStep(2);
  };

  const handleBranchNext = () => {
    if (!branchName || !cityId || !campusId) {
      alert('Please fill required branch details');
      return;
    }
    setStep(3);
  };

  const handleCreateVendor = () => {
    const selectedCity = cities.find(c => c.id === cityId);
    const selectedCampus = campuses.find(c => c.id === campusId);

    const newBranch: Branch = {
      id: Date.now().toString(),
      cafeId: selectedCafeId,
      name: branchName,
      cityId,
      cityName: selectedCity?.name || '',
      campusId,
      campusName: selectedCampus?.name || '',
      buildingName,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      imageUrl: imagePreview || undefined,
      status: branchActive ? 'Active' : 'Disabled'
    };

    setBranches(prev => [...prev, newBranch]);
    navigate('/branches');
  };

  /* =========================
     Toggle Component
  ========================= */
  const Toggle = ({
    enabled,
    setEnabled
  }: {
    enabled: boolean;
    setEnabled: (v: boolean) => void;
  }) => (
    <div
      onClick={() => setEnabled(!enabled)}
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition ${
        enabled ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
          enabled ? 'translate-x-6' : ''
        }`}
      />
    </div>
  );

  /* =========================
     UI
  ========================= */
  return (
    <div className="max-w-6xl mx-auto py-12 space-y-10">

      <div>
        <h1 className="text-4xl font-bold text-gray-900">Add Vendor</h1>
        <p className="text-gray-500 mt-2">
          Create or select a cafe and add its branch details.
        </p>
      </div>

      {/* =========================
         STEP 1 — Cafe
      ========================= */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-10 space-y-8">

          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            1. Select existing cafe or create new one. <br />
            2. Add branch details. <br />
            3. Preview and confirm.
          </div>

          <div>
            <label className="block mb-2 font-semibold">Select Cafe</label>
            <select
              value={selectedCafeId}
              onChange={e => {
                const value = e.target.value;
                if (value === 'create') {
                  setIsCreatingCafe(true);
                  setSelectedCafeId('');
                } else {
                  setIsCreatingCafe(false);
                  setSelectedCafeId(value);
                }
              }}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Choose Cafe</option>
              <option value="create">+ Create New Cafe</option>
              {cafes.map(cafe => (
                <option key={cafe.id} value={cafe.id}>
                  {cafe.name}
                </option>
              ))}
            </select>
          </div>

          {isCreatingCafe && (
            <div className="grid grid-cols-2 gap-6">
              <input
                placeholder="Cafe Name *"
                value={cafeName}
                onChange={e => setCafeName(e.target.value)}
                className="border rounded-xl p-3"
              />
              <input
                placeholder="Phone *"
                value={cafePhone}
                onChange={e => setCafePhone(e.target.value)}
                className="border rounded-xl p-3"
              />
              <input
                placeholder="Email (Optional)"
                value={cafeEmail}
                onChange={e => setCafeEmail(e.target.value)}
                className="border rounded-xl p-3 col-span-2"
              />

              <div className="flex items-center gap-4">
                <span className="font-medium">Cafe Active</span>
                <Toggle enabled={cafeActive} setEnabled={setCafeActive} />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleCafeNext}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* =========================
         STEP 2 — Branch
      ========================= */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-lg p-10 space-y-8">

          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            Branch name is auto-filled as "Cafe - Main". You can edit it.
          </div>

          <input
            value={branchName}
            onChange={e => setBranchName(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <div className="grid grid-cols-3 gap-6">
            <select
              value={cityId}
              onChange={e => setCityId(e.target.value)}
              className="border rounded-xl p-3"
            >
              <option value="">Select City *</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>

            <select
              value={campusId}
              onChange={e => setCampusId(e.target.value)}
              className="border rounded-xl p-3"
            >
              <option value="">Select Campus *</option>
              {campuses
                .filter(c => c.cityId === cityId)
                .map(campus => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
            </select>

            <input
              placeholder="Building"
              value={buildingName}
              onChange={e => setBuildingName(e.target.value)}
              className="border rounded-xl p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <input type="time" value={opensAt} onChange={e => setOpensAt(e.target.value)} className="border rounded-xl p-3"/>
            <input type="time" value={closesAt} onChange={e => setClosesAt(e.target.value)} className="border rounded-xl p-3"/>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <input placeholder="Latitude (Optional)" value={latitude} onChange={e => setLatitude(e.target.value)} className="border rounded-xl p-3"/>
            <input placeholder="Longitude (Optional)" value={longitude} onChange={e => setLongitude(e.target.value)} className="border rounded-xl p-3"/>
          </div>

          {/* Image Upload */}
          <div className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:border-orange-400 transition">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload"/>
            <label htmlFor="upload" className="cursor-pointer text-gray-500">
              {imagePreview ? (
                <img src={imagePreview} className="h-40 mx-auto rounded-xl object-cover"/>
              ) : (
                "Click to upload branch image"
              )}
            </label>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium">Branch Active</span>
            <Toggle enabled={branchActive} setEnabled={setBranchActive} />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border">
              Back
            </button>
            <button onClick={handleBranchNext} className="bg-slate-900 text-white px-6 py-3 rounded-xl">
              Preview
            </button>
          </div>
        </div>
      )}

      {/* =========================
         STEP 3 — Preview
      ========================= */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-lg p-10 space-y-8">

          <h2 className="text-2xl font-bold">Preview</h2>

          <div className="grid grid-cols-2 gap-10">

            {imagePreview && (
              <img src={imagePreview} className="rounded-2xl h-72 object-cover"/>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{branchName}</h3>
                <p className="text-gray-500">
                  {cities.find(c => c.id === cityId)?.name} • {campuses.find(c => c.id === campusId)?.name}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Open: {opensAt}</p>
                <p className="text-gray-600">Close: {closesAt}</p>
              </div>

              <div>
                <p>Status: {branchActive ? 'Active' : 'Disabled'}</p>
              </div>
            </div>

          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border">
              Back
            </button>
            <button onClick={handleCreateVendor} className="bg-green-600 text-white px-6 py-3 rounded-xl">
              Create Vendor
            </button>
          </div>
        </div>
      )}

    </div>
  );
};