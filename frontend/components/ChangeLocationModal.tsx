import React, { useEffect, useRef, useState } from "react";
import { getCities, getCampuses, getBuildings } from "../api/location";
import { saveUserContext } from "../api/userContext";

interface Option {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialContext: {
    city_id: number;
    campus_id: number;
    building_id: number | null;
  };
}

const ChangeLocationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved,
  initialContext,
}) => {
  const [cities, setCities] = useState<Option[]>([]);
  const [campuses, setCampuses] = useState<Option[]>([]);
  const [buildings, setBuildings] = useState<Option[]>([]);

  const [cityId, setCityId] = useState<number | null>(null);
  const [campusId, setCampusId] = useState<number | null>(null);
  const [buildingId, setBuildingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  // prevents reset on initial preload
  const initialized = useRef(false);

  /* ---------- PRELOAD CONTEXT ON OPEN ---------- */
  useEffect(() => {
    if (!isOpen) return;

    initialized.current = false;
    setCityId(initialContext.city_id);
    setCampusId(initialContext.campus_id);
    setBuildingId(initialContext.building_id);
  }, [isOpen, initialContext]);

  /* ---------- LOAD CITIES ---------- */
  useEffect(() => {
    if (!isOpen) return;
    getCities().then((data) =>
      setCities(data.map((c: any) => ({
        id: c.city_id,
        name: c.city_name,
      })))
    );
  }, [isOpen]);

  /* ---------- LOAD CAMPUSES ---------- */
  useEffect(() => {
    if (!cityId) return;

    if (initialized.current) {
      setCampusId(null);
      setBuildingId(null);
    }

    getCampuses(cityId).then((data) =>
      setCampuses(data.map((c: any) => ({
        id: c.campus_id,
        name: c.campus_name,
      })))
    );
  }, [cityId]);

  /* ---------- LOAD BUILDINGS ---------- */
  useEffect(() => {
    if (!campusId) return;

    if (initialized.current) {
      setBuildingId(null);
    }

    getBuildings(campusId).then((data) =>
      setBuildings(data.map((b: any) => ({
        id: b.building_id,
        name: b.building_name,
      })))
    );

    initialized.current = true;
  }, [campusId]);

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!cityId || !campusId) return;
    setLoading(true);
    try {
      await saveUserContext(cityId, campusId, buildingId);
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-11/12 max-w-sm p-5">
        <h2 className="font-bold text-lg mb-4">Change Location</h2>

        <select
          className="w-full p-3 border rounded-lg mb-3"
          value={cityId ?? ""}
          onChange={(e) => setCityId(Number(e.target.value))}
        >
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="w-full p-3 border rounded-lg mb-3"
          value={campusId ?? ""}
          onChange={(e) => setCampusId(Number(e.target.value))}
        >
          {campuses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="w-full p-3 border rounded-lg mb-5"
          value={buildingId ?? ""}
          onChange={(e) =>
            setBuildingId(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">No specific building</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <button
          disabled={loading}
          onClick={handleSave}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold"
        >
          {loading ? "Saving..." : "Update Location"}
        </button>
      </div>
    </div>
  );
};

export default ChangeLocationModal;
