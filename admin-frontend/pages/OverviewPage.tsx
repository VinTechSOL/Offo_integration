import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import { useNavigate } from "react-router-dom";

import Card from "../components/common/Card";

import { constants } from "../constants";

import { useBranch } from "../context/BranchContext";

import Button from "@/components/common/Button";

import {
  DashboardApi,
  DashboardOverviewResponse,
} from "@/apis/DashboardApi";


export const OverviewPage: React.FC = () => {

  const {
    selectedBranchIds,
    branches,
  } = useBranch();

  const navigate = useNavigate();

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const [overview, setOverview] =
    useState<DashboardOverviewResponse | null>(null);

  const [loading, setLoading] =
    useState(false);


  /* =========================================================
     SELECTED BRANCH DISPLAY
  ========================================================= */

  const currentBranches = useMemo(
    () =>
      branches.filter(
        (b) =>
          selectedBranchIds.includes(b.id)
      ),
    [
      branches,
      selectedBranchIds,
    ]
  );


  const branchNamesDisplay = useMemo(() => {

    if (currentBranches.length === 0) {
      return "No branches selected";
    }

    if (
      currentBranches.length ===
      branches.length
    ) {
      return "All Branches";
    }

    if (currentBranches.length <= 2) {
      return currentBranches
        .map((b) => b.name)
        .join(", ");
    }

    return `${currentBranches.length} Branches Selected`;

  }, [
    currentBranches,
    branches,
  ]);


  /* =========================================================
     CLOCK
  ========================================================= */

  useEffect(() => {

    const timer = setInterval(
      () =>
        setCurrentTime(
          new Date()
        ),
      60000
    );

    return () =>
      clearInterval(timer);

  }, []);


  /* =========================================================
     FETCH DASHBOARD
  ========================================================= */

  useEffect(() => {

    const fetchOverview = async () => {

      if (
        !selectedBranchIds.length
      ) {
        setOverview(null);
        return;
      }

      try {

        setLoading(true);

        console.log(
          "Dashboard branch IDs:",
          selectedBranchIds
        );

        const data =
          await DashboardApi.getOverview(
            selectedBranchIds
          );

        console.log(
          "Dashboard response:",
          data
        );

        setOverview(data);

      } catch (err: any) {

        console.error(
          "Failed to load dashboard:",
          err?.response?.status,
          err?.response?.data || err
        );

        setOverview(null);

      } finally {

        setLoading(false);

      }

    };

    fetchOverview();

  }, [selectedBranchIds]);


  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {

    if (!overview) {

      return [
        {
          title: "Today Orders",
          value: 0,
          icon: "📦",
        },
        {
          title: "Today's Revenue",
          value: "₹0",
          icon: "💰",
        },
        {
          title: "Avg Order Value",
          value: "₹0",
          icon: "📈",
        },
      ];

    }

    return [
      {
        title: "Today Orders",
        value: overview.today_orders,
        icon: "📦",
      },
      {
        title: "Today's Revenue",
        value: `₹${overview.total_revenue.toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        )}`,
        icon: "💰",
      },
      {
        title: "Avg Order Value",
        value: `₹${overview.avg_order_value.toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        )}`,
        icon: "📈",
      },
    ];

  }, [overview]);


  /* =========================================================
     REVENUE TREND
  ========================================================= */

  const revenueTrend =
    overview?.revenue_trend || [];


  const maxRevenue = Math.max(
    ...revenueTrend.map(
      (item) => item.revenue
    ),
    1
  );


  /* =========================================================
     TOP ITEMS
  ========================================================= */

  const topItems =
    overview?.top_items || [];


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="space-y-6 animate-modal-in">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">

        <div>

          <h1
            className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}
          >
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

            {currentTime.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}

          </p>

          <p className="text-sm text-gray-500">

            {currentTime.toLocaleDateString(
              [],
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}

          </p>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (

        <div className="text-center text-gray-500">

          Loading dashboard...

        </div>

      )}


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {stats.map(
          (stat, index) => (

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

          )
        )}

      </div>


      {/* =====================================================
          CHART + RIGHT PANEL
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* ===================================================
            REVENUE ANALYTICS
        =================================================== */}

        <div className="lg:col-span-2">

          <Card className="p-6">

            <div className="flex justify-between items-center mb-6">

              <div>

                <h3 className="text-lg font-bold text-gray-800">

                  Revenue Analytics

                </h3>

                <p className="text-sm text-gray-500">

                  Revenue for the last 7 days

                </p>

              </div>

            </div>


            {revenueTrend.length === 0 ? (

              <div className="h-64 flex items-center justify-center text-gray-400">

                No revenue data available

              </div>

            ) : (

              <div className="h-64 flex items-end justify-between gap-3 px-2">

                {revenueTrend.map(
                  (item) => {

                    const height =
                      item.revenue > 0
                        ? Math.max(
                            (item.revenue /
                              maxRevenue) *
                              100,
                            4
                          )
                        : 0;

                    return (

                      <div
                        key={item.date}
                        className="w-full flex flex-col items-center h-full"
                      >

                        {/* BAR AREA */}

                        <div className="w-full relative flex-1 flex items-end">

                          <div
                            className="w-full bg-orange-500 rounded-t-md transition-all duration-300"
                            style={{
                              height: `${height}%`,
                            }}
                            title={`₹${item.revenue.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 2,
                              }
                            )}`}
                          />

                        </div>


                        {/* DATE */}

                        <span className="text-xs font-medium text-gray-400 mt-3 whitespace-nowrap">

                          {item.label}

                        </span>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </Card>

        </div>


        {/* ===================================================
            RIGHT COLUMN
        =================================================== */}

        <div className="space-y-6">


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <Card className="p-6">

            <h3 className="text-lg font-bold text-gray-800 mb-4">

              Quick Actions

            </h3>


            <div className="grid grid-cols-2 gap-3">


              <Button
                onClick={() =>
                  navigate(
                    constants.routes.ADD_VENDOR
                  )
                }
                className="p-4 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >

                Add Vendor

              </Button>


              <button
                onClick={() =>
                  navigate(
                    constants.routes.ADD_BRANCH
                  )
                }
                className="p-4 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >

                Add Branches

              </button>

              <button
                onClick={() =>
                  navigate(
                    constants.routes.ADD_LOCATION
                  )
                }
                className="p-4 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >

                Add Locations

              </button>

              <button
                onClick={() =>
                  navigate(
                    constants.routes.VIEW_CAFES
                  )
                }
                className="p-4 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >

                View All Cafes

              </button>

            </div>

          </Card>


          {/* =================================================
              TOP SELLING ITEMS
          ================================================= */}

          <Card className="p-6">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-lg font-bold text-gray-800">

                Top Selling Items

              </h3>

              <span className="text-xs text-gray-400">

                Last 7 days

              </span>

            </div>


            <div className="space-y-4">

              {topItems.length === 0 ? (

                <p className="text-sm text-gray-400">

                  No sales data available.

                </p>

              ) : (

                topItems.map(
                  (item, i) => (

                    <div
                      key={`${item.name}-${i}`}
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

                          ₹
                          {item.revenue.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}

                        </p>


                        <p className="text-xs text-gray-500">

                          {item.sales} sold

                        </p>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </Card>

        </div>

      </div>

    </div>

  );

};