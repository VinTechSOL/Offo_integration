import * as XLSX from "xlsx";

/* =========================================================
   TYPES
========================================================= */

export interface CancellationRefundSummary {
  cancelled_orders: number;
  cancelled_amount: number;
  refunded_orders: number;
  refunded_amount: number;
  pending_refunds: number;
  pending_refund_amount: number;
}

export interface SalesSummary {
  orders: number;
  sales: number;
}

export interface RevenueTrendItem {
  label: string;
  date: string;
  revenue: number;
}

export interface ReportExportData {
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

export interface ReportExportOptions {
  report: ReportExportData;

  range: "today" | "week" | "month" | "custom";

  startDate?: string;

  endDate?: string;

  branchIds?: string[];
}

/* =========================================================
   CURRENCY FORMATTER
========================================================= */

const formatCurrency = (value: number | undefined | null) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/* =========================================================
   RANGE LABEL
========================================================= */

const getRangeLabel = (
  range: ReportExportOptions["range"]
) => {
  switch (range) {
    case "today":
      return "Today";

    case "week":
      return "This Week";

    case "month":
      return "This Month";

    case "custom":
      return "Custom";

    default:
      return range;
  }
};

/* =========================================================
   GENERATE FILE NAME
========================================================= */

const generateFileName = (
  options: ReportExportOptions
) => {
  const {
    range,
    startDate,
    endDate,
  } = options;

  if (
    range === "custom" &&
    startDate &&
    endDate
  ) {
    return `OFFO_Report_${startDate}_to_${endDate}.xlsx`;
  }

  return `OFFO_Report_${range}_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
};

/* =========================================================
   EXPORT REPORT TO EXCEL
========================================================= */

export const exportReportToExcel = ({
  report,
  range,
  startDate,
  endDate,
  branchIds,
}: ReportExportOptions) => {

  /* =======================================================
     WORKBOOK
  ======================================================= */

  const workbook = XLSX.utils.book_new();

  /* =======================================================
     REPORT INFORMATION
  ======================================================= */

  const reportInfo = [
    ["OFFO Vendor Performance Report"],

    [],

    ["Report Period", getRangeLabel(range)],

    ...(range === "custom"
      ? [
          ["Start Date", startDate || ""],
          ["End Date", endDate || ""],
        ]
      : []),

    [
      "Branches Included",
      branchIds?.length
        ? branchIds.join(", ")
        : "All",
    ],

    [
      "Generated On",
      new Date().toLocaleString("en-IN"),
    ],
  ];

  /* =======================================================
     SALES SUMMARY
  ======================================================= */

  const salesSummary = [
    ["SALES SUMMARY"],

    [],

    ["Metric", "Orders", "Sales"],

    [
      "Instant Orders",
      report.instant_summary.orders,
      formatCurrency(
        report.instant_summary.sales
      ),
    ],

    [
      "Scheduled Orders",
      report.scheduled_summary.orders,
      formatCurrency(
        report.scheduled_summary.sales
      ),
    ],

    [
      "Total Sales",
      report.total_orders,
      formatCurrency(
        report.total_sales
      ),
    ],
  ];

  /* =======================================================
     OVERALL ORDER SUMMARY
  ======================================================= */

  const orderSummary = [
    ["ORDER SUMMARY"],

    [],

    ["Metric", "Value"],

    [
      "Total Orders",
      report.total_orders,
    ],

    [
      "Completed Orders",
      report.completed,
    ],

    [
      "Cancelled Orders",
      report.cancelled,
    ],

    [
      "Scheduled Orders",
      report.scheduled,
    ],

    [
      "Average Order Value",
      formatCurrency(
        report.avg_order_value
      ),
    ],
  ];

  /* =======================================================
     CANCELLATION & REFUND SUMMARY
  ======================================================= */

  const refund =
    report.cancellation_refund_summary;

  const cancellationRefundSummary = [
    ["CANCELLATION & REFUND SUMMARY"],

    [],

    ["Metric", "Orders", "Amount"],

    [
      "Cancelled",
      refund.cancelled_orders,
      formatCurrency(
        refund.cancelled_amount
      ),
    ],

    [
      "Refunded",
      refund.refunded_orders,
      formatCurrency(
        refund.refunded_amount
      ),
    ],

    [
      "Pending Refunds",
      refund.pending_refunds,
      formatCurrency(
        refund.pending_refund_amount
      ),
    ],
  ];

  /* =======================================================
     REVENUE TREND
  ======================================================= */

  const revenueTrend = [
    ["REVENUE TREND"],

    [],

    ["Date", "Label", "Revenue"],

    ...report.revenue_trend.map(
      (item) => [
        item.date,
        item.label,
        formatCurrency(item.revenue),
      ]
    ),

    [],

    [
      "Total",
      "",
      formatCurrency(
        report.revenue_trend.reduce(
          (total, item) =>
            total + Number(item.revenue || 0),
          0
        )
      ),
    ],
  ];

  /* =======================================================
     CREATE SHEETS
  ======================================================= */

  const infoSheet =
    XLSX.utils.aoa_to_sheet(
      reportInfo
    );

  const salesSheet =
    XLSX.utils.aoa_to_sheet(
      salesSummary
    );

  const orderSheet =
    XLSX.utils.aoa_to_sheet(
      orderSummary
    );

  const refundSheet =
    XLSX.utils.aoa_to_sheet(
      cancellationRefundSummary
    );

  const revenueSheet =
    XLSX.utils.aoa_to_sheet(
      revenueTrend
    );

  /* =======================================================
     COLUMN WIDTHS
  ======================================================= */

  infoSheet["!cols"] = [
    { wch: 25 },
    { wch: 35 },
  ];

  salesSheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
  ];

  orderSheet["!cols"] = [
    { wch: 28 },
    { wch: 20 },
  ];

  refundSheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
  ];

  revenueSheet["!cols"] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
  ];

  /* =======================================================
     ADD SHEETS TO WORKBOOK
  ======================================================= */

  XLSX.utils.book_append_sheet(
    workbook,
    infoSheet,
    "Report Info"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    salesSheet,
    "Sales Summary"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    orderSheet,
    "Order Summary"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    refundSheet,
    "Cancellation Refund"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    revenueSheet,
    "Revenue Trend"
  );

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const fileName =
    generateFileName({
      report,
      range,
      startDate,
      endDate,
      branchIds,
    });

  XLSX.writeFile(
    workbook,
    fileName
  );
};