import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card.tsx';
import { constants } from '../constants.ts';
import { Order, OrderStatus } from '../types.ts';
import { useBranch } from '../context/BranchContext.tsx';

export const OverviewPage: React.FC = () => {
  const { currentBranchId, currentBranch } = useBranch();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  /* ================= CLOCK ================= */

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  /* ================= MOCK DATA ================= */

  const allOrders: Order[] = [
    { id: 'ORD-001', branchId: '1', customerName: 'Rahul Kumar', totalAmount: 450, status: OrderStatus.PREPARING, items: [], orderTime: '10:30 AM', paymentMethod: 'UPI', date: getTodayDate() },
    { id: 'ORD-002', branchId: '1', customerName: 'Priya Sharma', totalAmount: 120, status: OrderStatus.READY_FOR_PICKUP, items: [], orderTime: '10:15 AM', paymentMethod: 'Cash', date: getTodayDate() },
    { id: 'ORD-003', branchId: '2', customerName: 'Amit Singh', totalAmount: 850, status: OrderStatus.COMPLETED, items: [], orderTime: '09:45 AM', paymentMethod: 'Card', date: getTodayDate() },
    { id: 'ORD-004', branchId: '3', customerName: 'Sneha Gupta', totalAmount: 200, status: OrderStatus.PENDING, items: [], orderTime: '10:35 AM', paymentMethod: 'UPI', date: getTodayDate() },
    { id: 'ORD-005', branchId: '1', customerName: 'John Doe', totalAmount: 1200, status: OrderStatus.INCOMING, items: [], orderTime: '11:00 AM', paymentMethod: 'Card', date: getTodayDate() },
    { id: 'ORD-006', branchId: '2', customerName: 'Sarah Jenkins', totalAmount: 350, status: OrderStatus.READY_FOR_PICKUP, items: [], orderTime: '11:15 AM', paymentMethod: 'UPI', date: getTodayDate() },
  ];

  /* ================= DEMO FALLBACK ================= */

  const branchOrders = useMemo(() => {
    if (!currentBranchId) {
      return allOrders; // Show demo data if no branch selected
    }
    return allOrders.filter(o => o.branchId === currentBranchId);
  }, [currentBranchId]);

  /* ================= OPERATIONAL STATS ================= */

  const todayOrders = branchOrders.length;

  const todayRevenue = branchOrders.reduce(
    (acc, curr) => acc + curr.totalAmount,
    0
  );

  const activeOrders = branchOrders.filter(
    o =>
      o.status === OrderStatus.INCOMING ||
      o.status === OrderStatus.PENDING ||
      o.status === OrderStatus.PREPARING ||
      o.status === OrderStatus.READY_FOR_PICKUP
  ).length;

  const scheduledToday = branchOrders.filter(
    o => o.status === OrderStatus.READY_FOR_PICKUP
  ).length;

  /* ================= STATUS BADGE ================= */

  const getStatusClasses = (status: OrderStatus) => {
    const base =
      'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide';

    switch (status) {
      case OrderStatus.INCOMING:
        return `${base} bg-purple-100 text-purple-700`;
      case OrderStatus.PENDING:
        return `${base} bg-yellow-100 text-yellow-700`;
      case OrderStatus.PREPARING:
        return `${base} bg-blue-100 text-blue-700`;
      case OrderStatus.READY_FOR_PICKUP:
        return `${base} bg-green-100 text-green-700`;
      case OrderStatus.COMPLETED:
        return `${base} bg-gray-100 text-gray-600`;
      default:
        return `${base} bg-gray-100 text-gray-600`;
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}

      <div className="flex justify-between items-center">
        <div>
          <h1
            className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}
          >
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Operational overview for{' '}
            <span className="font-semibold text-offoOrange">
              {currentBranch?.name || 'Demo Branch'}
            </span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-sm text-gray-500">
            {currentTime.toLocaleDateString([], {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* ================= BLACK KPI STRIP ================= */}

      <div className="bg-black rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-white shadow-xl">
        <KPI label="Today Orders" value={todayOrders} />
        <KPI label="Today Revenue" value={`₹${todayRevenue}`} />
        <KPI label="Active Orders" value={activeOrders} />
        <KPI label="Scheduled Today" value={scheduledToday} />
      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT SIDE - RECENT ORDERS */}

        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Recent Orders
              </h3>
              <button
                onClick={() => navigate(constants.routes.ORDERS)}
                className="text-offoOrange text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y">
              {branchOrders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  onClick={() => navigate(constants.routes.ORDERS)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customerName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{order.totalAmount}
                    </p>
                    <span className={getStatusClasses(order.status)}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE - STORE STATUS & ACTIONS */}

        <div className="space-y-6">

          {/* Store Status */}

          <Card className="p-6 bg-slate-900 text-white">
            <p className="text-sm text-gray-400 uppercase tracking-wide">
              Store Status
            </p>

            <div className="flex justify-between items-center mt-3">
              <h3 className="text-2xl font-bold text-green-400">
                OPEN
              </h3>
              <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            <div className="mt-6">
              <p className="text-sm mb-1 text-gray-300">
                Busyness Level
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate(constants.routes.ORDERS)}
                className="p-4 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition"
              >
                Manage Orders
              </button>

              <button
                onClick={() => navigate(constants.routes.REPORTS)}
                className="p-4 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition"
              >
                View Reports
              </button>
              <button
                onClick={() => navigate(constants.routes.ADD_VENDOR)}
                className="p-4 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition"
              >
                Add Vendor
              </button>
              <button
                onClick={() => navigate(constants.routes.VIEW_CAFES)}
                className="p-4 bg-orange-50 text-orange-700 rounded-xl font-medium hover:bg-orange-100 transition"
              >
                View Cafes
              </button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

/* ================= KPI COMPONENT ================= */

const KPI = ({
  label,
  value
}: {
  label: string;
  value: number | string;
}) => (
  <div>
    <p className="text-xs uppercase text-gray-400 tracking-wide">
      {label}
    </p>
    <p className="text-3xl font-bold mt-2 text-white">
      {value}
    </p>
  </div>
);