import React from 'react';
import { Customer } from '../types';

interface CustomerRowProps {
  customer: Customer;
  onViewOrderHistory: (customer: Customer) => void;
}

export const CustomerRow: React.FC<CustomerRowProps> = ({
  customer,
  onViewOrderHistory,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Customer Info (Name, Phone) */}
        <div className="sm:col-span-5">
          <p className="font-bold text-lg text-text-primary">{customer.name}</p>
          
        </div>

        {/* Order Stats - Center aligned */}
        <div className="sm:col-span-4 text-left sm:text-center">
          <p className="font-semibold text-text-primary">
            Total Orders : {customer.totalOrders}
          </p>
        </div>

        {/* Action Button */}
        <div className="sm:col-span-3 flex sm:justify-end">
          <button
            onClick={() => onViewOrderHistory(customer)}
            className="inline-flex items-center gap-1.5 bg-offo-orange hover:bg-offo-orange-dark text-white font-semibold py-2 px-3 rounded-md text-xs transition-colors shadow-sm active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Order History
          </button>
        </div>
      </div>
    </div>
  );
};