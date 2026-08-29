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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-800">
      {/* ================= Header ================= */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Location Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Configure and organize hierarchical locations across cities, campuses, and buildings.
            </p>
          </div>
        </div>
      </div>

      {/* ================= Action Cards Grid ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add City Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h2 className="font-semibold text-slate-900 text-base">Add City</h2>
            </div>
            <div className="space-y-3">
              <input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                placeholder="e.g. New York"
              />
            </div>
          </div>
          <button
            onClick={createCity}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add City
          </button>
        </div>

        {/* Add Campus Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <h2 className="font-semibold text-slate-900 text-base">Add Campus</h2>
            </div>
            <div className="space-y-3">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedCampus('');
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-700"
              >
                <option value="">Select Target City</option>
                {tree.map((city) => (
                  <option key={city.city_id} value={city.city_id}>
                    {city.city_name}
                  </option>
                ))}
              </select>

              <input
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                placeholder="e.g. North Tech Park"
              />
            </div>
          </div>
          <button
            onClick={createCampus}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Campus
          </button>
        </div>

        {/* Add Building Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h2 className="font-semibold text-slate-900 text-base">Add Building</h2>
            </div>
            <div className="space-y-3">
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all text-slate-700"
              >
                <option value="">Select Target Campus</option>
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
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                placeholder="e.g. Block C"
              />
            </div>
          </div>
          <button
            onClick={createBuilding}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Building
          </button>
        </div>
      </div>

      {/* ================= Existing Locations Section ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Existing Locations Hierarchy</h2>
            <p className="text-xs text-slate-500 mt-0.5">Overview of registered locations and structures</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            {tree.length} {tree.length === 1 ? 'City' : 'Cities'}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 w-1/4">City</th>
                <th className="p-4 w-1/4">Campus</th>
                <th className="p-4 w-1/3">Building</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
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
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {!cityRendered && (
                        <td
                          rowSpan={cityRowSpan}
                          className="p-4 font-semibold align-top bg-slate-50/40 border-r border-slate-100 text-slate-900"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{city.city_name}</span>
                            <button
                              onClick={() => editCity(city)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors shrink-0"
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
                        <td
                          rowSpan={campusRowSpan}
                          className="p-4 font-medium align-top bg-slate-50/20 border-r border-slate-100 text-slate-700"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{campus.campus_name}</span>
                            <button
                              onClick={() => editCampus(campus)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors shrink-0"
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

                      <td className="p-4 text-slate-600">
                        <span className={building.building_name === '—' ? 'text-slate-300' : ''}>
                          {building.building_name}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {building.building_id && (
                          <button
                            onClick={() =>
                              editBuilding(building, campus.campus_id)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                          >
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 210.3H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ));
                });
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile-Optimized List View (Replaces row-span tables on small screens) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {tree.map((city: any) => (
            <div key={city.city_id} className="p-4 space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl">
                <span className="font-bold text-slate-900 text-sm">{city.city_name}</span>
                <button
                  onClick={() => editCity(city)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Edit City
                </button>
              </div>

              <div className="pl-3 space-y-3 border-l-2 border-indigo-100 ml-2">
                {city.campuses.map((campus: any) => (
                  <div key={campus.campus_id} className="space-y-2">
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-700 text-xs">{campus.campus_name}</span>
                      <button
                        onClick={() => editCampus(campus)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Edit Campus
                      </button>
                    </div>

                    <div className="space-y-1 pl-2">
                      {campus.buildings.map((building: any) => (
                        <div
                          key={building.building_id}
                          className="flex items-center justify-between text-xs p-2 bg-slate-50/50 rounded-lg border border-slate-100"
                        >
                          <span className="text-slate-600">{building.building_name}</span>
                          <button
                            onClick={() => editBuilding(building, campus.campus_id)}
                            className="text-indigo-600 font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal Component */}
      <EditLocationModal
        open={editOpen}
        data={editData}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};