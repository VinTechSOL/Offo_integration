import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { OrderDetails } from "../types";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import ScrollableContainer from "../components/ScrollableContainer";
import { placeOrderApi } from "../api/order";
import { initiatePaymentApi } from "@/api/payment";



const phonePeMethod = {
  name: "PhonePe",
  icon: "/assets/icons/phonepe.jpeg",
};

interface PaymentScreenProps {
  orderDetails: OrderDetails;
  setOrderDetails: (details: OrderDetails | null) => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  orderDetails,
  setOrderDetails,
}) => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ============================
  // PLACE ORDER HANDLER
  // ============================
  const handlePlaceOrder = async () => {
    if(loading){
      return;
    }

    setLoading(true);

    try {
      let payload: any = {
        order_type: 'INSTANT',
      };

      if (orderDetails.schedules && orderDetails.schedules.length > 0) {
        payload = {
          order_type: 'SCHEDULED',
          schedules: orderDetails.schedules.map((s) => ({
            scheduled_date: s.date.toLocaleDateString('en-CA'),
            scheduled_time: s.time,
          })),
          repeat_weekly: false,
        };
      }

      const orderResponse = await placeOrderApi(payload);

      const orderId = orderResponse.order_id ?? orderResponse.order_ids?.[0];

      if (!orderId) {
        throw new Error('Order ID missing');
      }



      const payment = await initiatePaymentApi(orderId);


      if (!payment.checkout_url) {
        throw new Error('Checkout URL missing');
      }

      sessionStorage.setItem('pendingOrderId', String(orderId));

      window.location.assign(payment.checkout_url);
    } catch (err: any) {
      console.error(err);

      const message = err?.response?.data?.detail ?? 'Unable to start payment.';

      alert(message);

      setLoading(false);
    }
  };

  const amountToPay = orderDetails.total;


  // ============================
  // PAYMENT SELECTION UI
  // ============================
  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      <header className="p-4 flex items-center border-b">
        <button
          onClick={() =>
            navigate(orderDetails.schedules ? '/schedule' : '/cart')
          }
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 mx-auto">
          Payment Method
        </h1>
      </header>

      <ScrollableContainer className="p-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6">
          <h2 className="font-bold text-lg mb-3">Bill Details</h2>

          {orderDetails.items.map(({ item, quantity }) => (
            <div key={item.id} className="flex justify-between text-sm mb-1">
              <span>
                {quantity} × {item.name}
              </span>

              <span>₹ {(item.price * quantity).toFixed(2)}</span>
            </div>
          ))}

          <hr className="my-3" />

          <div className="flex justify-between text-sm">
            <span>Items Total</span>
            <span>₹ {orderDetails.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Packaging Fee</span>
            <span>₹ 0.00</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>₹ 0.00</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Platform Fee</span>
            <span>₹ {orderDetails.convenienceFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>GST (Govt. Tax)</span>
            <span>₹ {(orderDetails.gst ?? 0).toFixed(2)}</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between font-bold text-base">
            <span>To Pay</span>
            <span>₹ {orderDetails.total.toFixed(2)}</span>
          </div>
        </div>

        <h2 className="font-bold text-lg mb-3">Pay via UPI</h2>

        <div className="bg-orange-50 border border-orange-500 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={phonePeMethod.icon} className="h-8 mr-4" />
            <span className="font-semibold">PhonePe</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-orange-500" />
        </div>
      </ScrollableContainer>

      <footer className="p-4 border-t bg-white">
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className={`w-full font-bold py-4 rounded-xl text-white transition ${
            loading
              ? 'bg-orange-300 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {loading
            ? 'Redirecting to PhonePe...'
            : `Place Order – ₹${amountToPay.toFixed(2)}`}
        </button>
      </footer>
    </div>
  );
};

export default PaymentScreen;
