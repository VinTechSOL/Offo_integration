import React, { useState, useEffect, useRef } from 'react';
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

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

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
      // Reset position when modal opens
      setPosition({ x: 0, y: 0 });
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
    setPosition({ x: 0, y: 0 });
    onClose();
  };

  const isSaveDisabled = !name.trim() || 
    (typeof price === 'string' ? parseFloat(price) || 0 : price) <= 0 || 
    (itemToEdit ? false : !imageFile) || 
    (isAddingNewCategory && !newCategory.trim()) || 
    (!isAddingNewCategory && !category);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && modalRef.current) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Optional: Add bounds to keep modal in viewport
      const rect = modalRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (modalRef.current) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && modalRef.current) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      
      const rect = modalRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="add-item-modal-title"
    >
      {/* Draggable Modal */}
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative transition-shadow duration-200"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle - Header */}
        <div 
          className="px-6 pt-5 pb-3 border-b border-gray-100 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
            <h2 id="add-item-modal-title" className="text-lg font-bold text-gray-800">
              {itemToEdit ? 'Edit Item' : 'Add New Item'}
            </h2>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close add item form"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Item Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm" 
                placeholder="Enter item name"
                required 
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={2} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none text-sm" 
                placeholder="A short description for the item..."
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select 
                id="category" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
                required
              >
                <option value="ADD_NEW_CATEGORY">+ Add New Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* New Category */}
            {isAddingNewCategory && (
              <div className="animate-fadeIn">
                <label htmlFor="new-category" className="block text-xs font-medium text-gray-700 mb-1">
                  New Category Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="new-category" 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm" 
                  placeholder="e.g., Desserts"
                  required 
                />
              </div>
            )}

            {/* Food Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Food Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setFoodType('veg')} 
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    foodType === 'veg' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Veg
                </button>
                <button 
                  type="button" 
                  onClick={() => setFoodType('non-veg')} 
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    foodType === 'non-veg' 
                      ? 'bg-red-500 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Non-Veg
                </button>
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-medium">₹</span>
                <input 
                  type="number" 
                  id="price" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-8 pr-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm" 
                  placeholder="0.00" 
                  min="0" 
                  step="0.01"
                  required 
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Item Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200" 
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-4 rounded-lg transition-colors text-sm"
                  >
                    Choose Image(Local Upload)
                  </label>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/png,image/jpeg,image/webp,image/jpg" 
                    className="hidden" 
                    onChange={handleImageChange} 
                  />
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max 400KB)</p>
                  {imageError && (
                    <p className="text-xs text-red-500 mt-1">{imageError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={handleClose} 
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={isSaveDisabled}
              >
                {itemToEdit ? 'Save' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>

        {/* Drag indicator - small handle icon at bottom */}
        <div className="px-6 pb-3 flex justify-center opacity-30">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};