
import React, { useState, useMemo } from 'react';
import Card from '../components/common/Card.tsx';
import Button from '../components/common/Button.tsx';
import Modal from '../components/common/Modal.tsx';
import { constants } from '../constants.ts';
import { MenuCategory, MenuItem } from '../types.ts';
import { useBranch } from '../context/BranchContext.tsx';

export const MenuPage: React.FC = () => {
  const { currentBranch, currentBranchId } = useBranch();

  const [categories, setCategories] = useState<MenuCategory[]>([
    // Branch 1: Main Campus Cafe
    { id: 'cat1', name: 'Starters', branchId: '1' },
    { id: 'cat2', name: 'Main Course', branchId: '1' },
    { id: 'cat3', name: 'Beverages', branchId: '1' },
    { id: 'cat4', name: 'Desserts', branchId: '1' },
    
    // Branch 2: East Wing Coffee Shop
    { id: 'cat5', name: 'Coffee Specials', branchId: '2' },
    { id: 'cat6', name: 'Snacks & Bakery', branchId: '2' },
    { id: 'cat7', name: 'Iced Drinks', branchId: '2' },

    // Branch 3: Downtown Hub
    { id: 'cat8', name: 'Combos', branchId: '3' },
    { id: 'cat9', name: 'Pizzas', branchId: '3' },
    { id: 'cat10', name: 'Burgers', branchId: '3' },

    // Branch 4: Westside Food Court
    { id: 'cat11', name: 'Asian Corner', branchId: '4' },
    { id: 'cat12', name: 'Street Food', branchId: '4' },
    { id: 'cat13', name: 'Healthy Bowls', branchId: '4' },

    // Branch 5: Airport Transit Cafe
    { id: 'cat14', name: 'Grab & Go', branchId: '5' },
    { id: 'cat15', name: 'Hot Beverages', branchId: '5' }
  ]);

  const [items, setItems] = useState<MenuItem[]>([
    // Branch 1
    { id: '1', categoryId: 'cat1', branchId: '1', name: 'Paneer Tikka', description: 'Spicy paneer cubes grilled to perfection', price: 250, isVeg: true, isAvailable: true },
    { id: '2', categoryId: 'cat2', branchId: '1', name: 'Chicken Biryani', description: 'Hyderabadi style aromatic rice', price: 350, isVeg: false, isAvailable: true },
    { id: '3', categoryId: 'cat3', branchId: '1', name: 'Cold Coffee', description: 'With chocolate syrup and ice cream', price: 120, isVeg: true, isAvailable: false },
    { id: '101', categoryId: 'cat1', branchId: '1', name: 'Crispy Corn', description: 'Golden fried sweet corn', price: 180, isVeg: true, isAvailable: true },
    { id: '102', categoryId: 'cat4', branchId: '1', name: 'Chocolate Brownie', description: 'Served with vanilla ice cream', price: 150, isVeg: true, isAvailable: true },

    // Branch 2
    { id: '4', categoryId: 'cat5', branchId: '2', name: 'Cappuccino', description: 'Strong brewed coffee with foam', price: 150, isVeg: true, isAvailable: true },
    { id: '5', categoryId: 'cat6', branchId: '2', name: 'Club Sandwich', description: 'Grilled with veggies and cheese', price: 200, isVeg: true, isAvailable: true },
    { id: '201', categoryId: 'cat6', branchId: '2', name: 'Blueberry Muffin', description: 'Freshly baked', price: 120, isVeg: true, isAvailable: true },
    { id: '202', categoryId: 'cat7', branchId: '2', name: 'Iced Lemon Tea', description: 'Refreshing zesty tea', price: 100, isVeg: true, isAvailable: true },

    // Branch 3
    { id: '6', categoryId: 'cat8', branchId: '3', name: 'Burger Combo', description: 'Burger + Fries + Coke', price: 300, isVeg: false, isAvailable: true },
    { id: '301', categoryId: 'cat9', branchId: '3', name: 'Margherita Pizza', description: 'Classic cheese pizza', price: 400, isVeg: true, isAvailable: true },
    { id: '302', categoryId: 'cat9', branchId: '3', name: 'Pepperoni Pizza', description: 'Loaded with pepperoni slices', price: 550, isVeg: false, isAvailable: true },
    { id: '303', categoryId: 'cat10', branchId: '3', name: 'Crispy Chicken Burger', description: 'With mayo and lettuce', price: 220, isVeg: false, isAvailable: true },

    // Branch 4
    { id: '401', categoryId: 'cat11', branchId: '4', name: 'Veg Hakka Noodles', description: 'Wok tossed noodles', price: 180, isVeg: true, isAvailable: true },
    { id: '402', categoryId: 'cat11', branchId: '4', name: 'Chicken Momos', description: 'Steamed dumplings (8 pcs)', price: 160, isVeg: false, isAvailable: true },
    { id: '403', categoryId: 'cat12', branchId: '4', name: 'Pav Bhaji', description: 'Buttery bread with spicy curry', price: 150, isVeg: true, isAvailable: true },
    { id: '404', categoryId: 'cat13', branchId: '4', name: 'Quinoa Salad', description: 'High protein healthy bowl', price: 280, isVeg: true, isAvailable: true },

    // Branch 5
    { id: '501', categoryId: 'cat14', branchId: '5', name: 'Chicken Ham Sandwich', description: 'Ready to eat', price: 250, isVeg: false, isAvailable: true },
    { id: '502', categoryId: 'cat14', branchId: '5', name: 'Fruit Bowl', description: 'Seasonal fresh fruits', price: 150, isVeg: true, isAvailable: true },
    { id: '503', categoryId: 'cat15', branchId: '5', name: 'Espresso', description: 'Single shot', price: 180, isVeg: true, isAvailable: true }
  ]);

  // Filter Categories by Branch
  const branchCategories = useMemo(() => categories.filter(c => c.branchId === currentBranchId), [categories, currentBranchId]);
  
  // Filter Items by Branch
  const branchItems = useMemo(() => items.filter(i => i.branchId === currentBranchId), [items, currentBranchId]);

  const [activeCategory, setActiveCategory] = useState<string>(branchCategories[0]?.id || '');

  // Reset active category when branch changes
  React.useEffect(() => {
    if (branchCategories.length > 0) {
        setActiveCategory(branchCategories[0].id);
    } else {
        setActiveCategory('');
    }
  }, [currentBranchId, branchCategories]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  // New Item Form State
  const [newItemStep, setNewItemStep] = useState(1);
  const [newItemData, setNewItemData] = useState<Partial<MenuItem>>({ isVeg: true, isAvailable: true });
  const [newCategoryName, setNewCategoryName] = useState('');

  // Handlers
  const handleAddItem = () => {
    setNewItemData({ isVeg: true, isAvailable: true, categoryId: activeCategory, branchId: currentBranchId });
    setNewItemStep(1);
    setIsItemModalOpen(true);
  };

  const submitItem = () => {
    const item: MenuItem = {
      id: Math.random().toString(36).substr(2, 9),
      categoryId: newItemData.categoryId || activeCategory,
      branchId: currentBranchId,
      name: newItemData.name || 'New Item',
      description: newItemData.description || '',
      price: newItemData.price || 0,
      isVeg: newItemData.isVeg || false,
      isAvailable: true,
    };
    setItems([...items, item]);
    setIsItemModalOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName) {
      const newCatId = Math.random().toString(36).substr(2, 9);
      setCategories([...categories, { id: newCatId, name: newCategoryName, branchId: currentBranchId }]);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      // Automatically select the new category if it's the first one
      if (branchCategories.length === 0) {
          setActiveCategory(newCatId);
      }
    }
  };

  const toggleAvailability = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));
  };

  const filteredItems = branchItems.filter(i => i.categoryId === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h1 className={`text-3xl font-bold text-${constants.colors.TEXT_DARK}`}>Menu Management</h1>
           <p className="text-gray-500 mt-1">Organize food items for: <span className="font-semibold text-offoOrange">{currentBranch?.name}</span></p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>+ Category</Button>
            <Button onClick={handleAddItem} disabled={branchCategories.length === 0}>+ Add Item</Button>
        </div>
      </div>

      {/* Categories Tabs */}
      {branchCategories.length > 0 ? (
        <div className="flex overflow-x-auto pb-2 border-b border-gray-200 gap-6 no-scrollbar">
            {branchCategories.map(cat => (
            <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeCategory === cat.id
                    ? 'border-offoOrange text-offoOrange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                {cat.name}
            </button>
            ))}
        </div>
      ) : (
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
              No categories found for this branch. Please create a category first.
          </div>
      )}

      {/* Items Grid */}
      {branchCategories.length > 0 && (
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                    <div className="h-40 bg-gray-200 relative">
                    {/* Mock Image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L20 16m-2 0l2-2m-6.5-6.5L12 10.5m-2.5 2.5L7 10.5M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="absolute top-2 right-2">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-sm border-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'} bg-white`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                    </div>
                    </div>
                    <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <span className="font-bold text-gray-900">₹{item.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Inventory:</span>
                            <button 
                                onClick={() => toggleAvailability(item.id)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.isAvailable ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: item.isAvailable ? 'translateX(18px)' : 'translateX(2px)' }}/>
                            </button>
                        </div>
                        <button className="text-offoOrange hover:text-offoOrange-dark text-sm font-medium">Edit</button>
                    </div>
                    </div>
                </div>
                ))}
                {/* Add Item Placeholder Card */}
                <button 
                    onClick={handleAddItem}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-offoOrange hover:text-offoOrange transition-colors h-full min-h-[250px]"
                >
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span className="font-medium">Add New Item</span>
                </button>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No items found in this category.</p>
                <Button variant="outline" className="mt-4" onClick={handleAddItem}>Add First Item</Button>
            </div>
          )
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="New Category">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-offoOrange focus:border-offoOrange"
                    placeholder="e.g. Rice Bowls"
                />
                <p className="text-xs text-gray-500 mt-1">This category will be added to <strong>{currentBranch?.name}</strong></p>
            </div>
            <div className="flex justify-end pt-4">
                <Button onClick={handleAddCategory}>Create Category</Button>
            </div>
        </div>
      </Modal>

      {/* Multi-step Add Item Modal */}
      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Add New Menu Item">
        <div className="space-y-6">
            {/* Stepper */}
            <div className="flex items-center justify-center gap-4 mb-6">
                {[1, 2, 3].map(step => (
                    <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${newItemStep >= step ? 'bg-offoOrange text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {step}
                    </div>
                ))}
            </div>

            {newItemStep === 1 && (
                <div className="space-y-4 animate-modal-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input type="text" value={newItemData.name || ''} onChange={e => setNewItemData({...newItemData, name: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-offoOrange focus:border-offoOrange" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea value={newItemData.description || ''} onChange={e => setNewItemData({...newItemData, description: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-offoOrange focus:border-offoOrange" rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select value={newItemData.categoryId} onChange={e => setNewItemData({...newItemData, categoryId: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-offoOrange focus:border-offoOrange">
                            {branchCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {newItemStep === 2 && (
                 <div className="space-y-6 animate-modal-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setNewItemData({...newItemData, isVeg: true})}
                                className={`flex-1 p-3 border rounded-lg flex items-center justify-center gap-2 ${newItemData.isVeg ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200'}`}
                            >
                                <div className="w-4 h-4 border border-green-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-green-600"></div></div>
                                Vegetarian
                            </button>
                            <button 
                                type="button"
                                onClick={() => setNewItemData({...newItemData, isVeg: false})}
                                className={`flex-1 p-3 border rounded-lg flex items-center justify-center gap-2 ${!newItemData.isVeg ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200'}`}
                            >
                                <div className="w-4 h-4 border border-red-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-red-600"></div></div>
                                Non-Veg
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                        <input type="number" value={newItemData.price || ''} onChange={e => setNewItemData({...newItemData, price: Number(e.target.value)})} className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-offoOrange focus:border-offoOrange" />
                    </div>
                 </div>
            )}

            {newItemStep === 3 && (
                <div className="space-y-4 animate-modal-in">
                    <label className="block text-sm font-medium text-gray-700">Item Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L20 16m-2 0l2-2m-6.5-6.5L12 10.5m-2.5 2.5L7 10.5M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span>Click to upload image</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">Summary</h4>
                        <p className="text-sm text-gray-600">{newItemData.name}</p>
                        <p className="text-sm text-gray-600">₹{newItemData.price} • {newItemData.isVeg ? 'Veg' : 'Non-Veg'}</p>
                        <p className="text-xs text-gray-500 mt-2">Will be added to: {currentBranch?.name}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
                {newItemStep > 1 ? (
                    <Button variant="ghost" onClick={() => setNewItemStep(newItemStep - 1)}>Back</Button>
                ) : (
                    <div></div>
                )}
                
                {newItemStep < 3 ? (
                    <Button onClick={() => setNewItemStep(newItemStep + 1)}>Next</Button>
                ) : (
                    <Button onClick={submitItem}>Save Item</Button>
                )}
            </div>
        </div>
      </Modal>
    </div>
  );
};
