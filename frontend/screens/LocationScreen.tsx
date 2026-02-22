import React, { useEffect, useState } from "react";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import {
  getCities,
  getCampuses,
  getBuildings,
} from "../api/location";
import { saveUserContext } from "../api/userContext";
import { useNavigate } from "react-router-dom";

interface LocationScreenProps {
  onConfirm: (loc: {
    city: string;
    company: string;
    building: string;
  }) => void;
}

interface Option {
  id: number;
  name: string;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ onConfirm }) => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<Option[]>([]);
  const [campuses, setCampuses] = useState<Option[]>([]);
  const [buildings, setBuildings] = useState<Option[]>([]);

  const [cityId, setCityId] = useState<number | null>(null);
  const [campusId, setCampusId] = useState<number | null>(null);
  const [buildingId, setBuildingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  // Load cities
  useEffect(() => {
    setLoading(true);
    getCities()
      .then((data) => {
        const mapped = data.map((c: any) => ({
          id: c.city_id,
          name: c.city_name,
        }));
        setCities(mapped);
        if (mapped.length > 0) setCityId(mapped[0].id);
      })
      .catch(() => setError("Failed to load cities"))
      .finally(() => setLoading(false));
  }, []);

  // Load campuses when city changes
  useEffect(() => {
    if (!cityId) return;

    setLoading(true);
    getCampuses(cityId)
      .then((data) => {
        const mapped = data.map((c: any) => ({
          id: c.campus_id,
          name: c.campus_name,
        }));
        setCampuses(mapped);
        setCampusId(mapped[0]?.id || null);
      })
      .catch(() => setError("Failed to load campuses"))
      .finally(() => setLoading(false));
  }, [cityId]);

  // Load buildings when campus changes
  useEffect(() => {
    if (!campusId) return;

    setLoading(true);
    getBuildings(campusId)
      .then((data) => {
        const mapped = data.map((b: any) => ({
          id: b.building_id,
          name: b.building_name,
        }));
        setBuildings(mapped);
        setBuildingId(mapped[0]?.id || null);
      })
      .catch(() => setError("Failed to load buildings"))
      .finally(() => setLoading(false));
  }, [campusId]);

  const handleConfirm = async () => {
    if (!cityId || !campusId) {
      alert("Please select city and campus");
      return;
    }

    try {
      setLoading(true);
      await saveUserContext(cityId, campusId, buildingId);

      const cityName = cities.find(c => c.id === cityId)?.name || "";
      const campusName = campuses.find(c => c.id === campusId)?.name || "";
      const buildingName =
        buildings.find(b => b.id === buildingId)?.name || "";

      onConfirm({
        city: cityName,
        company: campusName,
        building: buildingName,
      });
    } catch {
      alert("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  // Dummy Google flow
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setDetectedLocation(null);

    navigator.geolocation.getCurrentPosition(
      () => {
        setTimeout(() => {
          setDetectedLocation("Detected using GPS");
          setIsLocating(false);
        }, 1500);
      },
      () => {
        alert("Unable to detect location");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      <div className="p-4 flex items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        
        <h1 className="text-xl font-bold text-gray-800 ml-4">
          Select your Location
        </h1>
      </div>

      <div className="p-4 flex-grow space-y-4 overflow-y-auto">
        {loading && (
          <p className="text-sm text-center text-gray-500">Loading...</p>
        )}

        {error && (
          <p className="text-sm text-center text-red-500">{error}</p>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-600">
            City
          </label>
          <select
            value={cityId ?? ""}
            onChange={(e) => setCityId(Number(e.target.value))}
            className="w-full p-3 bg-white border rounded-lg mt-1"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Campus / Company
          </label>
          <select
            value={campusId ?? ""}
            onChange={(e) => setCampusId(Number(e.target.value))}
            className="w-full p-3 bg-white border rounded-lg mt-1"
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Building
          </label>
          <select
            value={buildingId ?? ""}
            onChange={(e) => setBuildingId(Number(e.target.value))}
            className="w-full p-3 bg-white border rounded-lg mt-1"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t" />
          <span className="mx-3 text-gray-500 font-semibold">OR</span>
          <div className="flex-grow border-t" />
        </div>

        <button
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="w-full border-2 border-orange-500 text-orange-500 font-bold py-3 rounded-xl"
        >
          {isLocating ? "Detecting..." : "Use My Current Location"}
        </button>

        {detectedLocation && (
          <p className="text-center text-sm text-gray-600 mt-2">
            {detectedLocation}
          </p>
        )}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default LocationScreen;
