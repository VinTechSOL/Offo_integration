import React, { useState, useEffect, useMemo } from "react";
import { Customer, Order, OrderStatus } from "../types";
import { StatCard } from "../components/StatCard";
import { SearchIcon } from "../components/icons";
import { CustomerRow } from "../components/CustomerRow";
import { OrderRow } from "../components/OrderRow";
import { CrmApi } from "@/apis/crm";
import { VendorOrdersApi } from "@/apis/vendorOrders";

export const CrmDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected customer & order state for Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // 🔹 Fetch customers from backend
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await CrmApi.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customers", err);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // 🔹 Fetch selected customer's orders
  const handleOpenOrderHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    try {
      setOrdersLoading(true);
      const orders = await CrmApi.getCustomerOrders(customer.id);
      setCustomerOrders(orders);
    } catch (err) {
      console.error("Failed to load orders for customer", err);
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // 🔹 Status update handlers for OrderRow
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (newStatus === OrderStatus.Preparing) {
        await VendorOrdersApi.accept(orderId);
      } else {
        await VendorOrdersApi.move(orderId, newStatus);
      }

      setCustomerOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleRequestCancel = async (orderId: string) => {
    try {
      await VendorOrdersApi.reject(orderId);
      setCustomerOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: OrderStatus.Cancelled } : o
        )
      );
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };

  // 🔹 Filter + Search
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }, [customers, searchTerm]);

  const totalCustomers = customers.length;
  const totalOrdersAcrossAllCustomers = customers.reduce(
    (acc, c) => acc + c.totalOrders,
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* CRM Statistics */}
      <div className="bg-gradient-to-r from-offo-orange to-offo-orange-dark p-4 rounded-lg shadow-lg grid grid-cols-2 gap-4 sm:flex sm:flex-nowrap sm:items-center sm:divide-x sm:divide-white/30">
        <StatCard title="Total Customers" value={totalCustomers} />
        <StatCard title="Total Orders" value={totalOrdersAcrossAllCustomers} />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search customers by name..."
              className="bg-gray-100 border-transparent rounded-md p-2 pl-10 pr-4 w-full focus:ring-2 focus:ring-offo-orange focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search customers"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-text-secondary">
              <p>Loading customers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onViewOrderHistory={handleOpenOrderHistory}
              />
            ))
          ) : (
            <div className="text-center py-10 text-text-secondary">
              <p>No customers found.</p>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-10 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#F8FAFC] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCustomer.name}'s Order History
                </h3>
                <p className="text-xs text-gray-500">
                  Total Orders: {selectedCustomer.totalOrders}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal List using OrderRow */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 min-h-0">
              {ordersLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Loading order history...</p>
                </div>
              ) : customerOrders.length > 0 ? (
                customerOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onRequestCancel={handleRequestCancel}
                    isSelected={false}
                    onToggleSelection={() => {}}
                    showCheckbox={false}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No previous orders found for this customer.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};