import jsPDF from "jspdf";

interface InvoiceItem {
  item_id: number;
  name: string;
  quantity: number;
  price_at_time: number;
  image_url?: string | null;
}

interface InvoiceDetails {
  order_id: number;

  order_type?: string;
  order_status?: string;
  payment_status?: string;

  created_at: string;
  updated_at?: string | null;

  cafe_id: number;
  cafe_name?: string | null;
  branch_id: number;

  fssai_license_number?: string | null;

  scheduled_time?: string | null;

  bill: {
    subtotal: number;
    platform_fee: number;
    gst: number;
    convenience_fee: number;
    total: number;
  };

  payment: {
    status?: string;
    intent_status?: string | null;
    gateway?: string | null;
    transaction_id?: string | null;
    paid_at?: string | null;
  };

  items: InvoiceItem[];
}

/* ============================================================
   HELPERS
============================================================ */

const formatAmount = (amount: number): string => {
  return `INR ${Number(amount ?? 0).toFixed(2)}`;
};

const formatDateTime = (
  dateString?: string | null,
): string => {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const safeText = (
  value?: string | null,
  fallback = "N/A",
): string => {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value;
};

/* ============================================================
   MAIN INVOICE GENERATOR
============================================================ */

export const generateInvoice = (
  details: InvoiceDetails,
): void => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  /* ==========================================================
     PAGE SETTINGS
  ========================================================== */

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const marginLeft = 18;
  const marginRight = 18;

  const contentWidth =
    pageWidth - marginLeft - marginRight;

  /* ==========================================================
     OFFO BRAND COLORS
  ========================================================== */

  const OFFO_ORANGE: [number, number, number] = [
    249,
    115,
    22,
  ];

  const OFFO_LIGHT_ORANGE: [number, number, number] = [
    255,
    247,
    237,
  ];

  const DARK: [number, number, number] = [
    31,
    41,
    55,
  ];

  const GRAY: [number, number, number] = [
    107,
    114,
    128,
  ];

  const LIGHT_GRAY: [number, number, number] = [
    229,
    231,
    235,
  ];

  const WHITE: [number, number, number] = [
    255,
    255,
    255,
  ];

  const GREEN: [number, number, number] = [
    22,
    163,
    74,
  ];

  /* ==========================================================
     HEADER
  ========================================================== */

  let y = 18;

  // OFFO
  pdf.setTextColor(...OFFO_ORANGE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);

  pdf.text(
    "OFFO.",
    pageWidth / 2,
    y,
    {
      align: "center",
    },
  );

  y += 7;

  // Tagline
  pdf.setTextColor(...GRAY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.text(
    "Order Food From Office.",
    pageWidth / 2,
    y,
    {
      align: "center",
    },
  );

  y += 13;

  // Invoice title
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);

  pdf.text(
    "INVOICE",
    pageWidth / 2,
    y,
    {
      align: "center",
    },
  );

  y += 12;

  /* ==========================================================
     ORDER INFORMATION BOX
  ========================================================== */

  pdf.setFillColor(...OFFO_LIGHT_ORANGE);

  pdf.roundedRect(
    marginLeft,
    y,
    contentWidth,
    38,
    3,
    3,
    "F",
  );

  const infoX = marginLeft + 5;
  const infoRight = pageWidth - marginRight - 5;

  // Left information
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);

  pdf.text(
    `Order ID: #${details.order_id}`,
    infoX,
    y + 8,
  );

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GRAY);

  pdf.text(
    `Order Date: ${formatDateTime(details.created_at)}`,
    infoX,
    y + 14,
  );

  // Cafe
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);

  pdf.text(
    safeText(details.cafe_name, "Cafe"),
    infoX,
    y + 23,
  );

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(9);

  

  // FSSAI
  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);

  pdf.text(
    "FSSAI License No.",
    infoRight - 48,
    y + 8,
  );

  pdf.setFont("helvetica", "normal");

  pdf.text(
    safeText(
      details.fssai_license_number,
      "Not available",
    ),
    infoRight,
    y + 8,
    {
      align: "right",
    },
  );

  y += 47;

  /* ==========================================================
     ITEMS TABLE HEADER
  ========================================================== */

  const tableHeaderHeight = 9;

  pdf.setFillColor(...OFFO_ORANGE);

  pdf.roundedRect(
    marginLeft,
    y,
    contentWidth,
    tableHeaderHeight,
    2,
    2,
    "F",
  );

  pdf.setTextColor(...WHITE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);

  pdf.text(
    "Items",
    marginLeft + 4,
    y + 6,
  );

  pdf.text(
    "Amount",
    pageWidth - marginRight - 4,
    y + 6,
    {
      align: "right",
    },
  );

  y += tableHeaderHeight;

  /* ==========================================================
     ITEMS
  ========================================================== */

  const itemRowHeight = 9;

  details.items.forEach((item, index) => {
    const rowY = y;

    // Alternating subtle background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);

      pdf.rect(
        marginLeft,
        rowY,
        contentWidth,
        itemRowHeight,
        "F",
      );
    }

    pdf.setTextColor(...DARK);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    const itemText =
      `${item.quantity} × ${item.name}`;

    pdf.text(
      itemText,
      marginLeft + 4,
      rowY + 6,
    );

    const itemTotal =
      Number(item.price_at_time) *
      Number(item.quantity);

    pdf.text(
      formatAmount(itemTotal),
      pageWidth - marginRight - 4,
      rowY + 6,
      {
        align: "right",
      },
    );

    y += itemRowHeight;
  });

  /* ==========================================================
     ITEMS BOTTOM BORDER
  ========================================================== */

  pdf.setDrawColor(...LIGHT_GRAY);

  pdf.line(
    marginLeft,
    y,
    pageWidth - marginRight,
    y,
  );

  y += 7;

  /* ==========================================================
     BILL SUMMARY
  ========================================================== */

  const labelX = marginLeft + 4;
  const amountX = pageWidth - marginRight - 4;

  pdf.setFontSize(9);

  // Items Total
  pdf.setTextColor(...GRAY);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    "Items Total",
    labelX,
    y,
  );

  pdf.setTextColor(...DARK);

  pdf.text(
    formatAmount(details.bill.subtotal),
    amountX,
    y,
    {
      align: "right",
    },
  );

  y += 7;

  // Platform Fee
  pdf.setTextColor(...GRAY);

  pdf.text(
    "Platform Fee",
    labelX,
    y,
  );

  pdf.setTextColor(...DARK);

  pdf.text(
    formatAmount(details.bill.platform_fee),
    amountX,
    y,
    {
      align: "right",
    },
  );

  y += 7;

  // GST
  pdf.setTextColor(...GRAY);

  pdf.text(
    "GST (18%)",
    labelX,
    y,
  );

  pdf.setTextColor(...DARK);

  pdf.text(
    formatAmount(details.bill.gst),
    amountX,
    y,
    {
      align: "right",
    },
  );

  y += 5;

  /* ==========================================================
     TOTAL PAID
  ========================================================== */

  pdf.setFillColor(...OFFO_LIGHT_ORANGE);

  pdf.roundedRect(
    marginLeft,
    y,
    contentWidth,
    13,
    2,
    2,
    "F",
  );

  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);

  pdf.text(
    "Total Paid",
    labelX,
    y + 8,
  );

  pdf.setTextColor(...OFFO_ORANGE);
  pdf.setFontSize(12);

  pdf.text(
    formatAmount(details.bill.total),
    amountX,
    y + 8,
    {
      align: "right",
    },
  );

  y += 21;

  /* ==========================================================
     PAYMENT DETAILS
  ========================================================== */

  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);

  pdf.text(
    "Payment Details",
    marginLeft,
    y,
  );

  y += 7;

  const paymentBoxHeight = 30;

  pdf.setFillColor(249, 250, 251);

  pdf.roundedRect(
    marginLeft,
    y,
    contentWidth,
    paymentBoxHeight,
    2,
    2,
    "F",
  );

  const paymentX = marginLeft + 5;
  const paymentValueX =
    pageWidth - marginRight - 5;

  // Payment Method
  pdf.setTextColor(...GRAY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.text(
    "Payment Method",
    paymentX,
    y + 8,
  );

  pdf.setTextColor(...DARK);
  pdf.setFont("helvetica", "bold");

  // Always show UPI
  pdf.text(
    "UPI",
    paymentValueX,
    y + 8,
    {
      align: "right",
    },
  );

  // Payment Date & Time
  pdf.setTextColor(...GRAY);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    "Payment Date & Time",
    paymentX,
    y + 16,
  );

  pdf.setTextColor(...DARK);

  pdf.text(
    formatDateTime(details.payment.paid_at),
    paymentValueX,
    y + 16,
    {
      align: "right",
    },
  );

  // Transaction ID
  if (details.payment.transaction_id) {
    pdf.setTextColor(...GRAY);

    pdf.text(
      "Transaction ID",
      paymentX,
      y + 24,
    );

    pdf.setTextColor(...DARK);
    pdf.setFontSize(8);

    pdf.text(
      details.payment.transaction_id,
      paymentValueX,
      y + 24,
      {
        align: "right",
      },
    );
  }

  y += paymentBoxHeight + 12;

  /* ==========================================================
     SCHEDULED ORDER NOTE
  ========================================================== */

  // If this order has no platform fee, it means the fee was
  // already included in another scheduled order.
  if (
    Number(details.bill.platform_fee) === 0 &&
    Number(details.bill.gst) === 0
  ) {
    pdf.setFillColor(...OFFO_LIGHT_ORANGE);

    pdf.roundedRect(
      marginLeft,
      y,
      contentWidth,
      20,
      2,
      2,
      "F",
    );

    pdf.setTextColor(...OFFO_ORANGE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);

    pdf.text(
      "Fee Note",
      marginLeft + 5,
      y + 7,
    );

    pdf.setTextColor(...GRAY);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    pdf.text(
      "Platform Fee + GST were already included",
      marginLeft + 5,
      y + 13,
    );

    pdf.text(
      "in another scheduled order. No extra fee was charged.",
      marginLeft + 5,
      y + 17,
    );

    y += 27;
  }

  /* ==========================================================
     FOOTER
  ========================================================== */

  const footerY = pageHeight - 20;

  pdf.setDrawColor(...LIGHT_GRAY);

  pdf.line(
    marginLeft,
    footerY - 5,
    pageWidth - marginRight,
    footerY - 5,
  );

  pdf.setTextColor(...GRAY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(
    "Thank you for ordering with OFFO.",
    pageWidth / 2,
    footerY + 1,
    {
      align: "center",
    },
  );

  pdf.setTextColor(...OFFO_ORANGE);
  pdf.setFont("helvetica", "bold");

  pdf.text(
    "Order Food From Office.",
    pageWidth / 2,
    footerY + 6,
    {
      align: "center",
    },
  );

  /* ==========================================================
     SAVE
  ========================================================== */

  pdf.save(
    `OFFO-Invoice-${details.order_id}.pdf`,
  );
};

export default generateInvoice;