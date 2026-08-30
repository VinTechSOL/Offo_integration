// apis/support.ts

import api from "./client";

/* =========================================================
   TYPES
========================================================= */

export type SeverityLevel =
  | "CRITICAL"
  | "HIGH"
  | "NORMAL";

export type TicketStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

/* =========================================================
   VENDOR TICKET
========================================================= */

export interface VendorTicket {
  vendor_ticket_id: number;
  display_ticket_id: string;

  vendor_staff_id: number;

  category: string;
  severity: SeverityLevel;

  affected_order_ids: string | null;

  subject: string;
  description: string;

  image_url: string | null;

  status: TicketStatus;

  created_at: string;
  updated_at: string;
}

/* =========================================================
   VENDOR TICKET MESSAGE
========================================================= */

export interface VendorTicketMessage {
  message_id: number;
  vendor_ticket_id: number;

  sender_type: "VENDOR" | "ADMIN";
  sender_id: number;

  message: string;

  created_at: string;
}

/* =========================================================
   VENDOR TICKET DETAIL
========================================================= */

export interface VendorTicketDetail
  extends VendorTicket {
  messages: VendorTicketMessage[];
}

/* =========================================================
   VENDOR FEEDBACK
========================================================= */

export interface VendorFeedback {
  feedback_id: number;
  display_feedback_id: string;

  order_id: number;
  display_order_id: string;

  user_id: number;
  customer_name: string;

  food_rating: number;

  comments: string | null;

  created_at: string;
}

/* =========================================================
   CREATE VENDOR TICKET INPUT
========================================================= */

export interface CreateVendorTicketData {
  category: string;
  severity: SeverityLevel;

  affected_order_ids?: string;

  subject: string;
  description: string;

  image?: File | null;
}

/* =========================================================
   API FUNCTIONS
========================================================= */

/**
 * Get all tickets created by the logged-in vendor.
 */
export const getVendorTickets = async (): Promise<
  VendorTicket[]
> => {
  const response = await api.get<VendorTicket[]>(
    "/support/vendor/tickets"
  );

  return response.data;
};

/**
 * Get one vendor ticket including conversation messages.
 */
export const getVendorTicket = async (
  vendorTicketId: number
): Promise<VendorTicketDetail> => {
  const response =
    await api.get<VendorTicketDetail>(
      `/support/vendor/tickets/${vendorTicketId}`
    );

  return response.data;
};

/**
 * Create vendor support ticket.
 *
 * The backend accepts multipart/form-data because
 * a vendor can upload ONE optional image while
 * raising the ticket.
 */
export const createVendorTicket = async (
  data: CreateVendorTicketData
): Promise<VendorTicket> => {
  const formData = new FormData();

  formData.append(
    "category",
    data.category
  );

  formData.append(
    "severity",
    data.severity
  );

  if (data.affected_order_ids?.trim()) {
    formData.append(
      "affected_order_ids",
      data.affected_order_ids.trim()
    );
  }

  formData.append(
    "subject",
    data.subject.trim()
  );

  formData.append(
    "description",
    data.description.trim()
  );

  if (data.image) {
    formData.append(
      "image",
      data.image
    );
  }

  const response =
    await api.post<VendorTicket>(
      "/support/vendor/tickets",
      formData
    );

  return response.data;
};

/**
 * Send a vendor reply.
 *
 * IMPORTANT:
 * Backend currently accepts JSON only.
 * No image attachment is sent here.
 */
export const createVendorTicketMessage =
  async (
    vendorTicketId: number,
    message: string
  ): Promise<VendorTicketMessage> => {
    const response =
      await api.post<VendorTicketMessage>(
        `/support/vendor/tickets/${vendorTicketId}/messages`,
        {
          message: message.trim(),
        }
      );

    return response.data;
  };

/**
 * Get feedback for the vendor's branch.
 */
export const getVendorFeedback =
  async (): Promise<VendorFeedback[]> => {
    const response =
      await api.get<VendorFeedback[]>(
        "/support/vendor/feedback"
      );

    return response.data;
  };