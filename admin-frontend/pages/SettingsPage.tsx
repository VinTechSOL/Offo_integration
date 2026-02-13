
import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card.tsx';
import Button from '../components/common/Button.tsx';
import { constants } from '../constants.ts';
import { useBranch } from '../context/BranchContext.tsx';

export const SettingsPage: React.FC = () => {
  const { currentBranch } = useBranch();
  const [activeTab, setActiveTab] = useState('general');
  const [storeOpen, setStoreOpen] = useState(true);
  
  // Default hours
  const defaultHours = [
    { day: 'Monday', isOpen: true, open: '09:00', close: '22:00' },
    { day: 'Tuesday', isOpen: true, open: '09:00', close: '22:00' },
    { day: 'Wednesday', isOpen: true, open: '09:00', close: '22:00' },
    { day: 'Thursday', isOpen: true, open: '09:00', close: '22:00' },
    { day: 'Friday', isOpen: true, open: '09:00', close: '23:00' },
    { day: 'Saturday', isOpen: true, open: '10:00', close: '23:00' },
    { day: 'Sunday', isOpen: false, open: '10:00', close: '22:00' },
  ];

  const [businessHours, setBusinessHours] = useState(defaultHours);

  // Simulate fetching settings when branch changes
  useEffect(() => {
      // In a real app, this would fetch from API based on currentBranch.id
      // Resetting to default for simulation
      setBusinessHours(defaultHours);
      setStoreOpen(true);
  }, [currentBranch?.id]);

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'hours', label: 'Business Hours' },
    { id: 'payouts', label: 'Payouts & Banking' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const updateHours = (index: number, field: string, value: any) => {
      const newHours = [...businessHours];
      newHours[index] = { ...newHours[index], [field]: value };
      setBusinessHours(newHours);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>Settings</h1>
            <p className="text-gray-500 mt-1">Configure settings for: <span className="font-semibold text-offoOrange">{currentBranch?.name}</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

      <div className="mt-6">
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-2xl animate-modal-in">
            <Card className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Store Status ({currentBranch?.name})</h3>
                <p className="text-sm text-gray-500">Temporarily close this branch from receiving orders.</p>
              </div>
              <button 
                onClick={() => setStoreOpen(!storeOpen)}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offoOrange ${storeOpen ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${storeOpen ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Printing Preferences</h3>
              <div className="flex items-center">
                 <input type="checkbox" id="autoPrint" className="h-4 w-4 text-offoOrange focus:ring-offoOrange border-gray-300 rounded" />
                 <label htmlFor="autoPrint" className="ml-2 block text-sm text-gray-900">Automatically print KOT on new order</label>
              </div>
              <div className="flex items-center">
                 <input type="checkbox" id="printBill" className="h-4 w-4 text-offoOrange focus:ring-offoOrange border-gray-300 rounded" />
                 <label htmlFor="printBill" className="ml-2 block text-sm text-gray-900">Print 2 copies of bill</label>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'hours' && (
             <Card className="p-6 max-w-2xl animate-modal-in">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Operating Hours</h3>
                        <p className="text-sm text-gray-500">Set opening and closing time for {currentBranch?.name}</p>
                    </div>
                    <Button size="sm">Save Hours</Button>
                </div>
                <div className="space-y-4">
                    {businessHours.map((day, idx) => (
                        <div key={day.day} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                            <div className="flex items-center w-32">
                                <input 
                                    type="checkbox" 
                                    checked={day.isOpen} 
                                    onChange={(e) => updateHours(idx, 'isOpen', e.target.checked)}
                                    className="h-4 w-4 text-offoOrange focus:ring-offoOrange border-gray-300 rounded mr-3"
                                />
                                <span className={day.isOpen ? 'text-gray-900 font-medium' : 'text-gray-400'}>{day.day}</span>
                            </div>
                            {day.isOpen ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="time" 
                                        value={day.open} 
                                        onChange={(e) => updateHours(idx, 'open', e.target.value)}
                                        className="border border-gray-300 rounded p-1 text-sm"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input 
                                        type="time" 
                                        value={day.close} 
                                        onChange={(e) => updateHours(idx, 'close', e.target.value)}
                                        className="border border-gray-300 rounded p-1 text-sm"
                                    />
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 italic">Closed</span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        )}

        {activeTab === 'payouts' && (
           <Card className="p-6 max-w-2xl animate-modal-in">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Account Details</h3>
             <form className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2" defaultValue="Healthy Bites Pvt Ltd" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2" defaultValue="HDFC Bank" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input type="password" value="XXXXXXXXXX1234" className="mt-1 block w-full rounded-md border border-gray-300 p-2" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                    <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2" defaultValue="HDFC0001234" />
                  </div>
               </div>
               <div className="pt-4">
                 <Button>Update Bank Details</Button>
               </div>
             </form>
           </Card>
        )}

        {activeTab === 'notifications' && (
           <Card className="p-6 max-w-2xl animate-modal-in">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
             <div className="space-y-4">
               {['New Order Alert', 'Order Cancelled', 'Daily Report Email', 'Staff Login Alert'].map((setting, i) => (
                 <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{setting}</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id={`toggle-${i}`} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-offoOrange"/>
                        <label htmlFor={`toggle-${i}`} className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-offoOrange"></label>
                    </div>
                 </div>
               ))}
             </div>
           </Card>
        )}
      </div>
    </div>
  );
};
