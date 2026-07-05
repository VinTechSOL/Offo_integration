import React from 'react';
import { MenuItem } from '../types';
import { PencilIcon } from './icons';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  const uniqueId = React.useId();
  return (
    <div className="flex items-center">
      <label htmlFor={uniqueId} className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            id={uniqueId}
            className="sr-only"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className={`block ${checked ? 'bg-offo-green' : 'bg-offo-red'} w-12 h-6 rounded-full`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
      </label>
    </div>
  );
};

const FoodTypeIndicator: React.FC<{ type: 'veg' | 'non-veg' }> = ({ type }) => {
    const isVeg = type === 'veg';
    return (
        <span className={`flex-shrink-0 w-4 h-4 border ${isVeg ? 'border-offo-green' : 'border-offo-red'} flex items-center justify-center`}>
            <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-offo-green' : 'bg-offo-red'}`}></span>
        </span>
    );
};

interface MenuItemRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onToggleAvailability: (id: string, available: boolean) => void;
}

export const MenuItemRow: React.FC<MenuItemRowProps> = ({ item, onEdit, onToggleAvailability }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center">
        {/* Item Info */}
        <div className="col-span-12 sm:col-span-5 flex items-center space-x-4">
          <img src={item.imageUrl || "/placeholder-food.png"} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-100" onError={(e) => { e.currentTarget.src = "/placeholder-food.png";}} />
          <div>
            <div className="flex items-center gap-2">
                <FoodTypeIndicator type={item.foodType} />
                <p className="font-bold text-text-primary">{item.name}</p>
            </div>
            <p className="text-sm text-text-secondary ml-6">{item.category}</p>
            {item.description && <p className="text-xs text-gray-500 mt-1 ml-6 italic">"{item.description}"</p>}
          </div>
        </div>
        
        {/* Price */}
        <div className="col-span-2 hidden sm:block">
            <p className="font-semibold text-text-primary text-sm">₹{item.price.toFixed(2)}</p>
        </div>

        {/* Availability */}
        <div className="col-span-2 hidden sm:flex flex-col items-start">
            <ToggleSwitch 
                checked={item.available}
                onChange={(checked) => onToggleAvailability(item.id, checked)}
            />
            <p className={`text-xs font-semibold mt-1 ${item.available ? 'text-offo-green' : 'text-offo-red'}`}>
              {item.available ? 'Available' : 'Unavailable'}
            </p>
        </div>

        {/* Actions */}
        <div className="col-span-3 hidden sm:flex items-center justify-end space-x-2">
            <button onClick={() => onEdit(item)} className="p-2 rounded-md hover:bg-gray-100 text-text-secondary">
                <PencilIcon className="w-5 h-5" />
            </button>
        </div>

        {/* Mobile Layout Bottom Row */}
        <div className="sm:hidden flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <p className="font-semibold text-text-primary text-sm">₹{item.price.toFixed(2)}</p>
          <div className="flex items-center space-x-4">
             <div className="flex flex-col items-center">
                <ToggleSwitch 
                    checked={item.available}
                    onChange={(checked) => onToggleAvailability(item.id, checked)}
                />
                <p className={`text-xs font-semibold mt-1 ${item.available ? 'text-offo-green' : 'text-offo-red'}`}>
                {item.available ? 'Available' : 'Unavailable'}
                </p>
            </div>
            <div className="flex items-center">
                <button onClick={() => onEdit(item)} className="p-2 text-text-secondary">
                    <PencilIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};