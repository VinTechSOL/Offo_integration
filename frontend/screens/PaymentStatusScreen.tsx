import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getPaymentStatusApi } from "../api/payment";

const PaymentStatusScreen = () => {

  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);
  const [params] = useSearchParams();

  useEffect(() => {
    const orderId = params.get('order_id');

    if (!orderId) {
      navigate('/payment-failed');
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout>;

    const checkPayment = async () => {
      try {
        const response = await getPaymentStatusApi(Number(orderId));

        switch (response.intent_status) {
          case 'SUCCEEDED':
            if(interval) {
              clearInterval(interval);
            }
            clearTimeout(timeout);
            navigate('/success', { replace: true, state:{ orderId: orderId, paymentCompleted: true}, });
            return;

          case 'FAILED':
          case 'CANCELLED':
          case 'REFUND_FAILED':
            if(interval) {
              clearInterval(interval);
            }
            clearTimeout(timeout);

            navigate(`/payment-failed?order_id=${orderId}`, {
              replace: true,
            });

            return;

          case 'REFUNDED':
            if(interval) {
              clearInterval(interval);
            }
            clearTimeout(timeout);
            navigate('/orders', { replace: true });
            return;

          default:
            console.log(`Payment still processing (${response.intent_status})`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Wait a few seconds after PhonePe redirects back
    const initialDelay = setTimeout(() => {
      checkPayment();

      // Poll every 5 seconds
      interval = setInterval(checkPayment, 3000);
    }, 2000);

    // Stop polling after 2 minutes
    timeout = setTimeout(() => {
      if(interval) {
        clearInterval(interval);
      }
      clearTimeout(initialDelay);
      setTimedOut(true);
    }, 120000);

    return () => {
      if(interval) {
        clearInterval(interval);
      }
      clearTimeout(initialDelay);
      clearTimeout(timeout);
    };
  }, [navigate, params]);

  return (
    <div className="flex flex-col h-screen justify-center items-center px-6">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />

      <h2 className="text-2xl font-bold mt-6">Verifying Payment</h2>

      <p className="text-gray-500 mt-2 text-center">
        We're confirming your payment with PhonePe.
        This usually takes a few seconds. 
      </p>

      {timedOut && (
        <>
          <p className="mt-6 text-orange-600 text-center">
            Payment verification is taking longer than expected.
            If you have already completed the payment, tap "Refresh Status".
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-xl"
          >
            Refresh Status
          </button>
        </>
      )}
    </div>
  );

};

export default PaymentStatusScreen;