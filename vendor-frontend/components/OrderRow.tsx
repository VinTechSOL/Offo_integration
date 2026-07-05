import React from 'react';
import { Order, OrderStatus } from '../types';
import { CheckmarkIcon } from './icons';

interface OrderRowProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onRequestCancel: (orderId: string) => void;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  showCheckbox: boolean;
  isScheduledView?: boolean;
  isTodayView?: boolean;
}


const formatOrderTime = (date?: Date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
};


const PriorityBadge: React.FC<{ priority?: string }> = ({ priority }) => {
  if (!priority) return null;

  let bg = "";
  let text = priority;

  switch (priority) {
    case "HIGH":
      bg = "bg-red-500 text-white animate-pulse";
      text = "🔥 HIGH PRIORITY";
      break;
    case "NORMAL":
      bg = "bg-yellow-400 text-black";
      break;
    case "LOW":
      bg = "bg-gray-400 text-white";
      break;
    case "EXPIRED":
      bg = "bg-black text-white";
      text = "⚠ EXPIRED";
      break;
    default:
      bg = "bg-gray-300 text-black";
  }

  return (
    <div className={`absolute -top-2 -right-2 px-2 py-1 text-[10px] font-bold rounded shadow-md ${bg}`}>
      {text}
    </div>
  );
};


const StatusPill: React.FC<{ status: OrderStatus }> = ({ status }) => {
  let text = 'Pending';
  let bgColor = 'bg-red-100';
  let textColor = 'text-red-600';

  switch (status) {
    case OrderStatus.Preparing:
      text = 'Preparing';
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-600';
      break;
    case OrderStatus.Ready:
      text = 'Ready';
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-600';
      break;
    case OrderStatus.PickedUp:
      text = 'Picked Up';
      bgColor = 'bg-green-100';
      textColor = 'text-green-600';
      break;
    case OrderStatus.Cancelled:
        text = 'Cancelled';
        bgColor = 'bg-gray-200';
        textColor = 'text-gray-600';
        break;
  }

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${bgColor} ${textColor} flex-shrink-0`}>
      {text}
    </span>
  );
};


const UpdateStatusButtons: React.FC<{ order: Order; onStatusChange: (orderId: string, newStatus: OrderStatus) => void; onRequestCancel: (orderId: string) => void; }> = ({ order, onStatusChange, onRequestCancel }) => {
    const handleAccept = () => onStatusChange(order.id, OrderStatus.Preparing);
    const handleCancel = () => onRequestCancel(order.id);
    const handleReady = () => onStatusChange(order.id, OrderStatus.Ready);
    const handlePickedUp = () => onStatusChange(order.id, OrderStatus.PickedUp);

    const buttonBaseClass = "font-semibold py-2 px-4 rounded-md text-sm transition-colors text-white text-center";

    switch (order.status) {
        case OrderStatus.Incoming:
            return (
                <div className="flex space-x-2">
                    <button onClick={handleAccept} className={`${buttonBaseClass} bg-offo-green hover:opacity-90`}>Accept</button>
                    <button onClick={handleCancel} className={`${buttonBaseClass} bg-offo-orange hover:opacity-90`}>Cancel</button>
                </div>
            );
        case OrderStatus.Preparing:
            return <button onClick={handleReady} className={`${buttonBaseClass} bg-yellow-500 hover:bg-yellow-600 w-full`}>Ready</button>;
        case OrderStatus.Ready:
            return <button onClick={handlePickedUp} className={`${buttonBaseClass} bg-blue-500 hover:bg-blue-600 w-full`}>Picked up</button>;
        default:
            return <span className="text-text-secondary text-sm font-semibold pr-4">--</span>;
    }
};

const PaymentInfo: React.FC<{payment: 'Paid' | 'Not Paid', total: number}> = ({payment, total}) => (
    <div className="text-sm">
        <p className="font-semibold text-text-primary">₹{total.toFixed(2)}</p>
        {payment === 'Paid' ? (
            <div className="flex items-center space-x-1 text-green-600 font-semibold text-xs">
                <span>Paid</span>
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckmarkIcon className="w-2.5 h-2.5 text-white" />
                </span>
            </div>
        ) : (
            <span className="text-yellow-600 font-semibold text-xs">UPI</span>
        )}
    </div>
);

export const OrderRow: React.FC<OrderRowProps> = ({ order, onStatusChange,onRequestCancel, isSelected, onToggleSelection, showCheckbox,isScheduledView = false,isTodayView = false }) => {
  return (
    <div id={`order-${order.id}`} className={`relative bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-all duration-300 ${
      order.priority === "HIGH" ? "ring-2 ring-red-500 shadow-lg animate-pulse" : ""
    }`}>
      {!isTodayView && <PriorityBadge priority={order.priority} />}

      {/* Desktop View (large screens) */}
      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4 flex items-center space-x-4">
          {showCheckbox && (
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              checked={isSelected}
              onChange={() => onToggleSelection(order.id)}
              aria-label={`Select order ${order.id}`}
            />
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-text-primary text-sm">
                {order.displayOrderId || order.id}
              </p>

              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  order.orderType === "SCHEDULED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {order.orderType === "SCHEDULED"
                  ? "Scheduled"
                  : "Instant"}
              </span>
            </div>

            <p className="text-xs text-text-secondary mt-1">
              {order.orderType === "SCHEDULED"
                ? `Scheduled: ${formatOrderTime(order.scheduledAt)}`
                : `Placed: ${formatOrderTime(order.createdAt)}`}
            </p>

            <p className="font-semibold text-gray-700">
              {order.customerName}
            </p>

            <p className="text-xs text-text-secondary">
              {order.customerAddress}
            </p>
        </div>
        </div>
        <div className="col-span-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center space-x-3">
              <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
              <div>
                <p className="font-semibold text-sm text-text-primary">{item.name}</p>
                <p className="text-xs font-semibold text-gray-700">Qty: {item.quantity} </p>
                <p className="text-xs text-text-secondary">₹{(item.quantity * item.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-2">
            <PaymentInfo payment={order.payment} total={order.total} />
        </div>
        <div className="col-span-1">
          <StatusPill status={order.status} />
        </div>
        <div className="col-span-2">
          {isScheduledView || isTodayView ? (
            isScheduledView ? (
              <div className="text-sm font-semibold text-blue-600">
                Scheduled for:
                <div className="text-text-primary">
                  {order.scheduledAt?.toLocaleString()}
                </div>
              </div>

            ) : null
            
          ) : (
            <UpdateStatusButtons
              order={order}
              onStatusChange={onStatusChange}
              onRequestCancel={onRequestCancel}
            />
          )}
        </div>
      </div>

      {/* Mobile & Tablet View */}
      <div className="lg:hidden flex flex-col space-y-3">
        <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
                {showCheckbox && (
                  <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                      checked={isSelected}
                      onChange={() => onToggleSelection(order.id)}
                      aria-label={`Select order ${order.id}`}
                  />
                )}


                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-text-primary text-sm">
                      {order.displayOrderId || order.id}
                    </p>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        order.orderType === "SCHEDULED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {order.orderType === "SCHEDULED"
                        ? "Scheduled"
                        : "Instant"}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary mt-1">
                    {order.orderType === "SCHEDULED"
                      ? `Scheduled: ${formatOrderTime(order.scheduledAt)}`
                      : `Placed: ${formatOrderTime(order.createdAt)}`}
                  </p>

                  <p className="font-semibold text-gray-700 text-base">
                    {order.customerName}
                  </p>

                  <p className="text-xs text-text-secondary">
                    {order.customerAddress}
                  </p>
                </div>

            </div>
            <StatusPill status={order.status} />
        </div>
        
        <div className="border-t border-gray-100 pt-3 space-y-2">
             {order.items.map(item => (
                <div key={item.id} className="flex items-center space-x-3">
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                <div>
                    <p className="font-semibold text-sm text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-secondary">₹{item.price.toFixed(2)}</p>
                </div>
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <PaymentInfo payment={order.payment} total={order.total} />
            {isScheduledView ? (
            <div className="text-sm font-semibold text-blue-600">
              Scheduled for:
              <div className="text-text-primary">
                {order.scheduledAt?.toLocaleString()}
              </div>
            </div>
          ) : (
            <UpdateStatusButtons
              order={order}
              onStatusChange={onStatusChange}
              onRequestCancel={onRequestCancel}
            />
          )}
        </div>

      </div>
    </div>
  );
};