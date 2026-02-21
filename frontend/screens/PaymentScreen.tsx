import React, { useState, useEffect } from "react";
import type { Screen } from "../types/navigation";
import type { OrderDetails } from "../types";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import CheckIcon from "../components/icons/CheckIcon";
import ScrollableContainer from "../components/ScrollableContainer";
import { placeOrderApi } from "../api/order";

const phonePeMethod = {
  name: "PhonePe",
  icon: "/assets/icons/phonepe.jpeg",
};

interface PaymentScreenProps {
  orderDetails: OrderDetails;
  setOrderDetails: (details: OrderDetails | null) => void;
  navigateTo: (screen: Screen) => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  orderDetails,
  setOrderDetails,
  navigateTo,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");

  // ============================
  // PAYMENT ANIMATION CONTROLLER
  // ============================
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (paymentStatus === "processing") {
      timer = setTimeout(() => {
        setPaymentStatus("success");
      }, 2000);
    }

    if (paymentStatus === "success") {
      timer = setTimeout(() => {
        navigateTo("success"); // or "orders" later
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [paymentStatus, navigateTo]);

  // ============================
  // PLACE ORDER HANDLER
  // ============================
  const handlePlaceOrder = async () => {
    try {
      // 🔹 Start animation immediately
      setPaymentStatus("processing");

      // 🔹 Prepare payload
      let payload: any = {
        order_type: "INSTANT",
      };


      // If schedules exist → Scheduled Order
      if (orderDetails.schedules && orderDetails.schedules.length > 0) {
        payload = {
          order_type: "SCHEDULED",
          schedules: orderDetails.schedules.map((s) => ({
            scheduled_date: s.date.toLocaleDateString("en-CA"),
            scheduled_time: s.time,
          })),
          repeat_weekly: false, // repeat already expanded in ScheduleScreen
        };
      }

      console.log("placing order payload:",payload)

      // 🔥 Backend call
      await placeOrderApi(payload);

      // ✅ Do nothing else
      // animation continues via useEffect
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
      setPaymentStatus("idle");
    }
  };

  const amountToPay = orderDetails.total;

  // ============================
  // PROCESSING / SUCCESS UI
  // ============================
  if (paymentStatus !== "idle") {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
        {paymentStatus === "processing" && (
          <>
            <img
              src={phonePeMethod.icon}
              alt={phonePeMethod.name}
              className="h-20 mb-6"
            />
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800">
              Processing Payment...
            </h2>
            <p className="text-gray-500">Redirecting to PhonePe</p>
          </>
        )}

        {paymentStatus === "success" && (
          <>
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/30">
              <CheckIcon className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Payment Successful!
            </h2>
            <p className="text-gray-500 mt-2">
              Preparing your order summary…
            </p>
          </>
        )}
      </div>
    );
  }

  // ============================
  // PAYMENT SELECTION UI
  // ============================
  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      <header className="p-4 flex items-center border-b">
        <button
          onClick={() =>
            navigateTo(orderDetails.schedules ? "schedule" : "cart")
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
          <h2 className="font-bold text-lg mb-3">Order Summary</h2>

          {orderDetails.items.map(({ item, quantity }) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {quantity}x {item.name}
              </span>
              <span>₹ {(item.price * quantity).toFixed(2)}</span>
            </div>
          ))}

          <hr className="my-2" />

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹ {orderDetails.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Convenience Fee</span>
            <span>₹ {orderDetails.convenienceFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
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
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl"
        >
          Place Order – ₹{amountToPay.toFixed(2)}
        </button>
      </footer>
    </div>
  );
};

export default PaymentScreen;
