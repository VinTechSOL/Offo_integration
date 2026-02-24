import React from 'react';
import { useCafe } from '../context/CafeContext';
import { useBranch } from '../context/BranchContext';

export const ViewCafesPage: React.FC = () => {
  const { cafes } = useCafe();
  const { branches } = useBranch();

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Cafes
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage all cafes and their associated branches.
        </p>
      </div>

      {/* Cafe Cards */}
      <div className="space-y-8">
        {cafes.map(cafe => {
          const cafeBranches = branches.filter(b => b.cafeId === cafe.id);

          return (
            <div
              key={cafe.id}
              className="bg-white rounded-2xl border shadow-sm p-8 space-y-6"
            >

              {/* Cafe Header */}
              <div className="flex justify-between items-start">

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {cafe.name}
                  </h2>

                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    {cafe.phone && <p>{cafe.phone}</p>}
                    {cafe.email && <p>{cafe.email}</p>}
                  </div>

                  <div className="mt-3 text-xs text-gray-400 font-medium">
                    {cafeBranches.length} Branch
                    {cafeBranches.length !== 1 && 'es'}
                  </div>
                </div>

                <span
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full ${
                    cafe.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {cafe.isActive ? 'Active' : 'Disabled'}
                </span>

              </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>

              {/* Branch Section */}
              {cafeBranches.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  No branches added for this cafe yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cafeBranches.map(branch => (
                    <div
                      key={branch.id}
                      className="flex gap-5 p-5 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
                    >

                      {/* Branch Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {branch.imageUrl ? (
                          <img
                            src={branch.imageUrl}
                            alt="branch"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Branch Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {branch.name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {branch.campusName}
                          {branch.buildingName && ` • ${branch.buildingName}`}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {branch.cityName}
                        </p>

                        <div className="mt-3">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              branch.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {branch.status}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};