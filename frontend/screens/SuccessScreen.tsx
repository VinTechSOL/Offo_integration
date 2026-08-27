import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { OrderDetails } from '../types';
import CheckIcon from '../components/icons/CheckIcon';
import { getOrderApi } from '../api/order';
import generateInvoice from '../utils/generateInvoice';

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

  const orderId = location.state?.orderId;

  const [isDownloadingInvoice, setIsDownloadingInvoice] =
    useState(false);

  /* ============================================================
     PREVENT BACK NAVIGATION
  ============================================================ */

  useEffect(() => {
    // Prevent browser/Android back from returning to
    // payment status / PhonePe / payment / cart.
    window.history.pushState(
      null,
      '',
      window.location.href,
    );

    const handlePopState = () => {
      navigate('/home', {
        replace: true,
      });
    };

    window.addEventListener(
      'popstate',
      handlePopState,
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
    };
  }, [navigate]);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const goTo = (path: string) => {
    clearCart();

    if (path === '/orders') {
      navigate('/orders', {
        replace: true,
        state: {
          paymentCompleted: true,
          orderId,
        },
      });

      return;
    }

    navigate('/home', {
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
        'Order ID is not available. Please open the order details and try again.',
      );
      return;
    }

    try {
      setIsDownloadingInvoice(true);

      /*
       * IMPORTANT:
       *
       * Do NOT generate the invoice from orderDetails here.
       *
       * The backend order detail contains the authoritative:
       *
       * - Order ID
       * - Cafe
       * - FSSAI number
       * - Items
       * - Platform Fee
       * - GST
       * - Total
       * - Payment method
       * - Payment date/time
       * - Transaction ID
       */

      const order = await getOrderApi(orderId);

      if (!order) {
        throw new Error(
          'Order details were not found.',
        );
      }

      /*
       * Generate the PDF.
       *
       * The generateInvoice utility handles:
       *
       * - OFFO branding
       * - Orange styling
       * - Order information
       * - FSSAI
       * - Items
       * - Platform Fee
       * - GST
       * - Total Paid
       * - Payment Method = UPI
       * - Payment Date & Time
       * - Transaction ID
       * - Scheduled-order fee note
       */

      generateInvoice(order);

    } catch (error) {
      console.error(
        'Failed to generate invoice:',
        error,
      );

      alert(
        'Unable to generate invoice. Please try again.',
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

      {/* SUCCESS ICON */}

      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/30">
        <CheckIcon className="w-16 h-16 text-white" />
      </div>

      {/* TITLE */}

      <h1 className="text-2xl font-bold mb-2">
        Success!
      </h1>

      <p className="text-gray-300 mb-8">
        Your order has been placed successfully.
      </p>

      {/* ACTION LINKS */}

      <p className="text-sm text-gray-400 mb-4">

        <button
          onClick={() => goTo('/orders')}
          className="underline hover:text-white transition-colors"
        >
          View Order Details
        </button>

        {' / '}

        <button
          onClick={handleDownloadInvoice}
          disabled={isDownloadingInvoice}
          className="underline hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDownloadingInvoice
            ? 'Generating Invoice...'
            : 'Download Invoice'}
        </button>

      </p>

      {/* MAIN BUTTONS */}

      <div className="w-full max-w-xs grid grid-cols-2 gap-4">

        <button
          onClick={() => goTo('/home')}
          className="bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Menu
        </button>

        <button
          onClick={() => goTo('/orders')}
          className="bg-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
        >
          My Orders
        </button>

      </div>

    </div>
  );
};

export default SuccessScreen;