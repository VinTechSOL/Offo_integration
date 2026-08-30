import React, { useState, useEffect } from "react";

import { ReportsApi } from "@/apis/report";

import { StatCard } from "../components/StatCard";




type ReportView =
  | "overview"
  | "menu-performance"
  | "customer-insights";


const ReportTabs: React.FC<{
  currentView: ReportView;
  setCurrentView: (view: ReportView) => void;
}> = ({
  currentView,
  setCurrentView,
}) => {

  const baseClasses =
    "py-2 px-4 rounded-md font-semibold transition-colors duration-200";

  const activeClasses =
    "bg-offo-orange text-white shadow-md";

  const inactiveClasses =
    "bg-white text-text-primary hover:bg-offo-tan shadow-sm";

  const tabs: {
    key: ReportView;
    label: string;
  }[] = [
    {
      key: "overview",
      label: "Overview",
    },
    {
      key: "menu-performance",
      label: "Menu Performance",
    },
    {
      key: "customer-insights",
      label: "Customer Insights",
    },
  ];

  return (
    <div className="flex items-center space-x-2 mb-6 p-1 bg-offo-tan-light rounded-lg overflow-x-auto">

      {tabs.map((tab) => (

        <button
          key={tab.key}
          onClick={() => setCurrentView(tab.key)}
          className={`${baseClasses} ${
            currentView === tab.key
              ? activeClasses
              : inactiveClasses
          } flex-shrink-0`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};


export const ReportsDashboard: React.FC = () => {

  const [reportView, setReportView] =
    useState<ReportView>("overview");

  const [overview, setOverview] =
    useState<any>(null);

  const [menuPerformance, setMenuPerformance] =
    useState<any[]>([]);

  const [customerInsights, setCustomerInsights] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  // -------------------------
  // FILTER STATE
  // -------------------------

  const [filterBy, setFilterBy] =
    useState("1w");

  const [customStartDate, setCustomStartDate] =
    useState("");

  const [customEndDate, setCustomEndDate] =
    useState("");

  // -------------------------
  // LOAD DATA
  // -------------------------

  const loadData = async () => {

    try {

      setLoading(true);

      const params: any = {};

      if (filterBy === "custom") {

        if (customStartDate) {
          params.start_date = customStartDate;
        }

        if (customEndDate) {
          params.end_date = customEndDate;
        }

      } else {

        params.filter_by = filterBy;
      }

      const [
        overviewRes,
        menuRes,
        customerRes,
      ] = await Promise.all([
        ReportsApi.getOverview(params),

        ReportsApi.getMenuPerformance(params),

        ReportsApi.getCustomerInsights(params),
      ]);

      setOverview(overviewRes);

      setMenuPerformance(menuRes);

      setCustomerInsights(customerRes);

    } catch (err) {

      console.error(
        "Failed to load reports",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  // -------------------------
  // EFFECT
  // -------------------------

  useEffect(() => {

    loadData();

  }, [
    filterBy,
    customStartDate,
    customEndDate,
  ]);

  // -------------------------
  // RENDER CONTENT
  // -------------------------

  const renderContent = () => {

    if (loading || !overview) {

      return (
        <div className="text-center py-10">
          Loading reports...
        </div>
      );
    }

    switch (reportView) {

      // =====================
      // OVERVIEW
      // =====================

      case "overview":

        return (

          <div className="space-y-6">

            {/* TOP STATS */}

            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-gray-800 p-4 rounded-lg shadow-lg grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 text-white">

              <StatCard
                title="Total Revenue"
                value={`₹${overview.total_revenue.toFixed(2)}`}
              />

              <StatCard
                title="Total Orders"
                value={overview.total_orders}
              />

              <StatCard
                title="Instant Orders"
                value={overview.instant_orders}
              />

              <StatCard
                title="Scheduled Orders"
                value={overview.scheduled_orders}
              />

              <StatCard
                title="Avg. Order Value"
                value={`₹${overview.average_order_value.toFixed(2)}`}
              />
            </div>

            {/* STATUS DISTRIBUTION */}

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">

              <h3 className="text-xl font-bold">
                Order Status Distribution
              </h3>

              {Object.entries(
                overview.status_distribution
              ).map(([status, count]) => (

                <div
                  key={status}
                  className="bg-gray-50 p-3 rounded-md border flex justify-between"
                >
                  <span>
                    {status}
                  </span>

                  <span className="font-bold">
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      // =====================
      // MENU PERFORMANCE
      // =====================

      case "menu-performance":

        return (

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">

            <h3 className="text-xl font-bold">
              Top Selling Menu Items
            </h3>

            {menuPerformance.map((item) => (

              <div
                key={item.item_id}
                className="flex items-center p-3 rounded-md bg-gray-50 border"
              >

                <img src={item.image_url || "/placeholder-food.png"} alt={item.name} className="w-12 h-12 rounded-md object-cover mr-4 bg-gray-100" onError={(e) => { e.currentTarget.src = "/placeholder-food.png";}} />

                <div className="flex-1">

                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Category: {item.category}
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-bold">
                    {item.total_quantity_sold} sold
                  </p>

                  <p className="text-offo-orange">
                    ₹{item.total_revenue_generated.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      // =====================
      // CUSTOMER INSIGHTS
      // =====================

      case "customer-insights":

        return (

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">

            <h3 className="text-xl font-bold">
              Most Frequent Customers
            </h3>

            {customerInsights.map((customer) => (

              <div
                key={customer.user_id}
                className="flex items-center p-3 rounded-md bg-gray-50 border"
              >

                <div className="flex-1">

                  <p className="font-semibold text-lg">
                    {customer.name}
                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold text-lg">
                    {customer.total_orders}
                  </p>

                  <p className="text-sm">
                    Total Orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      default:

        return null;
    }
  };

  // =====================
  // MAIN RETURN
  // =====================

  return (

    <div className="animate-fadeIn">

      <ReportTabs
        currentView={reportView}
        setCurrentView={setReportView}
      />

      {/* FILTERS */}

      <div className="flex flex-wrap gap-2 mb-6">

        {[
          "1d",
          "1w",
          "1m",
          "1y",
          "custom",
        ].map((filter) => (

          <button
            key={filter}
            onClick={() => setFilterBy(filter)}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              filterBy === filter
                ? "bg-offo-orange text-white"
                : "bg-white border"
            }`}
          >
            {filter.toUpperCase()}
          </button>
        ))}

        {filterBy === "custom" && (

          <div className="flex gap-2 flex-wrap">

            <input
              type="date"
              value={customStartDate}
              onChange={(e) =>
                setCustomStartDate(
                  e.target.value
                )
              }
              className="border rounded-md px-3 py-2"
            />

            <input
              type="date"
              value={customEndDate}
              onChange={(e) =>
                setCustomEndDate(
                  e.target.value
                )
              }
              className="border rounded-md px-3 py-2"
            />
          </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
};