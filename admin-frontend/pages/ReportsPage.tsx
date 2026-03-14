import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import { constants } from "../constants";
import { useBranch } from "@/context/BranchContext";
import { ReportsApi } from "@/apis/ReportsApi";

type RangeType = "today" | "week" | "month";

interface ReportResponse {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  cancelled: number;
  completed: number;
  scheduled: number;
}

export const ReportsPage: React.FC = () => {

  const { selectedBranchIds } = useBranch();

  const [range, setRange] = useState<RangeType>("month");

  const [loading, setLoading] = useState(false);

  const [report, setReport] = useState<ReportResponse>({
    total_orders: 0,
    total_revenue: 0,
    avg_order_value: 0,
    cancelled: 0,
    completed: 0,
    scheduled: 0
  });

  /* ================= Fetch Reports ================= */

  useEffect(() => {

    const fetchReports = async () => {

      if (!selectedBranchIds.length) {
        setReport({
          total_orders: 0,
          total_revenue: 0,
          avg_order_value: 0,
          cancelled: 0,
          completed: 0,
          scheduled: 0
        });
        return;
      }

      try {

        setLoading(true);

        const data = await ReportsApi.getReports(
          selectedBranchIds,
          range
        );

        setReport(data);

      } catch (err) {

        console.error("Failed to load reports", err);

      } finally {

        setLoading(false);

      }

    };

    fetchReports();

  }, [selectedBranchIds, range]);

  const totalOrders = report.total_orders;
  const totalRevenue = report.total_revenue;
  const avgOrder = report.avg_order_value;
  const cancelled = report.cancelled;
  const completed = report.completed;
  const scheduled = report.scheduled;

  return (
    <div className="space-y-10">

      {/* ================= Header ================= */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>
            Reports
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Business performance & financial insights
          </p>
        </div>

        {/* Range Filters */}

        <div className="flex gap-3">

          {["today", "week", "month"].map(r => (

            <button
              key={r}
              onClick={() => setRange(r as RangeType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                range === r
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            >

              {r === "today"
                ? "Today"
                : r === "week"
                ? "This Week"
                : "This Month"}

            </button>

          ))}

        </div>

      </div>

      {/* ================= Loading ================= */}

      {loading && (
        <div className="text-center text-gray-500">
          Loading reports...
        </div>
      )}

      {/* ================= KPI Strip ================= */}

      <div className="bg-black rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-10 text-white shadow-xl">

        <KPI label="Total Orders" value={totalOrders} />

        <KPI
          label="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
        />

        <KPI
          label="Avg Order Value"
          value={`₹${avgOrder}`}
        />

        <KPI label="Cancelled Orders" value={cancelled} />

        <KPI label="Completed Orders" value={completed} />

        <KPI label="Scheduled Orders" value={scheduled} />

      </div>

      {/* ================= Revenue Trend (placeholder until backend chart API) ================= */}

      <Card className="p-8 space-y-6">

        <h2 className="text-xl font-bold text-gray-900">
          Revenue Trend
        </h2>

        <div className="h-64 flex items-end gap-6">

          {[12000, 18000, 14000, 22000, 26000, 20000, 30000].map(
            (val, index) => (

              <div key={index} className="flex flex-col items-center w-full">

                <div
                  className="bg-orange-500 rounded-md w-8 transition-all"
                  style={{ height: `${val / 200}px` }}
                />

                <p className="text-xs mt-2 text-gray-500">
                  Day {index + 1}
                </p>

              </div>

            )
          )}

        </div>

      </Card>

      {/* ================= Breakdown ================= */}

      <div className="grid md:grid-cols-2 gap-8">

        <Card className="p-8 space-y-6">

          <h2 className="text-lg font-bold text-gray-900">
            Orders Breakdown
          </h2>

          <Breakdown
            label="Completed"
            value={`${totalOrders ? Math.round((completed / totalOrders) * 100) : 0}%`}
            color="bg-green-500"
          />

          <Breakdown
            label="Cancelled"
            value={`${totalOrders ? Math.round((cancelled / totalOrders) * 100) : 0}%`}
            color="bg-red-500"
          />

          <Breakdown
            label="Scheduled"
            value={`${totalOrders ? Math.round((scheduled / totalOrders) * 100) : 0}%`}
            color="bg-orange-500"
          />

        </Card>

      </div>

    </div>
  );
};

/* ======================================================
   Components
====================================================== */

const KPI = ({
  label,
  value
}: {
  label: string;
  value: number | string;
}) => (
  <div>
    <p className="text-xs uppercase text-gray-400 tracking-wide">
      {label}
    </p>
    <p className="text-3xl font-bold mt-2 text-white">
      {value}
    </p>
  </div>
);

const Breakdown = ({
  label,
  value,
  color
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className="space-y-2">

    <div className="flex justify-between text-sm font-medium">
      <span>{label}</span>
      <span>{value}</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-2">

      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: value }}
      />

    </div>

  </div>
);