import React from 'react';
import { Customer } from '../types';
import { PhoneIcon } from './icons';

interface CustomerRowProps {
  customer: Customer;
}

export const CustomerRow: React.FC<CustomerRowProps> = ({ customer }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Customer Info (Name, Phone) */}
        <div className="col-span-1 sm:col-span-2">
          <p className="font-bold text-lg text-text-primary">{customer.name}</p>
          <div className="flex items-center text-sm text-text-secondary mt-1">
            <PhoneIcon className="w-4 h-4 mr-2" />
            <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
          </div>
        </div>

        {/* Order Stats */}
        <div className="col-span-1 text-left sm:text-right">
          <p className="font-semibold text-text-primary">{customer.totalOrders}</p>
          <p className="text-xs text-text-secondary">Total Orders</p>
        </div>
      </div>
    </div>
  );
};