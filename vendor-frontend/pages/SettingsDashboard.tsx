import React from 'react';
import { BuildingOfficeIcon, PhoneIcon, UserIcon } from '../components/icons';

const SettingsField: React.FC<{ icon: React.ReactNode; label: string; id: string; value: string; }> = ({ icon, label, id, value }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input 
                type="text" 
                id={id}
                className="focus:ring-offo-orange focus:border-offo-orange block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                defaultValue={value}
            />
        </div>
    </div>
);

export const SettingsPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-fadeIn space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Branding & Profile</h2>
        <p className="mt-1 text-sm text-text-secondary">Update your cafe's public information.</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <img className="h-20 w-20 rounded-full object-cover" src="https://i.pravatar.cc/100?u=healthy-bites" alt="Cafe Logo" />
        <div>
            <button className="py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Change Logo
            </button>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SettingsField icon={<BuildingOfficeIcon className="w-5 h-5"/>} label="Café Name" id="cafeName" value="Healthy Bites Catering" />
        <SettingsField icon={<UserIcon className="w-5 h-5"/>} label="Owner / Manager Name" id="ownerName" value="Anjali Verma" />
        <SettingsField icon={<PhoneIcon className="w-5 h-5"/>} label="Contact Phone" id="phone" value="+91 98765 43210" />
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
            <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
            </button>
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-offo-orange hover:bg-offo-orange-dark">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};
