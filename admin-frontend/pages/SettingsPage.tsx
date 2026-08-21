import React, { useState } from 'react';
import Card from '../components/common/Card.tsx';
import { constants } from '../constants.ts';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'orders', label: 'Order Settings' },
    { id: 'pricing', label: 'Pricing & Tax' },
  ];

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>
          Admin Settings
        </h1>

        <p className="text-gray-500 mt-1">
          View OFFO platform configuration.
        </p>
      </div>

      {/* ================= TABS ================= */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-offoOrange text-offoOrange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}

        </nav>
      </div>

      <div className="max-w-2xl">

        {/* =====================================================
            GENERAL
        ===================================================== */}
        {activeTab === 'general' && (
          <Card className="p-8 space-y-6">

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Platform Information
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Core contact information for the OFFO platform.
              </p>
            </div>

            <ReadonlyField
              label="Platform Name"
              value="OFFO."
            />

            <ReadonlyField
              label="Parent Company Name"
              value="VinTech Solutions"
            />

            <ReadonlyField
              label="Support Email"
              value="support@offo.co.in"
            />

            <ReadonlyField
              label="Support Phone"
              value="+91 9492121427"
            />

            <LockedNote />

          </Card>
        )}

        {/* =====================================================
            ORDER SETTINGS
        ===================================================== */}
        {activeTab === 'orders' && (
          <Card className="p-8 space-y-6">

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Order Configuration
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Current order processing configuration.
              </p>
            </div>

            <ReadonlyField
              label="Instant Order Acceptance Timeout"
              value="15 minutes"
            />

            <p className="text-xs text-gray-500 -mt-4">
              If the vendor does not accept an instant order within this
              time, the order is automatically cancelled and the payment
              is refunded.
            </p>

            <ReadonlyField
              label="Scheduled Order → Instant Threshold"
              value="60 minutes"
            />

            <p className="text-xs text-gray-500 -mt-4">
              A scheduled order becomes an active instant order this many
              minutes before its scheduled time.
            </p>

            <ReadonlyField
              label="Scheduled Order Grace Period"
              value="5 minutes"
            />

            <p className="text-xs text-gray-500 -mt-4">
              Grace period allowed for processing a scheduled order.
            </p>

            <LockedNote />

          </Card>
        )}

        {/* =====================================================
            PRICING & TAX
        ===================================================== */}
        {activeTab === 'pricing' && (
          <Card className="p-8 space-y-6">

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Pricing & Tax
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Current platform charges applied to customer orders.
              </p>
            </div>

            <ReadonlyField
              label="Platform Fee"
              value="₹5.00"
            />

            <p className="text-xs text-gray-500 -mt-4">
              Fixed platform fee charged to the customer per order.
            </p>

            <ReadonlyField
              label="GST on Platform Fee"
              value="18%"
            />

            <p className="text-xs text-gray-500 -mt-4">
              GST is applied only to the platform fee.
            </p>

            <LockedNote />

          </Card>
        )}

      </div>
    </div>
  );
};


/* ============================================================
   READONLY FIELD
============================================================ */

interface ReadonlyFieldProps {
  label: string;
  value: string;
}

const ReadonlyField: React.FC<ReadonlyFieldProps> = ({
  label,
  value,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="mt-1 flex items-center justify-between border border-gray-200 bg-gray-50 rounded-md p-2.5">

        <span className="text-gray-700">
          {value}
        </span>

        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 002 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

      </div>
    </div>
  );
};


/* ============================================================
   LOCKED NOTE
============================================================ */

const LockedNote: React.FC = () => {
  return (
    <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">

      <div className="flex-shrink-0 mt-0.5">
        <svg
          className="w-5 h-5 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <div>
        <p className="text-sm font-semibold text-orange-800">
          Configuration is locked
        </p>

        <p className="text-sm text-orange-700 mt-1">
          Kindly contact the technical team to change these
          platform configuration settings.

         
        </p>
        <p className="text-sm text-gray-700 mt-1">
           Note: Configurations locked for Security Purpose.
        </p>
      </div>

    </div>
  );
};

export default SettingsPage;