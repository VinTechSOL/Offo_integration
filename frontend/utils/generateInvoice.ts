
interface ReceiptItem {
  item_id: number;
  name: string;
  quantity: number;
  price_at_time: number;
}

interface ReceiptDetails {
  order_id: number;

  cafe_name?: string | null;
  fssai_license_number?: string | null;

  order_type: 'INSTANT' | 'SCHEDULED';
  order_status: string;
  payment_status: string;

  scheduled_time?: string | null;

  created_at: string;
  updated_at?: string | null;

  bill: {
    subtotal: number;
    platform_fee: number;
    gst: number;
    convenience_fee: number;
    total: number;
  };

  payment: {
    status?: string;
    transaction_id?: string | null;
    paid_at?: string | null;
  };

  items: ReceiptItem[];
}

/* ============================================================
   HELPERS
============================================================ */

const RECEIPT_WIDTH = 40;

const separator = (): string => {
  return '='.repeat(RECEIPT_WIDTH);
};

const dashSeparator = (): string => {
  return '-'.repeat(RECEIPT_WIDTH);
};

const formatAmount = (amount: number): string => {
  return `₹${Number(amount ?? 0).toFixed(2)}`;
};

const formatDateTime = (
  dateString?: string | null,
): string => {
  if (!dateString) {
    return 'N/A';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date
    .toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', ',');
};

const formatDate = (
  dateString?: string | null,
): string => {
  if (!dateString) {
    return 'N/A';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (
  dateString?: string | null,
): string => {
  if (!dateString) {
    return 'N/A';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const safeText = (
  value?: string | null,
  fallback = 'N/A',
): string => {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value.trim();
};

const padRight = (
  text: string,
  length: number,
): string => {
  if (text.length >= length) {
    return text.slice(0, length);
  }

  return text + ' '.repeat(length - text.length);
};

const padLeft = (
  text: string,
  length: number,
): string => {
  if (text.length >= length) {
    return text.slice(0, length);
  }

  return ' '.repeat(length - text.length) + text;
};

const centerText = (
  text: string,
): string => {
  if (text.length >= RECEIPT_WIDTH) {
    return text.slice(0, RECEIPT_WIDTH);
  }

  const totalPadding = RECEIPT_WIDTH - text.length;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;

  return (
    ' '.repeat(leftPadding) +
    text +
    ' '.repeat(rightPadding)
  );
};

/* ============================================================
   MAIN RECEIPT GENERATOR
============================================================ */

export const generateReceipt = (
  details: ReceiptDetails,
): void => {
  const lines: string[] = [];

  /* ==========================================================
     HEADER
  ========================================================== */

  lines.push(separator());
  lines.push(centerText('OFFO'));
  lines.push(centerText('Order Food From Office.'));
  lines.push(separator());
  lines.push(centerText('ORDER RECEIPT'));
  lines.push('');

  /* ==========================================================
     ORDER DETAILS
  ========================================================== */

  lines.push(
    `${padRight('Order ID', 16)}: #${details.order_id}`,
  );

  lines.push(
    `${padRight('Order Type', 16)}: ${
      details.order_type === 'SCHEDULED'
        ? 'Scheduled Order'
        : 'Instant Order'
    }`,
  );

  lines.push(
    `${padRight('Cafe', 16)}: ${safeText(
      details.cafe_name,
      'N/A',
    )}`,
  );

  lines.push(
    `${padRight('Order Date', 16)}: ${formatDateTime(
      details.created_at,
    )}`,
  );

  lines.push(
    `${padRight('Order Status', 16)}: ${safeText(
      details.order_status,
    ).toUpperCase()}`,
  );

  if (details.order_type === 'SCHEDULED') {
    lines.push(
      `${padRight('Scheduled For', 16)}: ${formatDateTime(
        details.scheduled_time,
      )}`,
    );
  }

  lines.push('');

  /* ==========================================================
     ORDER ITEMS
  ========================================================== */

  lines.push('ORDER ITEMS');
  lines.push(dashSeparator());

  if (details.items.length === 0) {
    lines.push('No items available');
  } else {
    details.items.forEach((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price_at_time);
      const itemTotal = quantity * price;

      const itemName = `${quantity} × ${item.name}`;

      lines.push(
        `${padRight(itemName, 27)}${padLeft(
          formatAmount(itemTotal),
          13,
        )}`,
      );

      lines.push(
        `  ${formatAmount(price)} each`,
      );
    });
  }

  lines.push(dashSeparator());

  /* ==========================================================
     BILL SUMMARY
  ========================================================== */

  lines.push(
    `${padRight('Items Total', 27)}${padLeft(
      formatAmount(details.bill.subtotal),
      13,
    )}`,
  );

  lines.push(
    `${padRight('Platform Fee', 27)}${padLeft(
      formatAmount(details.bill.platform_fee),
      13,
    )}`,
  );

  lines.push(
    `${padRight('GST', 27)}${padLeft(
      formatAmount(details.bill.gst),
      13,
    )}`,
  );


  lines.push(dashSeparator());

  lines.push(
    `${padRight('TOTAL', 27)}${padLeft(
      formatAmount(details.bill.total),
      13,
    )}`,
  );

  lines.push('');

  /* ==========================================================
     PAYMENT DETAILS
  ========================================================== */

  lines.push('PAYMENT DETAILS');
  lines.push(dashSeparator());

  lines.push(
    `${padRight('Payment Mode', 16)}: UPI`,
  );

  lines.push(
    `${padRight('Payment Status', 16)}: ${safeText(
      details.payment_status,
    ).toUpperCase()}`,
  );

  if (details.payment.paid_at) {
    lines.push(
      `${padRight('Payment Date', 16)}: ${formatDate(
        details.payment.paid_at,
      )}`,
    );

    lines.push(
      `${padRight('Payment Time', 16)}: ${formatTime(
        details.payment.paid_at,
      )}`,
    );
  }

  if (details.payment.transaction_id) {
    lines.push(
      `${padRight('Transaction ID', 16)}: ${
        details.payment.transaction_id
      }`,
    );
  }

  lines.push('');

  /* ==========================================================
     FSSAI
  ========================================================== */

  if (details.fssai_license_number) {
    lines.push(dashSeparator());

    lines.push(
      `${padRight('FSSAI License', 16)}: ${
        details.fssai_license_number
      }`,
    );

    lines.push('');
  }

  /* ==========================================================
     FOOTER
  ========================================================== */

  lines.push(separator());
  lines.push(
    centerText('Thank you for ordering with OFFO.'),
  );
  lines.push(
    centerText('Order Food From Office.'),
  );
  lines.push(separator());

  /* ==========================================================
     DOWNLOAD TXT FILE
  ========================================================== */

  const receiptText = lines.join('\n');

  const blob = new Blob(
    [receiptText],
    {
      type: 'text/plain;charset=utf-8',
    },
  );

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `OFFO-Receipt-${details.order_id}.txt`;

  document.body.appendChild(anchor);

  anchor.click();

  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
};

export default generateReceipt;
