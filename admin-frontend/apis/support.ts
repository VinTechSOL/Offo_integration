import api from "./client";

export type TicketStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

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
}

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


// =====================================================
// TICKETS
// =====================================================

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


// =====================================================
// FEEDBACK
// =====================================================

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