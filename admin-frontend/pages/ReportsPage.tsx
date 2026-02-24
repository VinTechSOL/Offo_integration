import React, { useState } from 'react';
import Card from '../components/common/Card.tsx';
import { constants } from '../constants.ts';

export const ReportsPage: React.FC = () => {
  const [range, setRange] = useState<'today' | 'week' | 'month'>('month');

  /* ================= Dummy Data ================= */

  const totalOrders = 1248;
  const totalRevenue = 458900;
  const avgOrder = 367;
  const cancelled = 42;
  const completed = 1206;
  const scheduled = 28;

  return (
    <div className="space-y-10">

      {/* ================= Header ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>
            Reports
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Business performance & financial insights
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex gap-3">
          {['today', 'week', 'month'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                range === r
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              {r === 'today'
                ? 'Today'
                : r === 'week'
                ? 'This Week'
                : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* ================= Black KPI Strip ================= */}
      <div className="bg-black rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-10 text-white shadow-xl">

        <KPI label="Total Orders" value={totalOrders} />
        <KPI label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        <KPI label="Avg Order Value" value={`₹${avgOrder}`} />
        <KPI label="Cancelled Orders" value={cancelled} />
        <KPI label="Completed Orders" value={completed} />
        <KPI label="Scheduled Orders" value={scheduled} />

      </div>

      {/* ================= Revenue Trend ================= */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Revenue Trend
        </h2>

        <div className="h-64 flex items-end gap-6">
          {[12000, 18000, 14000, 22000, 26000, 20000, 30000].map(
            (val, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                <div
                  className="bg-orange-500 rounded-md w-8 transition-all"
                  style={{ height: `${val / 200}px` }}
                ></div>
                <p className="text-xs mt-2 text-gray-500">
                  Day {index + 1}
                </p>
              </div>
            )
          )}
        </div>
      </Card>

      {/* ================= Breakdown Section ================= */}
      <div className="grid md:grid-cols-2 gap-8">

        <Card className="p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">
            Orders Breakdown
          </h2>

          <Breakdown label="Completed" value="90%" color="bg-green-500" />
          <Breakdown label="Cancelled" value="5%" color="bg-red-500" />
          <Breakdown label="Scheduled" value="5%" color="bg-orange-500" />
        </Card>

        {/* 🔥 NEW: Peak Order Hours */}
        <Card className="p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">
            Peak Order Hours
          </h2>

          <PeakHour label="12 PM - 2 PM" percentage="85%" />
          <PeakHour label="6 PM - 8 PM" percentage="70%" />
          <PeakHour label="9 AM - 11 AM" percentage="40%" />
        </Card>

      </div>

      {/* ================= Top Performers ================= */}
      <div className="grid md:grid-cols-2 gap-8">

        <Card className="p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">
            Top Branches
          </h2>

          <TopRow rank={1} name="Tech Park" revenue="₹1,24,500" orders="320 orders" />
          <TopRow rank={2} name="Hitech City" revenue="₹98,400" orders="210 orders" />
          <TopRow rank={3} name="IT Park" revenue="₹76,200" orders="180 orders" />
        </Card>

        <Card className="p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">
            Top Selling Items
          </h2>

          <TopRow rank={1} name="Veg Burger" revenue="₹84,000" orders="420 sold" />
          <TopRow rank={2} name="Coffee" revenue="₹43,200" orders="360 sold" />
          <TopRow rank={3} name="Party Platter" revenue="₹50,000" orders="50 sold" />
        </Card>

      </div>

    </div>
  );
};

/* ======================================================
   Components
====================================================== */

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

const Breakdown = ({
  label,
  value,
  color
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-medium">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: value }}
      />
    </div>
  </div>
);

const PeakHour = ({
  label,
  percentage
}: {
  label: string;
  percentage: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-medium">
      <span>{label}</span>
      <span>{percentage}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-orange-500 h-2 rounded-full"
        style={{ width: percentage }}
      />
    </div>
  </div>
);

const TopRow = ({
  rank,
  name,
  revenue,
  orders
}: {
  rank: number;
  name: string;
  revenue: string;
  orders: string;
}) => (
  <div className="flex justify-between items-center border-b pb-3">
    <div className="flex items-center gap-4">
      <span className="text-orange-500 font-bold text-lg">
        {rank}.
      </span>
      <div>
        <p className="font-semibold text-gray-900">
          {name}
        </p>
        <p className="text-sm text-gray-500">
          {orders}
        </p>
      </div>
    </div>
    <p className="font-semibold text-gray-900">
      {revenue}
    </p>
  </div>
);