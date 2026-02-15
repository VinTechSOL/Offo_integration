import React, { useState, useEffect } from "react";
import { ReportsApi } from "@/apis/report";
import { StatCard } from "../components/StatCard";
import { PhoneIcon } from "../components/icons";

type ReportView = "overview" | "menu-performance" | "customer-insights";

const ReportTabs: React.FC<{
  currentView: ReportView;
  setCurrentView: (view: ReportView) => void;
}> = ({ currentView, setCurrentView }) => {

  const baseClasses =
    "py-2 px-4 rounded-md font-semibold transition-colors duration-200";
  const activeClasses = "bg-offo-orange text-white shadow-md";
  const inactiveClasses =
    "bg-white text-text-primary hover:bg-offo-tan shadow-sm";

  const tabs: { key: ReportView; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "menu-performance", label: "Menu Performance" },
    { key: "customer-insights", label: "Customer Insights" },
  ];

  return (
    <div className="flex items-center space-x-2 mb-6 p-1 bg-offo-tan-light rounded-lg overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setCurrentView(tab.key)}
          className={`${baseClasses} ${
            currentView === tab.key ? activeClasses : inactiveClasses
          } flex-shrink-0`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export const ReportsDashboard: React.FC = () => {
  const [reportView, setReportView] = useState<ReportView>("overview");

  const [overview, setOverview] = useState<any>(null);
  const [menuPerformance, setMenuPerformance] = useState<any[]>([]);
  const [customerInsights, setCustomerInsights] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, menuRes, customerRes] = await Promise.all([
        ReportsApi.getOverview(),
        ReportsApi.getMenuPerformance(),
        ReportsApi.getCustomerInsights(),
      ]);

      setOverview(overviewRes);
      setMenuPerformance(menuRes);
      setCustomerInsights(customerRes);
    } catch (err) {
      console.error("Failed to load reports", err);
    }
  };

  const renderContent = () => {
    if (!overview) return <div>Loading...</div>;

    switch (reportView) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-gray-800 p-4 rounded-lg shadow-lg grid grid-cols-2 gap-4 sm:flex text-white">
              <StatCard title="Total Revenue" value={`₹${overview.total_revenue.toFixed(2)}`} />
              <StatCard title="Total Orders" value={overview.total_orders} />
              <StatCard title="Avg. Order Value" value={`₹${overview.average_order_value.toFixed(2)}`} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="text-xl font-bold">Order Status Distribution</h3>

              {Object.entries(overview.status_distribution).map(([status, count]) => (
                <div
                  key={status}
                  className="bg-gray-50 p-3 rounded-md border flex justify-between"
                >
                  <span>{status}</span>
                  <span className="font-bold">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "menu-performance":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-xl font-bold">Top Selling Menu Items</h3>

            {menuPerformance.map((item) => (
              <div
                key={item.item_id}
                className="flex items-center p-3 rounded-md bg-gray-50 border"
              >
                <img
                  src={`http://localhost:8000${item.image_url}`}
                  alt={item.name}
                  className="w-12 h-12 rounded-md object-cover mr-4"
                />

                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
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

      case "customer-insights":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-xl font-bold">Most Frequent Customers</h3>

            {customerInsights.map((customer) => (
              <div
                key={customer.user_id}
                className="flex items-center p-3 rounded-md bg-gray-50 border"
              >
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {customer.name}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <a href={`tel:${customer.phone}`}>
                      {customer.phone}
                    </a>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">
                    {customer.total_orders}
                  </p>
                  <p className="text-sm">Total Orders</p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fadeIn">
      <ReportTabs currentView={reportView} setCurrentView={setReportView} />
      {renderContent()}
    </div>
  );
};
