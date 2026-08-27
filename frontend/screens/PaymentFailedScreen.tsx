import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { retryPaymentApi } from "../api/payment";

const PaymentFailedScreen = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [loading, setLoading] = useState(false);

  const orderId = params.get("order_id");
  const parsedOrderId = orderId ? Number(orderId) : NaN;

  const invalidOrder =
    !orderId ||
    Number.isNaN(parsedOrderId);

  const handleRetry = async () => {
    if (invalidOrder) {
      alert("Invalid order.");
      navigate("/orders", { replace: true });
      return;
    }

    try {
      setLoading(true);

      const response = await retryPaymentApi(
        parsedOrderId,
      );

      if (!response.checkout_url) {
        throw new Error(
          "Checkout URL not received.",
        );
      }

      sessionStorage.setItem(
        "pendingOrderId",
        String(parsedOrderId),
      );

      window.location.assign(
        response.checkout_url,
      );
    } catch (error: any) {
      console.error(
        "Payment retry failed:",
        error,
      );

      const message =
        error?.response?.data?.detail ??
        "Unable to retry payment. Please try again.";

      alert(message);

      setLoading(false);
    }
  };

  if (invalidOrder) {
    return (
      <div className="flex flex-col h-screen justify-center items-center px-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Invalid Order
        </h1>

        <p className="text-gray-500 text-center mt-3">
          We couldn't identify the order for this payment.
        </p>

        <button
          onClick={() =>
            navigate("/orders", {
              replace: true,
            })
          }
          className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl"
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen justify-center items-center px-6 bg-white">
      {/* Failed Icon */}
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <span className="text-5xl text-red-500">
          ✕
        </span>
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

      {/* Retry */}
      <button
        onClick={handleRetry}
        disabled={loading}
        className={`mt-10 w-full max-w-sm rounded-xl py-4 font-semibold text-white transition ${
          loading
            ? "bg-orange-300 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {loading
          ? "Redirecting..."
          : "Try Again"}
      </button>

      {/* Orders */}
      <button
        onClick={() => navigate("/orders")}
        disabled={loading}
        className="mt-4 w-full max-w-sm rounded-xl border border-gray-300 py-4 font-semibold text-gray-700"
      >
        Go to My Orders
      </button>

      {/* Home */}
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