import api from "./client";

export interface PaymentIntent {
  intent_id: number;
  order_id: number;
  amount: number;
  status: string;
  created_at: string;
}

export interface PaymentInitiateResponse {
  intent: PaymentIntent;
  checkout_url: string | null;
}

export interface PaymentStatusResponse {
  order_id: number;
  payment_status: string;
  intent_status: string;
  attempt_status: string | null;
  redirect_url: string | null;
  transaction_id: string | null;
}

export const initiatePaymentApi = async (
  orderIds: number[],
): Promise<PaymentInitiateResponse> => {

  const { data } = await api.post("/payments/initiate", {
    order_ids: orderIds,
    gateway: "PHONEPE",
  });

  return data;
};

export const getPaymentStatusApi = async (
  orderId: number,
): Promise<PaymentStatusResponse> => {

  const { data } = await api.get(
    `/payments/status/${orderId}`,
  );

  return data;
};


export const retryPaymentApi = async (
  orderId: number,
): Promise<PaymentInitiateResponse> => {

  const { data } = await api.post(
    `/payments/retry/${orderId}`,
  );

  return data;
};