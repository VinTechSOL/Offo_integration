import React, { useState, useEffect, useRef } from 'react';
import type { Screen } from "../types/navigation";
import type { CartItem, OrderDetails } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ScrollableContainer from '../components/ScrollableContainer';

interface CartScreenProps {
  cart: CartItem[];
  updateCartQuantity: (itemId: number, newQuantity: number) => void;
  navigateTo: (screen: Screen) => void;
  setOrderDetails: (details: OrderDetails) => void;
  clearCart: () => void;
  isEditingOrder?: boolean;
  onUpdateOrder?: () => void;
  onOrderNow: () => void;
  onSchedule: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ cart, updateCartQuantity, navigateTo, setOrderDetails, clearCart, isEditingOrder, onUpdateOrder,onOrderNow,onSchedule }) => {
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState<number | null>(null);
  const [highlightTotal, setHighlightTotal] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [bouncingItemId, setBouncingItemId] = useState<number | null>(null);
  const prevCartRef = useRef<CartItem[]>(cart);

  const subtotal = cart.reduce((acc, cartItem) => acc + cartItem.item.price * cartItem.quantity, 0);
  const convenienceFee = 6.00;
  const total = subtotal + convenienceFee;

  useEffect(() => {
    const prevCart = prevCartRef.current;
    
    const oldTotal = prevCart.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
    if (subtotal !== oldTotal) {
      setHighlightTotal(true);
      setTimeout(() => setHighlightTotal(false), 500);

      // FIX: Explicitly set Map types to help TypeScript infer correct types for keys and values.
      const prevCartMap = new Map<number, number>(prevCart.map(i => [i.item.id, i.quantity]));
      const cartMap = new Map<number, number>(cart.map(i => [i.item.id, i.quantity]));
      let changedItemId: number | null = null;
      let quantityIncreased = false;

      for (const [id, qty] of cartMap.entries()) {
          const prevQty = prevCartMap.get(id);
          if (prevQty === undefined || qty !== prevQty) {
              changedItemId = id;
              if (prevQty !== undefined && qty > prevQty) {
                  quantityIncreased = true;
              }
              break;
          }
      }
      
      if (changedItemId) {
          setHighlightedItem(changedItemId);
          setTimeout(() => setHighlightedItem(null), 500);

          if (quantityIncreased) {
            setBouncingItemId(changedItemId);
            setTimeout(() => setBouncingItemId(null), 400); // Animation duration
          }
      }
    }

    prevCartRef.current = cart;
  }, [cart, subtotal]);

  const handleProceed = (isScheduling: boolean) => {
    if (isEditingOrder) return;
    const orderDetails: OrderDetails = { items: cart, subtotal, convenienceFee, total };
    setOrderDetails(orderDetails);
    navigateTo(isScheduling ? 'schedule' : 'payment');
  };
  
  const handleRemoveItem = (itemId: number) => {
    setRemovingItemId(itemId);
    setTimeout(() => {
      updateCartQuantity(itemId, 0);
      setRemovingItemId(null);
    }, 500); // Match animation duration
  };

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  if (cart.length === 0 && !removingItemId && !isEditingOrder) {
    return (
      <div className="flex flex-col h-full bg-[#FFF9F2]">
        <header className="p-4 flex items-center border-b">
          <div className="w-1/5">
            <button onClick={() => navigateTo('home')}>
              <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <div className="w-3/5 text-center">
            <h1 className="text-xl font-bold text-gray-800">Your Cart</h1>
          </div>
          <div className="w-1/5"></div>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center">
            <p className="text-gray-500">Your cart is empty.</p>
            <button onClick={() => navigateTo('home')} className="mt-4 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg">
                Start Ordering
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2] relative">
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20" aria-modal="true" role="dialog">
            <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-4/5">
                <h2 className="text-lg font-bold mb-2 text-gray-800">Clear Cart?</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to remove all items from your cart?</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setShowClearConfirm(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold">Cancel</button>
                    <button onClick={confirmClearCart} className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold">Clear</button>
                </div>
            </div>
        </div>
      )}
      <header className="p-4 flex items-center border-b">
        <div className="w-1/5">
          <button onClick={() => navigateTo(isEditingOrder ? 'menu' : 'home')}>
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <div className="w-3/5 text-center">
          <h1 className="text-xl font-bold text-gray-800">{isEditingOrder ? 'Edit Order' : 'Your Cart'}</h1>
        </div>
        <div className="w-1/5 text-right">
          <button onClick={handleClearCart} className="text-sm text-red-500 font-semibold pr-2">Clear All</button>
        </div>
      </header>
      
      <ScrollableContainer className="p-4 space-y-3">
        {cart.map(({ item, quantity }) => (
          <div 
            key={item.id} 
            className={`bg-white p-3 rounded-2xl shadow-md flex items-center transition-all duration-300 ease-in-out transform-gpu
              ${highlightedItem === item.id ? 'ring-2 ring-orange-400 scale-105' : ''}
              ${bouncingItemId === item.id ? 'animate-bounce-qty' : ''}
              ${removingItemId === item.id ? 'animate-slide-out' : ''}`
            }
          >
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-grow ml-4">
              <p className="font-bold text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-400">({item.cafe})</p>
              {/* <button onClick={() => handleRemoveItem(item.id)} className="text-xs text-red-500">Remove</button> */}
              
            </div>
            <div className="text-right">
                <p className="font-semibold text-gray-800 mb-2">₹ {(item.price * quantity).toFixed(2)}</p>
                <div className="flex items-center space-x-2 bg-orange-500 text-white rounded-full px-2 py-1">
                    <button onClick={() => quantity === 1 ? handleRemoveItem(item.id) : updateCartQuantity(item.id, quantity - 1)} className="w-5 h-5 flex items-center justify-center font-bold">-</button>
                    <span className="w-5 text-center font-medium">{quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, quantity + 1)} className="w-5 h-5 flex items-center justify-center font-bold">+</button>
                </div>
            </div>
          </div>
        ))}
        <div className="pt-2">
            <button onClick={() => navigateTo(isEditingOrder ? 'menu' : 'home')} className="w-full text-center py-3 border-2 border-dashed border-orange-400 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors">
              + Add More Items
            </button>
        </div>
      </ScrollableContainer>

      {cart.length > 0 && (
        <footer className="bg-white p-4 border-t rounded-t-2xl">
          <div className="space-y-2 text-sm text-gray-600">
            {cart.map(({ item, quantity }) => (
              <div key={item.id} className="flex justify-between">
                <span>{quantity}x {item.name}</span>
                <span>₹ {(item.price * quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="my-2"/>
            <div className="flex justify-between font-semibold">
              <span>Item Subtotal</span>
              <span>₹ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Convenience Fee</span>
              <span>₹ {convenienceFee.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between font-bold text-base text-gray-800 p-2 rounded-lg transition-all duration-300 ${highlightTotal ? 'bg-orange-100 scale-105' : ''}`}>
              <span>Total:</span>
              <span>₹ {total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4">
            {isEditingOrder ? (
               <button onClick={onUpdateOrder} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-md">
                  Update Order - ₹ {total.toFixed(2)}
               </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={onOrderNow} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md">
                  Order Now
                </button>
                <button onClick={onSchedule} className="w-full bg-orange-100 text-orange-600 font-bold py-3 rounded-xl border border-orange-500">
                  Schedule Order
                </button>
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default CartScreen;