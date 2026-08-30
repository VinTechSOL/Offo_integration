import React, { useState, useEffect, useMemo } from "react";
import { Customer } from "../types";
import { StatCard } from "../components/StatCard";
import { SearchIcon } from "../components/icons";
import { CustomerRow } from "../components/CustomerRow";
import { CrmApi } from "@/apis/crm";

export const CrmDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 🔹 Filter + Search
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(
        (customer) =>
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
              placeholder="Search customers by name  "
              className="bg-gray-100 border-transparent rounded-md p-2 pl-10 pr-4 w-full focus:ring-2 focus:ring-offo-orange focus:border-transparent"
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
              <CustomerRow key={customer.id} customer={customer} />
            ))
          ) : (
            <div className="text-center py-10 text-text-secondary">
              <p>No customers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
