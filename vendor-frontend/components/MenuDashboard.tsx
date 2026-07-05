import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem } from '../types';
import { MenuItemRow } from './MenuItemRow';
import { AddItemModal } from './AddItemModal';
import { SearchIcon, PlusIcon } from './icons';
import { StatCard } from './StatCard'; 
import { VendorMenuApi } from '@/apis/vendorMenu';
import { MenuItemFormData } from '../types';

export const MenuDashboard: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [backendCategories, setBackendCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        const data = await VendorMenuApi.getMenu();
        console.log("menu data:" ,data);
        const cats = await VendorMenuApi.getCategories();
        setMenuItems(data);
        setBackendCategories(cats);
      } catch (err) {
        console.error(err);
        alert("failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuItems, searchTerm]);

  const groupedMenuItems = useMemo(() => {
    return filteredMenuItems.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filteredMenuItems]);

  const categories = useMemo(() => [...new Set(menuItems.map(item => item.category))].sort(), [menuItems]);

  const handleOpenModal = (item: MenuItem | null = null) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleSaveItem = async (data: MenuItemFormData) => {
    
    try {

      if (itemToEdit) {
      // EDIT FLOW
        await VendorMenuApi.updateBranchItem(itemToEdit.id, {
          price: data.price,
        });

        if (!itemToEdit.baseItemId) {
          throw new Error("Missing base item id");
        }

        await VendorMenuApi.updateMenuItem(itemToEdit.baseItemId, {
          name: data.name,
          description: data.description,
          foodType: data.foodType,
          imageFile: data.imageFile,
        });

      } else {
        await VendorMenuApi.addItem({
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          foodType: data.foodType,
          imageFile: data.imageFile,
        });
      }

      const refreshed = await VendorMenuApi.getMenu();
      setMenuItems(refreshed);

    } catch (err) {
      console.error(err);
      alert("Failed to save item");
    }
  };
  
  const handleToggleAvailability = async (id: string, available: boolean) => {

    try {
      await  VendorMenuApi.updateBranchItem(id, {is_available: available,});

      const refreshed = await VendorMenuApi.getMenu();
      setMenuItems(refreshed);

    } catch (err){
      console.error(err);
      alert("failed to update availability");
    }
  };
    

  // Calculate statistics for the Order Total Box
  const totalMenuItems = menuItems.length;
  const availableItemsCount = menuItems.filter(item => item.available).length;
  const unavailableItemsCount = menuItems.filter(item => !item.available).length;
  const totalCategories = categories.length;

  if(loading){
    return<div className="text-center py-20">Loading Menu...</div>
  }


  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Order Total Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-gray-800 p-4 rounded-lg shadow-lg grid grid-cols-2 gap-4 sm:flex sm:flex-nowrap sm:items-center sm:divide-x sm:divide-white/10 text-white">
        <StatCard title="Total Menu Items" value={totalMenuItems} titleClassName="text-white" valueClassName="text-white" />
        <StatCard title="Available Items" value={availableItemsCount} titleClassName="text-white" valueClassName="text-white" />
        <StatCard title="Unavailable Items" value={unavailableItemsCount} titleClassName="text-white" valueClassName="text-white" />
        <StatCard title="Total Categories" value={totalCategories} titleClassName="text-white" valueClassName="text-white" />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
                <input 
                  type="text" 
                  placeholder="Search your items" 
                  className="bg-gray-100 border-transparent rounded-md p-2 pl-10 pr-4 w-full focus:ring-2 focus:ring-offo-orange focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            </div>
            <button onClick={() => handleOpenModal()} className="bg-offo-orange hover:bg-offo-orange-dark text-white font-bold py-2 px-4 rounded-md flex items-center space-x-2 transition-colors w-full sm:w-auto justify-center">
                <PlusIcon className="w-5 h-5" />
                <span>Add Item</span>
            </button>
        </div>
        
        <div className="space-y-6">
          {Object.keys(groupedMenuItems).length > 0 ? (
            // FIX: Add a type assertion to `Object.entries`. This can be necessary if the TypeScript
            // environment doesn't correctly infer the value type, treating it as `unknown`.
            // By asserting the type, we ensure `items` is recognized as `MenuItem[]`, allowing `.map()` to be called.
            (Object.entries(groupedMenuItems) as [string, MenuItem[]][])
              .sort(([catA], [catB]) => catA.localeCompare(catB))
              .map(([category, items]) => (
              <div key={category}>
                  <h3 className="text-lg font-bold text-text-primary mb-2 pb-1 border-b-2 border-offo-tan">{category}</h3>
                  <div className="space-y-3">
                    {items.map(item => (
                       <MenuItemRow 
                          key={item.id} 
                          item={item} 
                          onEdit={handleOpenModal} 
                          onToggleAvailability={handleToggleAvailability}
                      />
                    ))}
                  </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-text-secondary">
                <p>No menu items found.</p>
                <p className="text-sm">Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>
      
      <AddItemModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        categories={categories}
      />
    </div>
  );
};