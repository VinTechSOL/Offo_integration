import React, { useState, useEffect, useMemo } from 'react';
import Drawer from '../components/common/Drawer';
import { Order, OrderStatus } from '../types';
import { useBranch } from '../context/BranchContext';
import { useCity } from '../context/CityContext';
import { useCampus } from '../context/CampusContext';

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

type Tab = 'history' | 'scheduled';

export const OrdersPage: React.FC = () => {
  const { currentBranchId, branches } = useBranch();
  const { currentCityId, cities } = useCity();
  const { currentCampusId, campuses } = useCampus();

  const selectedCity = cities.find(c => c.id === currentCityId);
  const selectedCampus = campuses.find(c => c.id === currentCampusId);
  const selectedBranch = branches.find(b => b.id === currentBranchId);

  const isSelectionValid =
    currentCityId && currentCampusId && currentBranchId;

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  /* ================= INITIAL MOCK ================= */

  useEffect(() => {
    if (!currentBranchId) return;

    const initialOrders: Order[] = [
      {
        id: '500001',
        branchId: currentBranchId,
        customerName: 'Rahul Sharma',
        address: 'Tech Park - Building A',
        totalAmount: 450,
        status: OrderStatus.COMPLETED,
        date: getTodayDate(),
        orderTime: getCurrentTime(),
        paymentMethod: 'UPI',
        items: [{ id: '1', name: 'Veg Burger', quantity: 2, price: 150 }],
        itemImage:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80'
      },
      {
        id: '500002',
        branchId: currentBranchId,
        customerName: 'Corporate Event',
        address: 'Tech Park - Hall B',
        totalAmount: 5000,
        status: OrderStatus.SCHEDULED,
        date: getTodayDate(),
        orderTime: '09:00 AM',
        scheduledTime: '02:00 PM',
        paymentMethod: 'Card',
        items: [{ id: '2', name: 'Party Platter', quantity: 5, price: 1000 }],
        itemImage:
          'https://images.unsplash.com/photo-1519690889869-e705e59f72e1?auto=format&fit=crop&w=200&q=80'
      }
    ];

    setAllOrders(initialOrders);
  }, [currentBranchId]);

  /* ================= REAL TIME MOCK ================= */

  useEffect(() => {
    if (!currentBranchId) return;

    const interval = setInterval(() => {
      const newOrder: Order = {
        id: Math.floor(Date.now() % 1000000).toString(),
        branchId: currentBranchId,
        customerName: 'Walk-in Customer',
        address: 'Lobby Area',
        totalAmount: Math.floor(Math.random() * 400) + 150,
        status: OrderStatus.COMPLETED,
        date: getTodayDate(),
        orderTime: getCurrentTime(),
        paymentMethod: 'UPI',
        items: [{ id: '3', name: 'Coffee', quantity: 1, price: 120 }],
        itemImage:
          'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=200&q=80'
      };

      setAllOrders(prev => [newOrder, ...prev]);
      setNotification(`New Order #${newOrder.id}`);
      setTimeout(() => setNotification(null), 3000);
    }, 20000);

    return () => clearInterval(interval);
  }, [currentBranchId]);

  /* ================= FILTER ================= */

  const branchOrders = useMemo(
    () => allOrders.filter(o => o.branchId === currentBranchId),
    [allOrders, currentBranchId]
  );

  const filteredOrders = useMemo(() => {
    let list =
      activeTab === 'history'
        ? branchOrders.filter(o => o.status !== OrderStatus.SCHEDULED)
        : branchOrders.filter(o => o.status === OrderStatus.SCHEDULED);

    return list.filter(o => {
      const matchSearch =
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.includes(searchQuery);

      const matchDate = filterDate ? o.date === filterDate : true;
      const matchMin = minAmount ? o.totalAmount >= Number(minAmount) : true;
      const matchMax = maxAmount ? o.totalAmount <= Number(maxAmount) : true;

      return matchSearch && matchDate && matchMin && matchMax;
    });
  }, [branchOrders, activeTab, searchQuery, filterDate, minAmount, maxAmount]);

  const totalOrders = branchOrders.length;
  const revenue = branchOrders.reduce((a, b) => a + b.totalAmount, 0);
  const completedCount = branchOrders.filter(o => o.status === OrderStatus.COMPLETED).length;
  const scheduledCount = branchOrders.filter(o => o.status === OrderStatus.SCHEDULED).length;

  /* ================= VALIDATION ================= */

  if (!isSelectionValid) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Please select City, Campus and Branch
          </h2>
          <p className="text-gray-500 text-sm">
            Use the top filter bar to choose location before viewing orders.
          </p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-0 relative bg-gray-50 min-h-screen -m-4 sm:-m-6 lg:-m-8">

      {notification && (
        <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow z-50">
          {notification}
        </div>
      )}

      {/* Context Header */}
      <div className="bg-white border-b px-6 py-4">
        <p className="text-sm text-gray-500">Showing Orders For:</p>
        <div className="flex gap-6 mt-2 text-sm font-medium text-gray-800">
          <span>City: {selectedCity?.name}</span>
          <span>Campus: {selectedCampus?.name}</span>
          <span>Branch: {selectedBranch?.name}</span>
        </div>
      </div>

      {/* Stats (Original Rich Version Restored) */}
      <div className="bg-slate-900 text-white p-6 grid grid-cols-2 md:grid-cols-4">
        <div className="text-center">
          <p className="text-xs text-gray-400">TOTAL ORDERS</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">COMPLETED</p>
          <p className="text-2xl font-bold">{completedCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">SCHEDULED</p>
          <p className="text-2xl font-bold">{scheduledCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">REVENUE</p>
          <p className="text-2xl font-bold">₹{revenue}</p>
        </div>
      </div>

      <div className="p-6">

        {/* Tabs */}
        <div className="bg-white rounded-t-lg border px-6 py-4 flex gap-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`font-bold ${
              activeTab === 'history'
                ? 'text-offoOrange border-b-2 border-offoOrange'
                : 'text-gray-500'
            }`}
          >
            Order History
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`font-bold ${
              activeTab === 'scheduled'
                ? 'text-offoOrange border-b-2 border-offoOrange'
                : 'text-gray-500'
            }`}
          >
            Scheduled
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border-x border-gray-200 p-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search ID / Name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Min ₹"
            value={minAmount}
            onChange={e => setMinAmount(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxAmount}
            onChange={e => setMaxAmount(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* Orders */}
        <div className="bg-white border border-t-0 rounded-b-lg overflow-x-auto">

          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="border-b px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">

                <div>
                  <p className="font-bold">#{order.id}</p>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.address}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                    {order.itemImage && (
                      <img
                        src={order.itemImage}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {order.items[0].name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {order.items[0].quantity}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold">₹{order.totalAmount}</p>
                </div>

                <div>
                  <span className="text-green-600 text-sm font-semibold">
                    Paid ({order.paymentMethod})
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === OrderStatus.SCHEDULED
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.id}` : ''}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <p><strong>Name:</strong> {selectedOrder.customerName}</p>
            <p><strong>Address:</strong> {selectedOrder.address}</p>
            <p><strong>Amount:</strong> ₹{selectedOrder.totalAmount}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
          </div>
        )}
      </Drawer>
    </div>
  );
};