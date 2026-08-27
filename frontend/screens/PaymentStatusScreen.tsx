import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getPaymentStatusApi } from "../api/payment";

const PaymentStatusScreen = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const orderId = params.get("order_id");

    if (!orderId) {
      navigate("/payment-failed", { replace: true });
      return;
    }

    const parsedOrderId = Number(orderId);

    if (Number.isNaN(parsedOrderId)) {
      navigate("/payment-failed", { replace: true });
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let initialDelay: ReturnType<typeof setTimeout> | undefined;

    let stopped = false;

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }

      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }

      if (initialDelay) {
        clearTimeout(initialDelay);
        initialDelay = undefined;
      }
    };

    const checkPayment = async () => {
      if (stopped) {
        return;
      }

      try {
        const response = await getPaymentStatusApi(parsedOrderId);

        if (stopped) {
          return;
        }

        switch (response.intent_status) {
          case "SUCCEEDED":
            stopPolling();

            navigate("/success", {
              replace: true,
              state: {
                orderId: String(parsedOrderId),
                paymentCompleted: true,
              },
            });

            return;

          case "FAILED":
          case "CANCELLED":
            stopPolling();

            navigate(
              `/payment-failed?order_id=${parsedOrderId}`,
              {
                replace: true,
              },
            );

            return;

          case "REFUNDED":
            stopPolling();

            navigate("/orders", {
              replace: true,
            });

            return;

          case "PROCESSING":
          case "CREATED":
          default:
            console.log(
              `Payment still processing: ${response.intent_status}`,
            );
        }
      } catch (error) {
        // A temporary status request failure should NOT
        // immediately mark the payment as failed.
        console.error(
          "Payment status check failed:",
          error,
        );
      }
    };

    // Give PhonePe a moment to finish redirecting.
    initialDelay = setTimeout(() => {
      checkPayment();

      interval = setInterval(() => {
        checkPayment();
      }, 3000);
    }, 2000);

    // Stop polling after 2 minutes.
    timeout = setTimeout(() => {
      stopped = true;

      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }

      if (initialDelay) {
        clearTimeout(initialDelay);
        initialDelay = undefined;
      }

      setTimedOut(true);
    }, 120000);

    return () => {
      stopped = true;
      stopPolling();
    };
  }, [navigate, params]);

  return (
    <div className="flex flex-col h-screen justify-center items-center px-6">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />

      <h2 className="text-2xl font-bold mt-6">
        Verifying Payment
      </h2>

      <p className="text-gray-500 mt-2 text-center">
        We're confirming your payment with PhonePe.
        This usually takes a few seconds.
      </p>

      {timedOut && (
        <>
          <p className="mt-6 text-orange-600 text-center">
            Payment verification is taking longer than expected.
            If you have already completed the payment, tap
            "Refresh Status".
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-xl"
          >
            Refresh Status
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="mt-3 text-sm text-gray-500 underline"
          >
            Go to My Orders
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentStatusScreen;