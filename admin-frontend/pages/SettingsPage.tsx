import React, { useState } from 'react';
import Card from '../components/common/Card.tsx';
import Button from '../components/common/Button.tsx';
import { constants } from '../constants.ts';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'orders', label: 'Order Settings' },
    { id: 'commission', label: 'Commission' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>
          Admin Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage basic platform configuration.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
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

        {/* ================= GENERAL ================= */}
        {activeTab === 'general' && (
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">
              Platform Information
            </h3>

            <Input label="Platform Name" defaultValue="OFFO Admin" />
            <Input label="Support Email" defaultValue="support@offo.in" />
            <Input label="Support Phone" defaultValue="+91 9876543210" />

            <Button>Save Changes</Button>
          </Card>
        )}

        {/* ================= ORDER SETTINGS ================= */}
        {activeTab === 'orders' && (
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">
              Order Configuration
            </h3>

            <Toggle label="Allow Scheduled Orders" defaultChecked />
            <Input label="Default  Order Accepting Time (minutes)" defaultValue="15" />

            <Button>Update Order Settings</Button>
          </Card>
        )}

        {/* ================= COMMISSION ================= */}
        {activeTab === 'commission' && (
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">
              Commission Settings
            </h3>

            <Input label="Platform Commission " defaultValue="6" />
            <Input label="GST (%)" defaultValue="18" />

            <Button>Save Commission</Button>
          </Card>
        )}

        {/* ================= NOTIFICATIONS ================= */}
        {activeTab === 'notifications' && (
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">
              Notification Preferences
            </h3>

            <Toggle label="New Order Alert" defaultChecked />
            <Toggle label="Daily Summary Email" />

            <Button>Save Preferences</Button>
          </Card>
        )}

      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Input = ({
  label,
  defaultValue
}: {
  label: string;
  defaultValue?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      defaultValue={defaultValue}
      className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-offoOrange focus:border-offoOrange"
    />
  </div>
);

const Toggle = ({
  label,
  defaultChecked = false
}: {
  label: string;
  defaultChecked?: boolean;
}) => {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 rounded-full transition ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 bg-white rounded-full shadow transform transition ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};