import React, { useEffect, useState } from "react";
import { LocationApi } from "@/apis/LocationApi";
import { useLocation } from "@/context/LocationContext";

export const AddLocationPage: React.FC = () => {

  const {
    reloadCities,
    reloadCampuses,
    reloadBuildings,
  } = useLocation();

  const [tree, setTree] = useState<any[]>([]);

  const [cityName, setCityName] = useState("");

  const [selectedCity, setSelectedCity] = useState("");

  const [campusName, setCampusName] = useState("");

  const [selectedCampus, setSelectedCampus] = useState("");

  const [buildingName, setBuildingName] = useState("");

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

  return (

    <div className="max-w-7xl mx-auto py-10 space-y-10">

      {/* ================= Heading ================= */}

      <div>

        <h1 className="text-3xl font-bold">

          Location Management

        </h1>

        <p className="text-gray-500 mt-2">

          Manage cities, campuses and buildings.

        </p>

      </div>

      {/* ================= Add City ================= */}

      <div className="bg-white rounded-xl border p-6">

        <h2 className="font-semibold mb-4">

          Add City

        </h2>

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

        <h2 className="font-semibold mb-4">

          Add Campus

        </h2>

        <div className="flex gap-3">

          <select
            value={selectedCity}
            onChange={(e) => {

              setSelectedCity(e.target.value);

              setSelectedCampus("");

            }}
            className="border rounded-lg p-2"
          >

            <option value="">
              Select City
            </option>

            {tree.map((city) => (

              <option
                key={city.city_id}
                value={city.city_id}
              >
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

        <h2 className="font-semibold mb-4">

          Add Building

        </h2>

        <div className="flex gap-3">

          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="border rounded-lg p-2"
          >

            <option value="">
              Select Campus
            </option>

            {tree.flatMap((city) =>
              city.campuses.map((campus: any) => (

                <option
                  key={campus.campus_id}
                  value={campus.campus_id}
                >
                  {city.city_name} • {campus.campus_name}
                </option>

              ))
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

        <h2 className="text-xl font-bold mb-6">

          Existing Locations

        </h2>

        <table className="w-full border-collapse">

          <thead>

            <tr className="border-b">

              <th className="text-left p-3">

                City

              </th>

              <th className="text-left p-3">

                Campus

              </th>

              <th className="text-left p-3">

                Building

              </th>

            </tr>

          </thead>

        <tbody>

            {tree.map((city: any) => {

            const cityRowSpan =
              city.campuses.reduce(
                (total: number, campus: any) =>
                total + Math.max(campus.buildings.length, 1),
                0
              );

            let cityRendered = false;

            return city.campuses.map((campus: any) => {

              const campusRowSpan = Math.max(
                campus.buildings.length,
                1
              );

              let campusRendered = false;

              const rows =
                campus.buildings.length
                  ? campus.buildings
                  : [{ building_name: "—" }];

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
                      {city.city_name}
                    </td>
                  )}

                  {(() => {
                    cityRendered = true;
                    return null;
                  })()}

                  {!campusRendered && (
                    <td
                      rowSpan={campusRowSpan}
                      className="p-3 align-top"
                    >
                      {campus.campus_name}
                    </td>
                  )}

                  {(() => {
                    campusRendered = true;
                    return null;
                  })()}

                  <td className="p-3">
                    {building.building_name}
                  </td>

                </tr>

              ));

            });

          })}

        </tbody>

        </table>

      </div>

    </div>

  );

};