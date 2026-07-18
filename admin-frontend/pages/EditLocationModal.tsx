import React, { useEffect, useState } from 'react';
import { EditLocationData, LocationType } from '@/types';

interface EditLocationModalProps {
  open: boolean;
  data: EditLocationData | null;
  onClose: () => void;
  onSave: (payload: any) => void;
}

export const EditLocationModal: React.FC<EditLocationModalProps> = ({
  open,
  data,
  onClose,
  onSave,
}) => {
  const [locationType, setLocationType] = useState<LocationType>('city');

  const [name, setName] = useState('');

  const [latitude, setLatitude] = useState('');

  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    if (!data) return;

    setLocationType(data.type);

    if (data.type === 'city' && data.city) {
      setName(data.city.city_name);

      setLatitude('');

      setLongitude('');
    }

    if (data.type === 'campus' && data.campus) {
      setName(data.campus.campus_name);

      setLatitude('');

      setLongitude('');
    }

    if (data.type === 'building' && data.building) {
      setName(data.building.building_name);

      setLatitude(data.building.latitude ? String(data.building.latitude) : '');

      setLongitude(
        data.building.longitude ? String(data.building.longitude) : '',
      );
    }
  }, [data]);

  if (!open || !data) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert('Name is required');

      return;
    }

    switch (locationType) {
      case 'city':
        onSave({
          city_id: data.city?.city_id,
          city_name: name.trim(),
        });

        break;

      case 'campus':
        onSave({
          campus_id: data.campus?.campus_id,
          city_id: data.campus?.city_id,
          campus_name: name.trim(),
        });

        break;

      case 'building':
        onSave({
          building_id: data.building?.building_id,

          campus_id: data.building?.campus_id,

          building_name: name.trim(),

          latitude: latitude === '' ? null : Number(latitude),

          longitude: longitude === '' ? null : Number(longitude),
        });

        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            Edit {locationType.charAt(0).toUpperCase() + locationType.slice(1)}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500"
          >
            ×
          </button>
        </div>

        {/* Body */}

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {locationType === 'city' && 'City Name'}

              {locationType === 'campus' && 'Campus Name'}

              {locationType === 'building' && 'Building Name'}
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:border-slate-900"
              placeholder={
                locationType === 'city'
                  ? 'Enter city name'
                  : locationType === 'campus'
                  ? 'Enter campus name'
                  : 'Enter building name'
              }
            />
          </div>

          {locationType === 'building' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Latitude(Optional)
                </label>

                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className="w-full rounded-lg border p-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Longitude(Optional)
                </label>

                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className="w-full rounded-lg border p-3 outline-none focus:border-slate-900"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-slate-900 px-5 py-2 text-white hover:bg-slate-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLocationModal;
