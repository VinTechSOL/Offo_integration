import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import { constants } from "../constants";
import { useBranch } from "../context/BranchContext";
import Button from "@/components/common/Button";
import { DashboardApi } from "@/apis/DashboardApi";

export const OverviewPage: React.FC = () => {

  const { selectedBranchIds, branches } = useBranch();

  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());

  const [overview, setOverview] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  /* ================= Selected Branch Display ================= */

  const currentBranches = useMemo(
    () => branches.filter(b => selectedBranchIds.includes(b.id)),
    [branches, selectedBranchIds]
  );

  const branchNamesDisplay = useMemo(() => {
    if (currentBranches.length === 0) return "No branches selected";
    if (currentBranches.length === branches.length) return "All Branches";
    if (currentBranches.length <= 2)
      return currentBranches.map(b => b.name).join(", ");
    return `${currentBranches.length} Branches Selected`;
  }, [currentBranches, branches]);

  /* ================= Clock ================= */

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  /* ================= Fetch Dashboard ================= */

  useEffect(() => {

    const fetchOverview = async () => {

      if (!selectedBranchIds.length) {
        setOverview(null);
        return;
      }

      try {

        setLoading(true);

        const data = await DashboardApi.getOverview(selectedBranchIds);

        setOverview(data);

      } catch (err) {

        console.error("Failed to load dashboard", err);

      } finally {

        setLoading(false);

      }

    };

    fetchOverview();

  }, [selectedBranchIds]);

  /* ================= Stats ================= */

  const stats = useMemo(() => {

    if (!overview)
      return [
        { title: "Today Orders", value: 0, icon: "📦" },
        { title: "Total Revenue", value: "₹0", icon: "💰" },
        { title: "Avg Order Value", value: "₹0", icon: "📈" }
      ];

    return [
      {
        title: "Today Orders",
        value: overview.today_orders,
        icon: "📦"
      },
      {
        title: "Total Revenue",
        value: `₹${overview.total_revenue?.toLocaleString()}`,
        icon: "💰"
      },
      {
        title: "Avg Order Value",
        value: `₹${overview.avg_order_value}`,
        icon: "📈"
      }
    ];

  }, [overview]);

  /* ================= Weekly Chart ================= */

  const weeklyData = overview?.weekly_orders || [0, 0, 0, 0, 0, 0, 0];

  const maxVal = Math.max(...weeklyData, 1);

  /* ================= Top Items ================= */

  const topItems = overview?.top_items || [];

  return (
    <div className="space-y-6 animate-modal-in">

      {/* ================= Header ================= */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">

        <div>

          <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Overview for{" "}
            <span className="font-semibold text-offoOrange">
              {branchNamesDisplay}
            </span>
          </p>

        </div>

        <div className="text-right hidden sm:block">

          <p className="text-2xl font-bold text-gray-800">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>

          <p className="text-sm text-gray-500">
            {currentTime.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>

        </div>

      </div>

      {/* ================= Loading ================= */}

      {loading && (
        <div className="text-center text-gray-500">
          Loading dashboard...
        </div>
      )}

      {/* ================= Stats ================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {stats.map((stat, index) => (

          <Card
            key={index}
            className="relative p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >

            <div className="flex justify-between items-start">

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  {stat.title}
                </p>

                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>

              <div className="p-2 rounded-lg bg-gray-50 text-2xl">
                {stat.icon}
              </div>

            </div>

          </Card>

        ))}

      </div>

      {/* ================= Chart + Right Panel ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ================= Chart ================= */}

        <div className="lg:col-span-2">

          <Card className="p-6">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Revenue Analytics
                </h3>

                <p className="text-sm text-gray-500">
                  Weekly sales performance
                </p>
              </div>

            </div>

            <div className="h-64 flex items-end justify-between gap-3 px-2">

              {weeklyData.map((val: number, idx: number) => (

                <div key={idx} className="w-full flex flex-col items-center">

                  <div className="w-full relative h-full flex items-end">

                    <div
                      className="w-full bg-orange-500 rounded-t-md"
                      style={{
                        height: `${(val / maxVal) * 100}%`
                      }}
                    />

                  </div>

                  <span className="text-xs font-medium text-gray-400 mt-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                  </span>

                </div>

              ))}

            </div>

          </Card>

        </div>

        {/* ================= Right Column ================= */}

        <div className="space-y-6">

          {/* Quick Actions */}

          <Card className="p-6">

            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() => navigate(constants.routes.REPORTS)}
                className="p-4 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >
                Reports
              </button>

              <Button
                onClick={() => navigate(constants.routes.ADD_VENDOR)}
                className="p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                Add Vendor
              </Button>

              <button
                onClick={() => navigate(constants.routes.SETTINGS)}
                className="p-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                Settings
              </button>

            </div>

          </Card>

          {/* Top Items */}

          <Card className="p-6">

            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top Selling Items
            </h3>

            <div className="space-y-4">

              {topItems.map((item: any, i: number) => (

                <div
                  key={i}
                  className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0"
                >

                  <div className="flex items-center gap-3">

                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100">
                      {i + 1}
                    </span>

                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>

                  </div>

                  <div className="text-right">

                    <p className="text-sm font-bold text-gray-900">
                      ₹{item.revenue}
                    </p>

                    <p className="text-xs text-gray-500">
                      {item.sales} sold
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
};