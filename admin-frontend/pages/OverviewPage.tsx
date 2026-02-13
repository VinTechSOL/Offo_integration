
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card.tsx';
import { constants } from '../constants.ts';
import { Order, OrderStatus } from '../types.ts';
import { useBranch } from '../context/BranchContext.tsx';

export const OverviewPage: React.FC = () => {
  const { currentBranchId, currentBranch } = useBranch();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Mock data with branchId
  const allRecentOrders: Order[] = [
    { 
      id: 'ORD-001', branchId: '1', customerName: 'Rahul Kumar', totalAmount: 450, status: OrderStatus.PREPARING, items: [], orderTime: '10:30 AM', paymentMethod: 'UPI', date: getTodayDate() 
    },
    { 
      id: 'ORD-002', branchId: '2', customerName: 'Priya Sharma', totalAmount: 120, status: OrderStatus.READY_FOR_PICKUP, items: [], orderTime: '10:15 AM', paymentMethod: 'Cash', date: getTodayDate() 
    },
    { 
      id: 'ORD-003', branchId: '1', customerName: 'Amit Singh', totalAmount: 850, status: OrderStatus.COMPLETED, items: [], orderTime: '09:45 AM', paymentMethod: 'Card', date: getTodayDate() 
    },
    { 
      id: 'ORD-004', branchId: '3', customerName: 'Sneha Gupta', totalAmount: 200, status: OrderStatus.PENDING, items: [], orderTime: '10:35 AM', paymentMethod: 'UPI', date: getTodayDate() 
    },
    { 
      id: 'ORD-005', branchId: '1', customerName: 'John Doe', totalAmount: 1200, status: OrderStatus.INCOMING, items: [], orderTime: '11:00 AM', paymentMethod: 'Card', date: getTodayDate() 
    },
    { 
      id: 'ORD-006', branchId: '1', customerName: 'Sarah Jenkins', totalAmount: 350, status: OrderStatus.READY_FOR_PICKUP, items: [], orderTime: '11:15 AM', paymentMethod: 'UPI', date: getTodayDate() 
    },
  ];

  // Filter orders by branch
  const recentOrders = useMemo(() => 
    allRecentOrders.filter(o => o.branchId === currentBranchId), 
  [currentBranchId]);

  // Calculate dynamic stats based on filtered orders
  const stats = useMemo(() => {
     const count = recentOrders.length;
     const revenue = recentOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
     
     // Base values + dynamic modification to look like a real dashboard
     const baseTodayOrders = currentBranchId === '1' ? 42 : currentBranchId === '2' ? 28 : 15;
     const baseRevenue = currentBranchId === '1' ? 15400 : currentBranchId === '2' ? 8200 : 4500;
     //const activeStaff = currentBranchId === '1' ? 8 : currentBranchId === '2' ? 5 : 3;
     
     const totalRevenue = baseRevenue + revenue;
     const totalOrders = baseTodayOrders + count;
     const avgOrderValue = Math.round(totalRevenue / totalOrders);

     return [
        { title: 'Today Orders', value: totalOrders, icon: '📦', trend: '+12%', isPositive: true },
        { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', trend: '+8%', isPositive: true },
        { title: 'Avg Order Value', value: `₹${avgOrderValue}`, icon: '📈', trend: '-2%', isPositive: false },
        //{ title: 'Active Staff', value: activeStaff, icon: '👥', trend: 'On Shift', isPositive: true },
     ];
  }, [recentOrders, currentBranchId]);

  const getStatusBadgeClasses = (status: OrderStatus) => {
    const base = 'px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide';
    switch (status) {
      case OrderStatus.INCOMING: return `${base} bg-purple-100 text-purple-700`;
      case OrderStatus.PENDING: return `${base} bg-yellow-100 text-yellow-700`;
      case OrderStatus.PREPARING: return `${base} bg-blue-100 text-blue-700`;
      case OrderStatus.READY_FOR_PICKUP: return `${base} bg-green-100 text-green-700`;
      case OrderStatus.COMPLETED: return `${base} bg-gray-100 text-gray-600`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  };

  // Simulated chart data depending on branch
  const weeklyData = currentBranchId === '1' 
    ? [40, 65, 45, 80, 55, 90, 70] 
    : currentBranchId === '2' 
        ? [30, 40, 35, 50, 45, 60, 50] 
        : [15, 20, 25, 18, 30, 35, 28];
  
  const maxVal = Math.max(...weeklyData);

  // Mock Top Items
  const topItems = useMemo(() => {
      if (currentBranchId === '1') return [
          { name: 'Veg Burger', sales: 45, revenue: 6750 },
          { name: 'Cold Coffee', sales: 38, revenue: 4560 },
          { name: 'Paneer Wrap', sales: 32, revenue: 5120 }
      ];
      return [
          { name: 'Masala Chai', sales: 60, revenue: 1200 },
          { name: 'Samosa', sales: 55, revenue: 1100 },
          { name: 'Bun Maska', sales: 30, revenue: 1500 }
      ];
  }, [currentBranchId]);

  return (
    <div className="space-y-6 animate-modal-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
         <div>
             <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>Dashboard</h1>
             <p className="text-gray-500 mt-1">
                Overview for <span className="font-semibold text-offoOrange">{currentBranch?.name}</span>
             </p>
         </div>
         <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold text-gray-800">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-sm text-gray-500">{currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
         </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`relative p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-gray-50 text-2xl`}>
                    {stat.icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.trend}
                </span>
                <span className="text-gray-400 ml-2">vs yesterday</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts & Orders) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Sales Chart */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Revenue Analytics</h3>
                        <p className="text-sm text-gray-500">Weekly sales performance</p>
                    </div>
                    <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-offoOrange focus:border-offoOrange block p-2 cursor-pointer">
                        <option>This Week</option>
                        <option>Last Week</option>
                        <option>This Month</option>
                    </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-3 px-2">
                    {weeklyData.map((val, idx) => (
                    <div key={idx} className="w-full flex flex-col items-center group">
                        <div className="w-full relative h-full flex items-end">
                            <div 
                                className={`w-full bg-${constants.colors.PRIMARY} rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-300 relative`}
                                style={{ height: `${(val / maxVal) * 100}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {val} Orders
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400 mt-3">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                        </span>
                    </div>
                    ))}
                </div>
            </Card>

            {/* Recent Orders Table */}
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                    <button 
                        onClick={() => navigate(constants.routes.ORDERS)} 
                        className="text-sm text-offoOrange font-medium hover:text-offoOrange-dark"
                    >
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                    {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(constants.routes.ORDERS)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                                <span className="text-xs text-gray-500">{order.customerName}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadgeClasses(order.status)}>{order.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">₹{order.totalAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">{order.orderTime}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                <p className="mb-2">No active orders right now.</p>
                                <button onClick={() => navigate(constants.routes.ORDERS)} className="text-offoOrange text-sm font-medium">Go to Order Manager</button>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </Card>
        </div>

        {/* Right Column (Status, Actions, Top Items) */}
        <div className="space-y-6">
            {/* Store Status Card */}
            <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Store Status</p>
                            <h3 className="text-2xl font-bold text-green-400">OPEN</h3>
                        </div>
                        <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
                    </div>
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">Busyness Level</span>
                            <span className="text-white font-medium">High</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
                        Manage Availability
                    </button>
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => navigate(constants.routes.MENU)}
                        className="p-4 rounded-xl bg-orange-50 text-offoOrange hover:bg-orange-100 transition-colors flex flex-col items-center justify-center text-center gap-2 group"
                    >
                        <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        <span className="text-xs font-bold">Add Item</span>
                    </button>
                    {/* <button 
                        onClick={() => navigate(constants.routes.STAFF)}
                        className="p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center text-center gap-2 group"
                    >
                        <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </div>
                        <span className="text-xs font-bold">Add Staff</span>
                    </button> */}
                    <button 
                        onClick={() => navigate(constants.routes.REPORTS)}
                        className="p-4 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex flex-col items-center justify-center text-center gap-2 group"
                    >
                        <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <span className="text-xs font-bold">Reports</span>
                    </button>
                    <button 
                        onClick={() => navigate(constants.routes.SETTINGS)}
                        className="p-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center gap-2 group"
                    >
                        <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span className="text-xs font-bold">Settings</span>
                    </button>
                </div>
            </Card>

            {/* Top Selling Items */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top Selling Items</h3>
                <div className="space-y-4">
                    {topItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {i + 1}
                                </span>
                                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">₹{item.revenue}</p>
                                <p className="text-xs text-gray-500">{item.sales} sold</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
