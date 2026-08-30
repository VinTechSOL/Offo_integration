import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import type { OrderDetails } from "../types";
import CheckIcon from "../components/icons/CheckIcon";
import { getOrderApi } from "../api/order";
import generateInvoice from "../utils/generateInvoice";

interface SuccessScreenProps {
  clearCart: () => void;
  orderDetails: OrderDetails | null;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  clearCart,
  orderDetails,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const orderId =
    location.state?.orderId ??
    searchParams.get("order_id");

  const [isDownloadingInvoice, setIsDownloadingInvoice] =
    useState(false);

  /* ============================================================
     PAYMENT SUCCESS HISTORY BARRIER
  ============================================================ */

  useEffect(() => {
    /*
     * This effect runs only when SuccessScreen is entered.
     *
     * We create a fresh history entry for the success page.
     * The previous entry is replaced so the payment/status route
     * is not something the user can navigate back through.
     */

    if (location.state?.from !== "payment") {
      return;
    }

    window.history.replaceState(
      {
        from: "success",
        orderId,
      },
      "",
      window.location.href,
    );

    /*
     * Add one controlled history entry.
     *
     * When Android Back is pressed, the popstate event fires
     * and we immediately move to My Orders.
     */
    window.history.pushState(
      {
        from: "success",
        orderId,
      },
      "",
      window.location.href,
    );

    const handlePopState = () => {
      navigate(
        `/orders?from=success${orderId ? `&order_id=${orderId}` : ""}`,
        {
          replace: true,
          state: {
            from: "success",
            paymentCompleted: true,
            orderId,
          },
        },
      );
    };

    window.addEventListener(
      "popstate",
      handlePopState,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState,
      );
    };
  }, [location.state, navigate, orderId]);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const goTo = (path: string) => {
    clearCart();

    if (path === "/orders") {
      navigate(
        `/orders?from=success${orderId ? `&order_id=${orderId}` : ""}`,
        {
          replace: true,
          state: {
            from: "success",
            paymentCompleted: true,
            orderId,
          },
        },
      );

      return;
    }

    navigate("/home", {
      replace: true,
    });
  };

  /* ============================================================
     DOWNLOAD INVOICE
  ============================================================ */

  const handleDownloadInvoice = async () => {
    if (isDownloadingInvoice) {
      return;
    }

    if (!orderId) {
      alert(
        "Order ID is not available. Please open the order details and try again.",
      );
      return;
    }

    try {
      setIsDownloadingInvoice(true);

      const order = await getOrderApi(orderId);

      if (!order) {
        throw new Error(
          "Order details were not found.",
        );
      }

      generateInvoice(order);
    } catch (error) {
      console.error(
        "Failed to generate invoice:",
        error,
      );

      alert(
        "Unable to generate invoice. Please try again.",
      );
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white items-center justify-center p-8 text-center">

      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/30">
        <CheckIcon className="w-16 h-16 text-white" />
      </div>

      <h1 className="text-2xl font-bold mb-2">
        Success!
      </h1>

      <p className="text-gray-300 mb-8">
        Your order has been placed successfully.
      </p>

      <p className="text-sm text-gray-400 mb-4">
        <button
          onClick={() => goTo("/orders")}
          className="underline hover:text-white transition-colors"
        >
          View Order Details
        </button>

        {" / "}

        <button
          onClick={handleDownloadInvoice}
          disabled={isDownloadingInvoice}
          className="underline hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDownloadingInvoice
            ? "Generating Invoice..."
            : "Download Invoice"}
        </button>
      </p>

      <div className="w-full max-w-xs grid grid-cols-2 gap-4">
        <button
          onClick={() => goTo("/home")}
          className="bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Menu
        </button>

        <button
          onClick={() => goTo("/orders")}
          className="bg-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
        >
          My Orders
        </button>
      </div>

    </div>
  );
};

export default SuccessScreen;