import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import { constants } from "../constants";
import { useBranch } from "@/context/BranchContext";
import { ReportsApi } from "@/apis/ReportsApi";
// import { exportReportToExcel } from "@/helpers/reportExportHelper";

type RangeType = "today" | "week" | "month" | "custom";

interface CancellationRefundSummary {
  cancelled_orders: number;
  cancelled_amount: number;
  refunded_orders: number;
  refunded_amount: number;
  pending_refunds: number;
  pending_refund_amount: number;
}


interface SalesSummary {
  orders: number;
  sales: number;
}

interface RevenueTrendItem {
  label: string;
  date: string;
  revenue: number;
}

interface ReportResponse {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  cancelled: number;
  completed: number;
  scheduled: number;

  total_sales: number;

  instant_summary: SalesSummary;
  scheduled_summary: SalesSummary;

  revenue_trend: RevenueTrendItem[];
  cancellation_refund_summary: CancellationRefundSummary;
}

const EMPTY_REPORT: ReportResponse = {
  total_orders: 0,
  total_revenue: 0,
  avg_order_value: 0,
  cancelled: 0,
  completed: 0,
  scheduled: 0,

  cancellation_refund_summary: {
    cancelled_orders: 0,
    cancelled_amount: 0,
    refunded_orders: 0,
    refunded_amount: 0,
    pending_refunds: 0,
    pending_refund_amount: 0,
  },

  total_sales: 0,
  instant_summary: {
    orders: 0,
    sales: 0,
  },

  scheduled_summary:{
    orders:0,
    sales:0,
  },

  revenue_trend: [],
};

export const ReportsPage: React.FC = () => {
  const { selectedBranchIds } = useBranch();

  // =========================================================
  // RANGE
  // =========================================================

  const [range, setRange] = useState<RangeType>("month");

  // =========================================================
  // CUSTOM DATE INPUTS
  // =========================================================

  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // These are the dates actually applied to the report.
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // =========================================================
  // UI STATE
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [report, setReport] = useState<ReportResponse>(EMPTY_REPORT);

  // =========================================================
  // FETCH REPORTS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchReports = async () => {
      // -----------------------------------------------------
      // No branches selected
      // -----------------------------------------------------

      if (!selectedBranchIds.length) {
        setReport(EMPTY_REPORT);
        setError("");
        setLoading(false);
        return;
      }

      // -----------------------------------------------------
      // Custom range requires applied dates
      // -----------------------------------------------------

      if (
        range === "custom" &&
        (!appliedStartDate || !appliedEndDate)
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log("========== REPORT REQUEST ==========");
        console.log("Branch IDs:", selectedBranchIds);
        console.log("Range:", range);
        console.log("Start Date:", appliedStartDate);
        console.log("End Date:", appliedEndDate);
        console.log("====================================");

        const data = await ReportsApi.getReports(
          selectedBranchIds,
          range,
          range === "custom"
            ? appliedStartDate
            : undefined,
          range === "custom"
            ? appliedEndDate
            : undefined,
        );

        if (!cancelled) {
          setReport({
            ...EMPTY_REPORT,
            ...data,
            cancellation_refund_summary: {
              ...EMPTY_REPORT.cancellation_refund_summary,
              ...(data?.cancellation_refund_summary ?? {}),
            },
          });
        }
      } catch (err: any) {
        console.error("Failed to load reports:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              "Failed to load reports. Please try again.",
          );

          setReport(EMPTY_REPORT);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, [
    selectedBranchIds,
    range,
    appliedStartDate,
    appliedEndDate,
  ]);

  // =========================================================
  // RANGE CHANGE
  // =========================================================

  const handleRangeChange = (newRange: RangeType) => {
    setRange(newRange);
    setError("");

    if (newRange !== "custom") {
      // Clear previously applied custom dates.
      setAppliedStartDate("");
      setAppliedEndDate("");
    }
  };

  // =========================================================
  // APPLY CUSTOM DATE
  // =========================================================

  const handleApplyCustomRange = () => {
    setError("");

    if (!customStartDate || !customEndDate) {
      setError("Please select both start date and end date.");
      return;
    }

    if (customStartDate > customEndDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    setAppliedStartDate(customStartDate);
    setAppliedEndDate(customEndDate);
    setRange("custom");
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value: number) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // REPORT VALUES
  // =========================================================

  const totalOrders = report.total_orders;
  const totalRevenue = report.total_revenue;
  const avgOrder = report.avg_order_value;
  const cancelledOrders = report.cancelled;
  const completedOrders = report.completed;
  const scheduledOrders = report.scheduled;

  const refundSummary =
    report.cancellation_refund_summary;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-10">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div>
          <h1
            className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}
          >
            Reports
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Business performance & financial insights
          </p>
        </div>

        {/* =================================================
            RANGE FILTERS
        ================================================= */}

        <div className="flex flex-wrap gap-3">
          {[
            {
              value: 'today' as RangeType,
              label: 'Today',
            },
            {
              value: 'week' as RangeType,
              label: 'This Week',
            },
            {
              value: 'month' as RangeType,
              label: 'This Month',
            },
            {
              value: 'custom' as RangeType,
              label: 'Custom',
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleRangeChange(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                range === item.value
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* EXCEL EXPORT

          <button
            type="button"
            disabled={
              loading ||
              !selectedBranchIds.length ||
              (range === 'custom' && (!appliedStartDate || !appliedEndDate))
            }
            onClick={() => {
              exportReportToExcel({
                report,
                range,
                startDate: range === 'custom' ? appliedStartDate : undefined,
                endDate: range === 'custom' ? appliedEndDate : undefined,
                branchIds: selectedBranchIds,
              });
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
              />
            </svg>
            Export Excel
          </button> */}
        </div>
      </div>

      {/* =====================================================
          CUSTOM DATE FILTER
      ===================================================== */}

      {range === 'custom' && (
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            {/* START DATE */}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>

              <input
                type="date"
                value={customStartDate}
                max={customEndDate || undefined}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setError('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* END DATE */}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>

              <input
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setError('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* APPLY */}

            <button
              type="button"
              disabled={
                !customStartDate ||
                !customEndDate ||
                customStartDate > customEndDate ||
                loading
              }
              onClick={handleApplyCustomRange}
              className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </div>

          {/* APPLIED RANGE */}

          {appliedStartDate && appliedEndDate && range === 'custom' && (
            <p className="text-xs text-gray-500 mt-4">
              Showing report from{' '}
              <span className="font-medium text-gray-700">
                {appliedStartDate}
              </span>{' '}
              to{' '}
              <span className="font-medium text-gray-700">
                {appliedEndDate}
              </span>
            </p>
          )}
        </Card>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* =====================================================
          NO BRANCH
      ===================================================== */}

      {!selectedBranchIds.length && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-3 text-sm">
          Please select at least one branch to view reports.
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="text-center text-gray-500 py-4">Loading reports...</div>
      )}

      {/* =====================================================
          KPI STRIP
      ===================================================== */}

      <div className="bg-black rounded-2xl p-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8 text-white shadow-xl">
        <KPI label="Total Orders" value={totalOrders} />

        <KPI label="Revenue" value={formatCurrency(totalRevenue)} />

        <KPI label="Avg Order Value" value={formatCurrency(avgOrder)} />

        <KPI label="Cancelled Orders" value={cancelledOrders} />

        <KPI label="Completed Orders" value={completedOrders} />

        <KPI label="Scheduled Orders" value={scheduledOrders} />
      </div>

      {/* ================= SALES SUMMARY ================= */}

      <Card className="p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sales Summary</h2>

          <p className="text-sm text-gray-500 mt-1">
            Sales generated from instant and scheduled orders
          </p>
        </div>

        {/* Total Sales */}

        <div className="rounded-xl bg-black p-6 text-white">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Total Sales
          </p>

          <p className="text-3xl font-bold mt-2">
            ₹
            {report.total_sales.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Instant / Scheduled */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <p className="text-sm font-medium text-gray-500">Instant Orders</p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {report.instant_summary.orders}
            </p>

            <p className="text-lg font-semibold text-orange-500 mt-3">
              ₹
              {report.instant_summary.sales.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <p className="text-sm font-medium text-gray-500">
              Scheduled Orders
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {report.scheduled_summary.orders}
            </p>

            <p className="text-lg font-semibold text-orange-500 mt-3">
              ₹
              {report.scheduled_summary.sales.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* =====================================================
          CANCELLATION & REFUND SUMMARY
      ===================================================== */}

      <Card className="p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Cancellation & Refund Summary
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Cancellation and refund activity for the selected period
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportMetric
            label="Cancelled Orders"
            value={refundSummary.cancelled_orders}
          />

          <ReportMetric
            label="Cancelled Amount"
            value={formatCurrency(refundSummary.cancelled_amount)}
          />

          <ReportMetric
            label="Refunded Orders"
            value={refundSummary.refunded_orders}
          />

          <ReportMetric
            label="Refunded Amount"
            value={formatCurrency(refundSummary.refunded_amount)}
          />

          <ReportMetric
            label="Pending Refunds"
            value={refundSummary.pending_refunds}
          />

          <ReportMetric
            label="Pending Refund Amount"
            value={formatCurrency(refundSummary.pending_refund_amount)}
          />
        </div>
      </Card>

      {/* ================= REVENUE TREND ================= */}

      <Card className="p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>

          <p className="text-sm text-gray-500 mt-1">
            Sales generated over the selected period
          </p>
        </div>

        {report.revenue_trend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            No revenue data available for this period.
          </div>
        ) : (
          <RevenueChart data={report.revenue_trend} />
        )}
      </Card>

      {/* =====================================================
          ORDERS BREAKDOWN
      ===================================================== */}

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Orders Breakdown</h2>

          <Breakdown
            label="Completed"
            value={
              totalOrders
                ? Math.round((completedOrders / totalOrders) * 100)
                : 0
            }
            color="bg-green-500"
          />

          <Breakdown
            label="Cancelled"
            value={
              totalOrders
                ? Math.round((cancelledOrders / totalOrders) * 100)
                : 0
            }
            color="bg-red-500"
          />

          <Breakdown
            label="Scheduled"
            value={
              totalOrders
                ? Math.round((scheduledOrders / totalOrders) * 100)
                : 0
            }
            color="bg-orange-500"
          />
        </Card>
      </div>
    </div>
  );
};

/* =========================================================
   KPI
========================================================= */

const KPI = ({
  label,
  value,
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

/* =========================================================
   BREAKDOWN
========================================================= */

const Breakdown = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="space-y-2">

    <div className="flex justify-between text-sm font-medium">
      <span>{label}</span>
      <span>{value}%</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">

      <div
        className={`${color} h-2 rounded-full transition-all`}
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
        }}
      />

    </div>

  </div>
);

/* =========================================================
   REPORT METRIC
========================================================= */

const ReportMetric = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">

    <p className="text-xs uppercase tracking-wide text-gray-500">
      {label}
    </p>

    <p className="text-2xl font-bold text-gray-900 mt-2">
      {value}
    </p>

  </div>
);


const RevenueChart = ({
  data,
}: {
  data: RevenueTrendItem[];
}) => {

  const maxRevenue = Math.max(
    ...data.map((item) => item.revenue),
    1
  );

  return (
    <div className="w-full">

      {/* Chart */}

      <div className="h-72 flex items-end gap-2 sm:gap-4 overflow-x-auto border-b border-gray-200">

        {data.map((item, index) => {

          const height =
            item.revenue === 0
              ? 0
              : Math.max(
                  (item.revenue / maxRevenue) * 220,
                  4
                );

          return (
            <div
              key={`${item.date}-${index}`}
              className="flex-1 min-w-[45px] h-full flex flex-col justify-end items-center"
            >

              {/* Revenue value */}

              {item.revenue > 0 && (
                <span className="text-xs text-gray-500 mb-2 whitespace-nowrap">
                  ₹
                  {item.revenue.toLocaleString("en-IN")}
                </span>
              )}

              {/* Bar */}

              <div
                className="w-8 sm:w-10 bg-orange-500 rounded-t-lg transition-all duration-300 hover:bg-orange-600"
                style={{
                  height: `${height}px`,
                }}
                title={`${item.label}: ₹${item.revenue.toLocaleString(
                  "en-IN"
                )}`}
              />

              {/* Date */}

              <span className="text-xs text-gray-500 mt-3 whitespace-nowrap">
                {item.label}
              </span>

            </div>
          );
        })}

      </div>

      {/* Total */}

      <div className="flex justify-between items-center mt-5">

        <span className="text-sm text-gray-500">
          Total Revenue
        </span>

        <span className="text-lg font-bold text-gray-900">
          ₹
          {data
            .reduce(
              (total, item) => total + item.revenue,
              0
            )
            .toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </span>

      </div>

    </div>
  );
};