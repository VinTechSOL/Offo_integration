import api from "./client";

export type ReportRange =
  | "today"
  | "week"
  | "month"
  | "custom";

export const ReportsApi = {
  getReports: async (
    branchIds: string[],
    range: ReportRange,
    startDate?: string,
    endDate?: string,
  ) => {
    const params = new URLSearchParams();

    // ---------------------------------------------------------
    // Branch IDs
    // Produces:
    // branch_ids=1&branch_ids=2&branch_ids=3
    // ---------------------------------------------------------

    branchIds.forEach((id) => {
      params.append("branch_ids", id);
    });

    // ---------------------------------------------------------
    // Range
    // ---------------------------------------------------------

    params.append("range", range);

    // ---------------------------------------------------------
    // Custom date range
    // Only send these for custom reports
    // ---------------------------------------------------------

    if (range === "custom") {
      if (startDate) {
        params.append("start_date", startDate);
      }

      if (endDate) {
        params.append("end_date", endDate);
      }
    }

    // ---------------------------------------------------------
    // Debug
    // ---------------------------------------------------------

    console.log(
      "Reports request:",
      `/staff/customised-reports?${params.toString()}`
    );

    const res = await api.get(
      `/staff/customised-reports?${params.toString()}`
    );

    return res.data;
  },
};