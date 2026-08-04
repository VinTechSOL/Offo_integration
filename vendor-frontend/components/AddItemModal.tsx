import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { XIcon } from './icons';
import { MenuItemFormData } from '../types';

const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 9L12 13L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItemFormData) => void;
  itemToEdit?: MenuItem | null;
  categories: string[];
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  itemToEdit, 
  categories 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [foodType, setFoodType] = useState<'veg' | 'non-veg'>('veg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [available] = useState(true);

  const isAddingNewCategory = category === 'ADD_NEW_CATEGORY';

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        setDescription(itemToEdit.description || '');
        setPrice(itemToEdit.price);
        setImagePreview(itemToEdit.imageUrl);
        setImageFile(null);
        setFoodType(itemToEdit.foodType);

        if (categories.includes(itemToEdit.category)) {
          setCategory(itemToEdit.category);
          setNewCategory('');
        } else {
          setCategory('ADD_NEW_CATEGORY');
          setNewCategory(itemToEdit.category);
        }
      } else {
        setName('');
        setDescription('');
        setCategory('ADD_NEW_CATEGORY');
        setNewCategory('');
        setPrice('');
        setImageFile(null);
        setImagePreview(null);
        setFoodType('veg');
        setImageError('');
      }
    }
  }, [itemToEdit, isOpen, categories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 400 * 1024;

      if (file.size > maxSize) {
        setImageError("Image should be less than 400 KB");
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      
      setImageError("");
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryToSave = isAddingNewCategory ? newCategory.trim() : category;
    const priceValue = typeof price === 'string' ? parseFloat(price) : price;
    
    if (!name || !categoryToSave || priceValue <= 0 || !imageFile) return;
    
    onSave({ 
      name, 
      category: categoryToSave, 
      price: priceValue, 
      imageFile, 
      foodType, 
      description 
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const isSaveDisabled = !name.trim() || 
    (typeof price === 'string' ? parseFloat(price) || 0 : price) <= 0 || 
    (itemToEdit ? false : !imageFile) || 
    (isAddingNewCategory && !newCategory.trim()) || 
    (!isAddingNewCategory && !category);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-y-auto"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="add-item-modal-title"
    >
      <div className="bg-dark-navy text-white rounded-xl shadow-2xl w-full max-w-lg relative transition-all duration-300 my-4">
        {/* Header - Compact */}
        <div className="sticky top-0 bg-dark-navy z-10 px-5 pt-5 pb-3 border-b border-slate-700 rounded-t-xl">
          <button 
            onClick={handleClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            aria-label="Close add item form"
          >
            <XIcon className="w-5 h-5" />
          </button>
          <h2 id="add-item-modal-title" className="text-xl font-bold">
            {itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
        </div>

        {/* Form Body - Compact with scroll */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <form onSubmit={handleSave} className="space-y-3.5">
            {/* Item Name - Compact */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">
                Item Name <span className="text-red-400">*</span>
              </label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-offo-orange focus:border-transparent outline-none transition-all text-sm" 
                placeholder="Enter item name"
                required 
              />
            </div>

            {/* Description - Compact */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={2} 
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-offo-orange focus:border-transparent outline-none transition-all resize-none text-sm" 
                placeholder="A short, catchy description for the item..."
              />
            </div>

            {/* Category - Compact */}
            <div>
              <label htmlFor="category" className="block text-xs font-medium text-gray-300 mb-1">
                Category <span className="text-red-400">*</span>
              </label>
              <select 
                id="category" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-offo-orange focus:border-transparent outline-none transition-all text-sm"
                required
              >
                <option value="ADD_NEW_CATEGORY">-- Add New Category --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* New Category - Compact */}
            {isAddingNewCategory && (
              <div className="animate-fadeIn">
                <label htmlFor="new-category" className="block text-xs font-medium text-gray-300 mb-1">
                  New Category Name <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  id="new-category" 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-offo-orange focus:border-transparent outline-none transition-all text-sm" 
                  placeholder="e.g., Desserts"
                  required 
                />
              </div>
            )}

            {/* Food Type - Compact */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Food Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setFoodType('veg')} 
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                    foodType === 'veg' 
                      ? 'bg-green-600 text-white ring-2 ring-green-500 ring-offset-2 ring-offset-dark-navy' 
                      : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  }`}
                >
                  Veg
                </button>
                <button 
                  type="button" 
                  onClick={() => setFoodType('non-veg')} 
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                    foodType === 'non-veg' 
                      ? 'bg-red-600 text-white ring-2 ring-red-500 ring-offset-2 ring-offset-dark-navy' 
                      : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  }`}
                >
                  Non-Veg
                </button>
              </div>
            </div>

            {/* Price - Compact */}
            <div>
              <label htmlFor="price" className="block text-xs font-medium text-gray-300 mb-1">
                Price <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-semibold text-sm">₹</span>
                <input 
                  type="number" 
                  id="price" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-7 pr-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-offo-orange focus:border-transparent outline-none transition-all text-sm" 
                  placeholder="99.00" 
                  min="0" 
                  step="0.01"
                  required 
                />
              </div>
            </div>

            {/* Image Upload - Compact */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Item Image <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center space-x-3">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-14 h-14 rounded-lg object-cover border-2 border-slate-600" 
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                    <PhotoIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex flex-col">
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1.5 px-3 rounded-lg transition-colors text-xs"
                  >
                    Upload Image
                  </label>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/png,image/jpeg,image/webp,image/jpg" 
                    className="hidden" 
                    onChange={handleImageChange} 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (Max 400KB)</p>
                  {imageError && (
                    <p className="text-red-400 text-[10px] mt-1">{imageError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
              <button 
                type="button" 
                onClick={handleClose} 
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-offo-orange hover:bg-offo-orange-dark text-white font-semibold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={isSaveDisabled}
              >
                {itemToEdit ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};