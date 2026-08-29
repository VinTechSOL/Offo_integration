import api from "./client";

export type TicketStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

/* =====================================================
   USER TICKET MESSAGE
===================================================== */

export interface TicketMessage {
  message_id: number;
  ticket_id: number;

  sender_type: "USER" | "ADMIN";
  sender_id: number;

  message: string;

  created_at: string;
}

/* =====================================================
   ADMIN USER TICKET
===================================================== */

export interface AdminTicket {
  ticket_id: number;
  display_ticket_id: string;

  order_id: number;
  display_order_id: string;

  user_id: number;
  customer_name: string;

  cafe_id: number;
  cafe_name: string;

  branch_id: number;

  issue_type: string;
  description: string;

  order_item_id: number | null;
  item_name: string | null;

  image_url: string | null;

  status: TicketStatus;

  created_at: string;
  updated_at: string;

  messages: TicketMessage[];
}

/* =====================================================
   ADMIN FEEDBACK
===================================================== */

export interface AdminFeedback {
  feedback_id: number;
  display_feedback_id: string;

  order_id: number;
  display_order_id: string;

  user_id: number;
  customer_name: string;

  cafe_id: number;
  cafe_name: string;

  branch_id: number;

  food_rating: number;
  app_rating: number;

  comments: string | null;

  created_at: string;
}

/* =====================================================
   ADMIN VENDOR TICKET MESSAGE
===================================================== */

export interface AdminVendorTicketMessage {
  message_id: number;
  vendor_ticket_id: number;

  sender_type: "VENDOR" | "ADMIN";
  sender_id: number;

  message: string;

  created_at: string;
}

/* =====================================================
   ADMIN VENDOR TICKET
===================================================== */

export interface AdminVendorTicket {
  vendor_ticket_id: number;
  display_ticket_id: string;

  vendor_staff_id: number;

  vendor_name: string;
  vendor_username: string;

  cafe_id: number | null;
  cafe_name: string | null;

  branch_id: number | null;
  branch_name: string | null;

  category: string;
  severity: string;

  affected_order_ids: string | null;

  subject: string;
  description: string;

  image_url: string | null;

  status: TicketStatus;

  created_at: string;
  updated_at: string;

  messages: AdminVendorTicketMessage[];
}

/* =====================================================
   USER TICKETS
===================================================== */

export const getAdminTicketsApi = async () => {
  const res = await api.get(
    "/support/admin/tickets"
  );

  return res.data as AdminTicket[];
};

export const getAdminTicketApi = async (
  ticketId: number
) => {
  const res = await api.get(
    `/support/admin/tickets/${ticketId}`
  );

  return res.data as AdminTicket;
};

export const updateTicketStatusApi = async (
  ticketId: number,
  status: TicketStatus
) => {
  const res = await api.patch(
    `/support/admin/tickets/${ticketId}/status`,
    {
      status,
    }
  );

  return res.data;
};

export const sendAdminTicketMessageApi = async (
  ticketId: number,
  message: string
) => {
  const res = await api.post(
    `/support/admin/tickets/${ticketId}/messages`,
    {
      message,
    }
  );

  return res.data as TicketMessage;
};

/* =====================================================
   FEEDBACK
===================================================== */

export const getAdminFeedbackApi = async () => {
  const res = await api.get(
    "/support/admin/feedback"
  );

  return res.data as AdminFeedback[];
};

export const getAdminFeedbackDetailApi = async (
  feedbackId: number
) => {
  const res = await api.get(
    `/support/admin/feedback/${feedbackId}`
  );

  return res.data as AdminFeedback;
};

/* =====================================================
   ADMIN - VENDOR TICKETS
===================================================== */

export const getAdminVendorTicketsApi =
  async () => {
    const res = await api.get(
      "/support/admin/vendor-tickets"
    );

    return res.data as AdminVendorTicket[];
  };

/* =====================================================
   ADMIN - SINGLE VENDOR TICKET
===================================================== */

export const getAdminVendorTicketApi =
  async (
    vendorTicketId: number
  ) => {
    const res = await api.get(
      `/support/admin/vendor-tickets/${vendorTicketId}`
    );

    return res.data as AdminVendorTicket;
  };

/* =====================================================
   ADMIN - VENDOR TICKET STATUS
===================================================== */

export const updateVendorTicketStatusApi =
  async (
    vendorTicketId: number,
    status: TicketStatus
  ) => {
    const res = await api.patch(
      `/support/admin/vendor-tickets/${vendorTicketId}/status`,
      {
        status,
      }
    );

    return res.data as AdminVendorTicket;
  };

/* =====================================================
   ADMIN - REPLY TO VENDOR
===================================================== */

export const sendAdminVendorTicketMessageApi =
  async (
    vendorTicketId: number,
    message: string
  ) => {
    const res = await api.post(
      `/support/admin/vendor-tickets/${vendorTicketId}/messages`,
      {
        message,
      }
    );

    return res.data as AdminVendorTicketMessage;
  };