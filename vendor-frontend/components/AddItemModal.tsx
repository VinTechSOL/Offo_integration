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

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit, categories }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [foodType, setFoodType] = useState<'veg' | 'non-veg'>('veg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

            // Handle category population for editing
            if (categories.includes(itemToEdit.category)) {
              setCategory(itemToEdit.category);
              setNewCategory('');
            } else {
              setCategory('ADD_NEW_CATEGORY');
              setNewCategory(itemToEdit.category);
            }
        } else {
            // Reset form for new item
            setName('');
            setDescription('');
            // If no categories exist or we are adding, automatically select 'Add New Category'
            setCategory('ADD_NEW_CATEGORY');
            setNewCategory('');
            setPrice(0);
            setImageFile(null);
            setImagePreview(null);
            setFoodType('veg');
        }
    }
  }, [itemToEdit, isOpen, categories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
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
    if (!name || !categoryToSave || price <= 0 || !imageFile) return;
    
    onSave({ name, category: categoryToSave, price, imageFile, foodType, description });
    onClose();
  };
  
  const handleClose = () => {
    onClose();
  };

  const isSaveDisabled = !name.trim() || price <= 0 || (itemToEdit ? false : !imageFile) || (isAddingNewCategory && !newCategory.trim()) || (!isAddingNewCategory && !category);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="add-item-modal-title">
      <div className="bg-dark-navy text-white p-6 rounded-lg shadow-2xl w-11/12 max-w-lg relative transition-all duration-300 animate-popIn max-h-[90vh] overflow-y-auto"> {/* Adjusted w-full max-w-md to w-11/12 max-w-lg and p-8 to p-6 */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close add item form">
          <XIcon className="w-6 h-6" />
        </button>
        
        <h2 id="add-item-modal-title" className="text-2xl font-bold mb-6">{itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2.5 px-3 focus:ring-offo-orange focus:border-offo-orange" required /> {/* Added py-2.5 px-3 */}
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    
                </div>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2.5 px-3 focus:ring-offo-orange focus:border-offo-orange" placeholder="A short, catchy description for the item..."></textarea> {/* Added py-2.5 px-3 */}
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2.5 px-3 focus:ring-offo-orange focus:border-offo-orange" required> {/* Added py-2.5 px-3 */}
                    <option value="ADD_NEW_CATEGORY">-- Add New Category --</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            
            {isAddingNewCategory && (
              <div className="animate-fadeIn">
                  <label htmlFor="new-category" className="block text-sm font-medium text-gray-300 mb-1">New Category Name</label>
                  <input type="text" id="new-category" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2.5 px-3 focus:ring-offo-orange focus:border-offo-orange" required placeholder="e.g., Desserts" /> {/* Added py-2.5 px-3 */}
              </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Food Type</label>
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setFoodType('veg')} className={`py-2 px-4 rounded-md text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${foodType === 'veg' ? 'bg-offo-green text-white ring-2 ring-offset-2 ring-offset-dark-navy ring-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        <span>Veg</span>
                    </button>
                    <button type="button" onClick={() => setFoodType('non-veg')} className={`py-2 px-4 rounded-md text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${foodType === 'non-veg' ? 'bg-offo-red text-white ring-2 ring-offset-2 ring-offset-dark-navy ring-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        <span>Non-Veg</span>
                    </button>
                </div>
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">₹</span>
                    <input type="number" id="price" value={price === 0 ? '' : price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2.5 pl-7 pr-3 focus:ring-offo-orange focus:border-offo-orange" required placeholder="99.00" min="0" /> {/* Added py-2.5 pr-3 */}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Item Image</label>
                <div className="flex items-center space-x-4">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-md object-cover border border-slate-600" />
                    ) : (
                        <div className="w-24 h-24 rounded-md bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                            <PhotoIcon className="w-10 h-10" />
                        </div>
                    )}
                    <label htmlFor="image-upload" className="cursor-pointer bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Upload Image
                    </label>
                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Cancel</button>
                <button type="submit" className="bg-offo-orange hover:bg-offo-orange-dark text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400" disabled={isSaveDisabled}>
                    {itemToEdit ? 'Save Changes' : 'Add Item'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};