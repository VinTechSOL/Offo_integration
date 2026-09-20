
import api from "./client";


// =====================================================
// TYPES
// =====================================================

export type TicketStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

export type TicketSenderType =
  | "USER"
  | "ADMIN";


export interface CreateTicketPayload {
  order_id: string;

  order_item_id?: number;

  issue_type:
    | "missing_item"
    | "food_quality"
    | "pickup_issue"
    | "payment_billing"
    | "other";

  description: string;

  image?: File | null;
}


export interface TicketMessage {
  message_id: number;

  ticket_id: number;

  sender_type: TicketSenderType;

  sender_id: number;

  message: string;

  created_at: string;
}


export interface TicketResponse {
  ticket_id: number;

  order_id: number;

  order_item_id: number | null;

  issue_type: string;

  description: string;

  image_url: string | null;

  status: TicketStatus;

  created_at: string;

  updated_at: string;

  messages?: TicketMessage[];
}


export interface CreateFeedbackPayload {
  order_id: string;

  food_rating?: number;

  app_rating: number;

  comments?: string;
}


export interface FeedbackResponse {
  feedback_id: number;

  order_id: number;

  food_rating?: number;

  app_rating: number;

  comments: string | null;

  created_at: string;
}


// =====================================================
// TICKETS
// =====================================================

export const createTicketApi = async (
  payload: CreateTicketPayload
) => {
  const formData = new FormData();

  formData.append(
    "order_id",
    payload.order_id
  );

  if (
    payload.order_item_id !== undefined
  ) {
    formData.append(
      "order_item_id",
      String(payload.order_item_id)
    );
  }

  formData.append(
    "issue_type",
    payload.issue_type
  );

  formData.append(
    "description",
    payload.description
  );

  if (payload.image) {
    formData.append(
      "image",
      payload.image
    );
  }

  const res = await api.post(
    "/support/tickets",
    formData
  );

  return res.data as TicketResponse;
};


// =====================================================
// USER TICKET LIST
// =====================================================

export const getMyTicketsApi = async () => {
  const res = await api.get(
    "/support/tickets"
  );

  return res.data as TicketResponse[];
};


// =====================================================
// USER TICKET DETAIL
// =====================================================

export const getMyTicketApi = async (
  ticketId: number
) => {
  const res = await api.get(
    `/support/tickets/${ticketId}`
  );

  return res.data as TicketResponse;
};


// =====================================================
// USER TICKET MESSAGE
// =====================================================

export const sendTicketMessageApi = async (
  ticketId: number,
  message: string
) => {
  const res = await api.post(
    `/support/tickets/${ticketId}/messages`,
    {
      message,
    }
  );

  return res.data as TicketMessage;
};


// =====================================================
// FEEDBACK
// =====================================================

export const createFeedbackApi = async (
  payload: CreateFeedbackPayload
) => {
  const res = await api.post(
    "/support/feedback",
    payload
  );

  return res.data as FeedbackResponse;
};


export const getMyFeedbackApi = async () => {
  const res = await api.get(
    "/support/feedback"
  );

  return res.data as FeedbackResponse[];
};
