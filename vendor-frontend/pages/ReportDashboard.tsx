import React, { useState, useMemo } from 'react';
import { initialOrders, initialMenuItems, initialCustomers } from '../data';
import { StatCard } from '../components/StatCard';
import { Order, OrderStatus, MenuItem, Customer } from '../types';
import { PhoneIcon } from '../components/icons';

type ReportView = 'overview' | 'menu-performance' | 'customer-insights';

const ReportTabs: React.FC<{ currentView: ReportView, setCurrentView: (view: ReportView) => void }> = ({ currentView, setCurrentView }) => {
  const baseClasses = "py-2 px-4 rounded-md font-semibold transition-colors duration-200";
  const activeClasses = "bg-offo-orange text-white shadow-md";
  const inactiveClasses = "bg-white text-text-primary hover:bg-offo-tan shadow-sm";

  const tabs: { key: ReportView, label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'menu-performance', label: 'Menu Performance' },
    { key: 'customer-insights', label: 'Customer Insights' },
  ];

  return (
    <div className="flex items-center space-x-2 mb-6 p-1 bg-offo-tan-light rounded-lg overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setCurrentView(tab.key)}
          className={`${baseClasses} ${currentView === tab.key ? activeClasses : inactiveClasses} flex-shrink-0`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export const ReportsDashboard: React.FC = () => {
  const [reportView, setReportView] = useState<ReportView>('overview');

  // --- Calculations for Overview ---
  const totalRevenue = useMemo(() => {
    return initialOrders.reduce((acc, order) => acc + order.total, 0);
  }, []);

  const totalOrders = initialOrders.length;

  const averageOrderValue = useMemo(() => {
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  }, [totalRevenue, totalOrders]);

  const orderStatusCounts = useMemo(() => {
    return initialOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
  }, []);

  // --- Calculations for Menu Performance ---
  const menuPerformance = useMemo(() => {
    const itemSales: Record<string, { quantity: number, revenue: number }> = {};
    initialOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { quantity: 0, revenue: 0 };
        }
        itemSales[item.id].quantity += item.quantity;
        itemSales[item.id].revenue += item.quantity * item.price;
      });
    });

    return Object.entries(itemSales)
      .map(([itemId, stats]) => {
        const menuItem = initialMenuItems.find(m => m.id === itemId);
        return menuItem ? { ...menuItem, totalQuantitySold: stats.quantity, totalRevenueGenerated: stats.revenue } : null;
      })
      .filter(item => item !== null)
      .sort((a, b) => (b?.totalQuantitySold || 0) - (a?.totalQuantitySold || 0));
  }, []);

  // --- Calculations for Customer Insights ---
  const frequentCustomers = useMemo(() => {
    return [...initialCustomers].sort((a, b) => b.totalOrders - a.totalOrders);
  }, []);

  const renderContent = () => {
    switch (reportView) {
      case 'overview':
        return (
          <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-gray-800 p-4 rounded-lg shadow-lg grid grid-cols-2 gap-4 sm:flex sm:flex-nowrap sm:items-center sm:divide-x sm:divide-white/10 text-white">
              <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} />
              <StatCard title="Total Orders" value={totalOrders} />
              <StatCard title="Avg. Order Value" value={`₹${averageOrderValue.toFixed(2)}`} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-text-primary">Order Status Distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.values(OrderStatus).map(status => (
                  <div key={status} className="bg-gray-50 p-4 rounded-md border border-gray-100 flex justify-between items-center">
                    <p className="font-medium text-text-secondary">{status}</p>
                    <p className="text-lg font-bold text-text-primary">{orderStatusCounts[status] || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'menu-performance':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-text-primary">Top Selling Menu Items</h3>
            {menuPerformance.length > 0 ? (
              <div className="space-y-3">
                {menuPerformance.map((item, index) => (
                  <div key={item?.id || index} className="flex items-center p-3 rounded-md bg-gray-50 border border-gray-100">
                    <img src={item?.imageUrl} alt={item?.name} className="w-12 h-12 rounded-md object-cover mr-4" />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">{item?.name}</p>
                      <p className="text-sm text-text-secondary">Category: {item?.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-primary">{item?.totalQuantitySold} sold</p>
                      <p className="text-sm text-offo-orange">₹{item?.totalRevenueGenerated?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-text-secondary">
                <p>No menu item performance data available.</p>
              </div>
            )}
          </div>
        );
      case 'customer-insights':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-text-primary">Most Frequent Customers</h3>
            {frequentCustomers.length > 0 ? (
              <div className="space-y-3">
                {frequentCustomers.map(customer => (
                  <div key={customer.id} className="flex items-center p-3 rounded-md bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary text-lg">{customer.name}</p>
                      <div className="flex items-center text-sm text-text-secondary mt-1">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-primary text-lg">{customer.totalOrders}</p>
                      <p className="text-sm text-text-secondary">Total Orders</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-text-secondary">
                <p>No customer data available.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fadeIn">
      <ReportTabs currentView={reportView} setCurrentView={setReportView} />
      {renderContent()}
    </div>
  );
};