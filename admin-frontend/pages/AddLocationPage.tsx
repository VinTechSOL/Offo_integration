import React, { useEffect, useState } from "react";
import { LocationApi } from "@/apis/LocationApi";
import { useLocation } from "@/context/LocationContext";
import EditLocationModal from "./EditLocationModal";
import { EditLocationData, CityTree } from "@/types";

export const AddLocationPage: React.FC = () => {

  const {
    reloadCities,
    reloadCampuses,
    reloadBuildings,
  } = useLocation();

  const [tree, setTree] = useState<CityTree[]>([]);

  const [cityName, setCityName] = useState("");

  const [selectedCity, setSelectedCity] = useState("");

  const [campusName, setCampusName] = useState("");

  const [selectedCampus, setSelectedCampus] = useState("");

  const [buildingName, setBuildingName] = useState("");

  const [editOpen, setEditOpen] = useState(false);

  const [editData, setEditData] = useState<EditLocationData | null>(null);
  /* =====================================================
     Load Tree
  ===================================================== */

  const loadTree = async () => {

    try {

      const data = await LocationApi.getLocationTree();

      setTree(data);

    } catch (err) {

      console.error(err);

    }

  };

  useEffect(() => {

    loadTree();

  }, []);

  /* =====================================================
     Create City
  ===================================================== */

  const createCity = async () => {

    if (!cityName.trim()) return;

    try {

      await LocationApi.createCity(cityName);

      setCityName("");

      await reloadCities();

      await loadTree();

    } catch (err) {

      console.error(err);

      alert("Unable to create city");

    }

  };

  /* =====================================================
     Create Campus
  ===================================================== */

  const createCampus = async () => {

    if (!selectedCity || !campusName.trim()) return;

    try {

      await LocationApi.createCampus(
        Number(selectedCity),
        campusName
      );

      setCampusName("");

      await reloadCampuses(selectedCity);

      await loadTree();

    } catch (err) {

      console.error(err);

      alert("Unable to create campus");

    }

  };

  /* =====================================================
     Create Building
  ===================================================== */

  const createBuilding = async () => {

    if (!selectedCampus || !buildingName.trim()) return;

    try {

      await LocationApi.createBuilding(
        Number(selectedCampus),
        buildingName
      );

      setBuildingName("");

      await reloadBuildings(selectedCampus);

      await loadTree();

    } catch (err) {

      console.error(err);

      alert("Unable to create building");

    }

  };

  /* =====================================================
     Edit city, campus, Building
  ===================================================== */

  const editCity = (city: any) => {
    setEditData({
      type: 'city',
      city: {
        city_id: city.city_id,
        city_name: city.city_name,
      },
    });

    setEditOpen(true);
  };

  const editCampus = (campus: any) => {
    setEditData({
      type: 'campus',
      campus: {
        campus_id: campus.campus_id,
        city_id: campus.city_id,
        campus_name: campus.campus_name,
      },
    });

    setEditOpen(true);
  };

  const editBuilding = (building: any, campusId: number) => {
    setEditData({
      type: 'building',
      building: {
        building_id: building.building_id,
        campus_id: campusId,
        building_name: building.building_name,
        latitude: building.latitude,
        longitude: building.longitude,
      },
    });

    setEditOpen(true);
  };

  const handleSave = async (payload: any) => {
    try {
      switch (editData?.type) {
        case 'city':
          await LocationApi.updateCity(payload.city_id, payload.city_name);

          break;

        case 'campus':
          await LocationApi.updateCampus(
            payload.campus_id,
            payload.campus_name,
          );

          break;

        case 'building':
          await LocationApi.updateBuilding(payload.building_id, {
            building_name: payload.building_name,

            latitude: payload.latitude,

            longitude: payload.longitude,
          });

          break;
      }

      setEditOpen(false);

      await loadTree();

      alert('Location updated successfully.');
    } catch (err) {
      console.error(err);

      alert('Unable to update location.');
    }
  };


  return (
    <div className="max-w-7xl mx-auto py-10 space-y-10">
      {/* ================= Heading ================= */}

      <div>
        <h1 className="text-3xl font-bold">Location Management</h1>

        <p className="text-gray-500 mt-2">
          Manage cities, campuses and buildings.
        </p>
      </div>

      {/* ================= Add City ================= */}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Add City</h2>

        <div className="flex gap-3">
          <input
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            className="border rounded-lg p-2 flex-1"
            placeholder="City Name"
          />

          <button
            onClick={createCity}
            className="bg-slate-900 text-white px-5 rounded-lg"
          >
            Add City
          </button>
        </div>
      </div>

      {/* ================= Add Campus ================= */}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Add Campus</h2>

        <div className="flex gap-3">
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);

              setSelectedCampus('');
            }}
            className="border rounded-lg p-2"
          >
            <option value="">Select City</option>

            {tree.map((city) => (
              <option key={city.city_id} value={city.city_id}>
                {city.city_name}
              </option>
            ))}
          </select>

          <input
            value={campusName}
            onChange={(e) => setCampusName(e.target.value)}
            className="border rounded-lg p-2 flex-1"
            placeholder="Campus Name"
          />

          <button
            onClick={createCampus}
            className="bg-slate-900 text-white px-5 rounded-lg"
          >
            Add Campus
          </button>
        </div>
      </div>

      {/* ================= Add Building ================= */}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Add Building</h2>

        <div className="flex gap-3">
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">Select Campus</option>

            {tree.flatMap((city) =>
              city.campuses.map((campus: any) => (
                <option key={campus.campus_id} value={campus.campus_id}>
                  {city.city_name} • {campus.campus_name}
                </option>
              )),
            )}
          </select>

          <input
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            className="border rounded-lg p-2 flex-1"
            placeholder="Building Name"
          />

          <button
            onClick={createBuilding}
            className="bg-slate-900 text-white px-5 rounded-lg"
          >
            Add Building
          </button>
        </div>
      </div>

      {/* ================= Existing Locations ================= */}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-6">Existing Locations</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">City</th>

              <th className="text-left p-3">Campus</th>

              <th className="text-left p-3">Building</th>

              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tree.map((city: any) => {
              const cityRowSpan = city.campuses.reduce(
                (total: number, campus: any) =>
                  total + Math.max(campus.buildings.length, 1),
                0,
              );

              let cityRendered = false;

              return city.campuses.map((campus: any) => {
                const campusRowSpan = Math.max(campus.buildings.length, 1);

                let campusRendered = false;

                const rows = campus.buildings.length
                  ? campus.buildings
                  : [{ building_name: '—' }];

                return rows.map((building: any, index: number) => (
                  <tr
                    key={`${city.city_id}-${campus.campus_id}-${index}`}
                    className="border-b hover:bg-gray-50"
                  >
                    {!cityRendered && (
                      <td
                        rowSpan={cityRowSpan}
                        className="p-3 font-semibold align-top bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span>{city.city_name}</span>

                          <button
                            onClick={() => editCity(city)}
                            className="text-blue-600 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    )}

                    {(() => {
                      cityRendered = true;
                      return null;
                    })()}

                    {!campusRendered && (
                      <td rowSpan={campusRowSpan} className="p-3 font-semibold align-top bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span>{campus.campus_name}</span>

                          <button
                            onClick={() => editCampus(campus)}
                            className="text-blue-600 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    )}

                    {(() => {
                      campusRendered = true;
                      return null;
                    })()}

                    <td className="p-3">{building.building_name}</td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            editBuilding(building, campus.campus_id)
                          }
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              });
            })}
          </tbody>
        </table>
      </div>
      <EditLocationModal
        open={editOpen}
        data={editData}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </div>
  );

};