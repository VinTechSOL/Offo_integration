import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { retryPaymentApi } from "../api/payment";

const PaymentFailedScreen = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const orderId = params.get("order_id");
  const parsedOrderId = Number(orderId);

  if (!orderId || Number.isNaN(parsedOrderId)) {
    alert('Invalid order.');
    navigate('/orders');
    return;
  }
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    if (!orderId) {
      alert("Order not found.");
      return;
    }

    try {
      setLoading(true);

      const response = await retryPaymentApi(Number(orderId));

      if (!response.checkout_url) {
        throw new Error('Checkout URL not received.');
      }

      sessionStorage.setItem(
        "pendingOrderId",
        String(parsedOrderId),
      );
      
      window.location.assign(response.checkout_url);
    } catch (error: any) {
      console.error(error);

      const message = error?.response?.data?.detail ?? 'Unable to retry payment. Please try again';

      alert(message);

      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center px-6 bg-white">
      {/* Failed Icon */}
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <span className="text-5xl text-red-500">✕</span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800">
        Payment Failed
      </h1>

      {/* Description */}
      <p className="text-gray-500 text-center mt-3 max-w-sm">
        Your payment could not be completed.
        No amount has been deducted.
        Please try again.
      </p>

      {/* Retry Button */}
      <button
        onClick={handleRetry}
        disabled={loading}
        className={`mt-10 w-full max-w-sm rounded-xl py-4 font-semibold text-white transition ${
          loading
            ? "bg-orange-300 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {loading ? "Redirecting..." : "Try Again"}
      </button>

      {/* Orders Button */}
      <button
        onClick={() => navigate("/orders")}
        disabled={loading}
        className="mt-4 w-full max-w-sm rounded-xl border border-gray-300 py-4 font-semibold text-gray-700"
      >
        Go to My Orders
      </button>

      {/* Home Button */}
      <button
        onClick={() => navigate("/home")}
        disabled={loading}
        className="mt-3 text-sm text-gray-500 underline"
      >
        Back to Home
      </button>
    </div>
  );
};

export default PaymentFailedScreen;