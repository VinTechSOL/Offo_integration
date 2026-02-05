import React, { useState } from 'react';
import type { FoodItem } from '../types';

interface FoodItemDetailModalProps {
  item: FoodItem;
  onClose: () => void;
  onAddToCart: (item: FoodItem, quantity: number) => void;
}

const FoodItemDetailModal: React.FC<FoodItemDetailModalProps> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div 
        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-item-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-4/5 max-w-sm m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img src={item.image} alt={item.name} className="w-full h-48 object-cover"/>
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 bg-white/70 rounded-full p-1.5 hover:bg-white transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-800">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h2 id="food-item-title" className="text-xl font-bold text-gray-800 pr-2">{item.name}</h2>
            <div className="flex items-center flex-shrink-0">
                <span className={`h-4 w-4 mr-1.5 rounded-full border ${item.isVeg ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}></span>
                <span className="text-sm font-semibold">{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{item.cafe}</p>

          <div className="flex items-center justify-between my-4">
            <p className="text-2xl font-bold text-gray-900">₹ {(item.price * quantity).toFixed(2)}</p>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-white text-orange-500 text-2xl font-bold flex items-center justify-center shadow transition-transform active:scale-95">-</button>
                <span className="text-xl font-bold w-8 text-center tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-full bg-white text-orange-500 text-2xl font-bold flex items-center justify-center shadow transition-transform active:scale-95">+</button>
            </div>
          </div>
          
          <button 
            onClick={() => onAddToCart(item, quantity)}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-600 transition-colors"
          >
            Add {quantity} to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemDetailModal;
