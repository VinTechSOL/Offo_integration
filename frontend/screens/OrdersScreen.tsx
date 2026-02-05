import React, { useState } from "react";
import type { Screen } from "../types/navigation";
import BottomNav from "../components/BottomNav";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import type { Order } from "../types";
import ScrollableContainer from "../components/ScrollableContainer";
import OrderStatusTracker from "../components/OrderStatusTracker";
import { OrderTimeline } from "@/components/OrderTimeline";

interface OrdersScreenProps {
  navigateTo: (screen: Screen) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onEditSchedule: (order: Order) => void;
  onEditOrderItems: (order: Order) => void;
}

/* ============================
   STATUS PILL (UI ONLY)
============================ */
const OrderStatusPill: React.FC<{ status: Order["status"] }> = ({ status }) => {
  const base = "text-xs font-semibold px-2.5 py-1 rounded-full";

  switch (status) {
    case "Pending":
      return <span className={`${base} bg-gray-200 text-gray-800`}>Pending</span>;
    case "Accepted":
      return <span className={`${base} bg-orange-100 text-orange-800 animate-pulse`}>Accepted</span>;
    case "Preparing":
      return <span className={`${base} bg-yellow-100 text-yellow-800 animate-pulse`}>Preparing</span>;
    case "Ready for Pickup":
      return (
        <span className={`${base} bg-orange-100 text-orange-800 relative flex items-center`}>
          <span className="absolute -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          <span className="ml-3">Ready</span>
        </span>
      );
    case "Out for Delivery":
      return <span className={`${base} bg-indigo-100 text-indigo-800 animate-pulse`}>Out</span>;
    case "Delivered":
      return <span className={`${base} bg-gray-200 text-gray-800`}>Completed</span>;
    case "Cancelled":
    case "Rejected":
      return <span className={`${base} bg-gray-200 text-gray-800`}>{status}</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

/* ============================
   MAIN SCREEN
============================ */
const OrdersScreen: React.FC<OrdersScreenProps> = ({
  navigateTo,
  orders,
  setOrders,
  onEditSchedule,
  onEditOrderItems,
}) => {
  const [activeTab, setActiveTab] = useState<"scheduled" | "ongoing" | "past">("past");
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  /* ============================
     FILTERING (BACKEND DRIVEN)
  ============================ */
  const scheduledOrders = orders.filter(
    (o) => o.orderType === "SCHEDULED" && o.status === "Pending"
  );

  const ongoingOrders = orders.filter((o) =>
    ["Pending", "Accepted", "Preparing", "Ready for Pickup", "Out for Delivery"].includes(o.status)
  );

  const pastOrders = orders.filter((o) =>
    ["Delivered", "Cancelled", "Rejected"].includes(o.status)
  );

  const ordersToDisplay =
    activeTab === "scheduled"
      ? scheduledOrders
      : activeTab === "ongoing"
      ? ongoingOrders
      : pastOrders;

  /* ============================
     CANCEL (UI ONLY)
  ============================ */
  const confirmCancel = () => {
    if (!orderToCancel) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderToCancel ? { ...o, status: "Cancelled" } : o
      )
    );
    setOrderToCancel(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      {/* CANCEL MODAL */}
      {orderToCancel && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-4/5 text-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Cancel Order?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setOrderToCancel(null)}
                className="px-6 py-2 border rounded-lg font-semibold"
              >
                No
              </button>
              <button
                onClick={confirmCancel}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="p-4 flex items-center border-b">
        <button onClick={() => navigateTo("home")} className="w-1/5">
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="w-3/5 text-center text-xl font-bold text-gray-800">
          My Orders
        </h1>
        <div className="w-1/5" />
      </header>

      {/* TABS */}
      <div className="flex border-b">
        {["scheduled", "ongoing", "past"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`w-1/3 py-3 font-semibold ${
              activeTab === tab
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500"
            }`}
          >
            {tab === "scheduled"
              ? "Scheduled"
              : tab === "ongoing"
              ? "Ongoing"
              : "Past Orders"}
          </button>
        ))}
      </div>

      {/* LIST */}
      <ScrollableContainer className="p-4 space-y-4 pb-20">
        {ordersToDisplay.length === 0 ? (
          <div className="text-center pt-20 text-gray-500">
            No orders found.
          </div>
        ) : (
          ordersToDisplay.map((order) => {
            const isCancellable = order.backendStatus === "CREATED";

            return (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {order.cafe || "Cafe"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      #{order.id} · {order.date.toLocaleString("en-GB")}
                    </p>
                  </div>
                  <OrderStatusPill status={order.status} />
                </div>

                {activeTab === "ongoing" && (
                  <div className="mt-4">
                    <OrderStatusTracker status={order.status} />
                    {order.timeline && (
                      <OrderTimeline items={order.timeline} />
                    )}
                  </div>
                )}

                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Item details
                  </h4>

                  <ul className="space-y-1 text-sm text-gray-600">
                    {order.items.map(({ item, quantity }) => (
                      <li key={item.id}>
                        {quantity} × {item.name}
                      </li>
                    ))}
                  </ul>
                </div>


                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Paid</span>
                  <span className="font-bold text-gray-900">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>


                <div className="border-t mt-3 pt-3 flex gap-2 flex-wrap justify-end">
                  {order.status === "Pending" && order.orderType === "SCHEDULED" && (
                    <>
                      <button
                        onClick={() => onEditSchedule(order)}
                        className="px-3 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-semibold"
                      >
                        Edit Schedule
                      </button>
                      <button
                        onClick={() => onEditOrderItems(order)}
                        className="px-3 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-semibold"
                      >
                        Edit Items
                      </button>
                    </>
                  )}

                  {isCancellable && (
                    <button
                      onClick={() => setOrderToCancel(order.id)}
                      className="px-3 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-semibold"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </ScrollableContainer>

      <BottomNav activeScreen="orders" navigateTo={navigateTo} />
    </div>
  );
};

export default OrdersScreen;
