import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem, FoodItem, Cafe, CafeForUser } from "../types";

import BottomNav from "../components/BottomNav";
import CartIcon from "../components/icons/CartIcon";
import ScrollableContainer from "../components/ScrollableContainer";
import ChangeLocationModal from "@/components/ChangeLocationModal";

import { getCafesForUser } from "../api/cafes";
import { getBranchMenuForUser } from "../api/menu";
import { useUserContext } from "../hooks/useUserContext";
import { useNotifications } from "@/context/NotificationContext";
/* ------------------------------------------------------------------ */

interface HomeScreenProps {
  cart: CartItem[];
  addToCart: (item: FoodItem, quantity?: number) => void;
  setSelectedCafe: React.Dispatch<React.SetStateAction<Cafe | null>>;
  onViewFoodItem: (item: FoodItem) => void;
}

/* ------------------------------------------------------------------ */

const HomeScreen: React.FC<HomeScreenProps> = ({
  cart,
  addToCart,
  onViewFoodItem,
  setSelectedCafe,
}) => {

  const navigate = useNavigate();
  const { unreadCount, animateBell} = useNotifications();
  const [showChangeLocation, setShowChangeLocation] = useState(false);

  /* ---------------- USER CONTEXT ---------------- */
  const { context, loading: contextLoading, refresh } = useUserContext();

  useEffect(() => {
    refresh();
  }, []);

  /* ---------------- CAFES ---------------- */
  const [cafes, setCafes] = useState<CafeForUser[]>([]);
  const [cafesLoading, setCafesLoading] = useState(true);

  useEffect(() => {
    if (!context) return;

    setCafesLoading(true);
    getCafesForUser()
      .then(setCafes)
      .finally(() => setCafesLoading(false));
  }, [context]);

  /* ---------------- FOOD FROM BACKEND ---------------- */
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodLoading, setFoodLoading] = useState(true);

  useEffect(() => {
    const loadFood = async () => {
      if (!cafes.length) return;

      try {
        setFoodLoading(true);

        const openCafes = cafes.filter((c) => c.is_open);

        const menus = await Promise.all(
          openCafes.map((cafe) =>
            getBranchMenuForUser(cafe.branch_id)
          )
        );

        const balanced: FoodItem[] = [];

        const maxItemsPerCafe = 4

        openCafes.forEach((cafe, index) => {
          const cafeMenu = menus[index];

          cafeMenu.categories.forEach((category: any) => {
            category.items.slice(0,maxItemsPerCafe).forEach((item: any) => {
              balanced.push({
                id: item.branch_menu_item_id,
                branchId: cafe.branch_id,
                name: item.name,
                price: item.price,
                image: item.imageUrl,
                cafe: cafe.branch_name,
                isVeg: item.is_veg,
                category: category.category_name,
              });
            });
          });
        });

        setFoodItems(balanced);
      } catch (err) {
        console.error("Failed to load food items", err);
      } finally {
        setFoodLoading(false);
      }
    };

    loadFood();
  }, [cafes]);

  /* ---------------- LOCATION LABEL ---------------- */
  const locationLabel = context
    ? `${context.campus_name}${
        context.building_name ? ` · ${context.building_name}` : ""
      }`
    : "Select your location";

  /* ---------------- CART COUNT ---------------- */
  const cartItemCount = cart.reduce(
    (total, current) => total + current.quantity,
    0
  );

  /* ---------------- MARQUEE ---------------- */
  const marqueeContentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentTranslateX = useRef(0);
  const speed = 0.4;

  const animateMarquee = useCallback(() => {
    if (!marqueeContentRef.current) return;

    const scrollWidth = marqueeContentRef.current.scrollWidth;
    const resetBoundary = -scrollWidth / 2;

    currentTranslateX.current -= speed;

    if (currentTranslateX.current <= resetBoundary) {
      currentTranslateX.current += scrollWidth / 2;
    }

    marqueeContentRef.current.style.transform = `translateX(${currentTranslateX.current}px)`;
    animationFrameRef.current = requestAnimationFrame(animateMarquee);
  }, []);

  useEffect(() => {
    if (!foodItems.length) return;
    animationFrameRef.current = requestAnimationFrame(animateMarquee);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [foodItems, animateMarquee]);

  /* ---------------- FOOD CARD ---------------- */
  const FoodItemCard: React.FC<{ item: FoodItem }> = ({ item }) => (
    <div
      className="flex-shrink-0 w-40 bg-white p-3 rounded-xl shadow-sm flex flex-col cursor-pointer transition-transform duration-200 hover:scale-105"
      onClick={() => onViewFoodItem(item)}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-24 rounded-lg object-cover mb-2"
      />

      <div className="flex-grow">
        <p className="font-bold text-gray-800 text-sm truncate">
          {item.name}
        </p>
        <p className="text-xs text-gray-500">({item.cafe})</p>
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm font-semibold text-gray-800">
          ₹{item.price.toFixed(2)}
        </p>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({ ...item }, 1);
          }}
          className="bg-orange-100 text-orange-600 font-bold px-4 py-1.5 text-sm rounded-lg active:scale-95 transition"
        >
          + Add
        </button>
      </div>
    </div>
  );

  /* Notifications for user*/

  

  


  /* ========================== RENDER ========================== */

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      {/* HEADER */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            {/* LOCATION */}
            <button
              onClick={() => setShowChangeLocation(true)}
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <span className="text-orange-500 text-sm">📍</span>
              <span className="text-sm font-medium text-gray-800 max-w-[180px] truncate">
                {contextLoading ? 'Loading...' : locationLabel}
              </span>

              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* GREETING */}
            <h1 className="font-semibold text-lg text-gray-800">
              Hey, have a tasty day 👋
            </h1>
          </div>

          <div className="flex items-center gap-4 mt-1">
            {/* 🔔 Notification Bell */}
            <div className="relative">
              <button onClick={() => navigate('/notifications')}>
                <svg
                  className={`w-7 h-7 text-gray-700 transition-transform ${
                    animateBell ? 'animate-bounce' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 
                    2.032 0 0118 14.158V11a6.002 
                    6.002 0 00-4-5.659V5a2 
                    2 0 10-4 0v.341C7.67 
                    6.165 6 8.388 6 11v3.159c0 
                    .538-.214 1.055-.595 
                    1.436L4 17h5m6 0v1a3 3 0 
                    11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {/* CART */}
            <div className="relative mt-1">
              <button onClick={() => navigate('/cart')}>
                <CartIcon className="w-7 h-7 text-gray-700" />
              </button>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* FOOD MARQUEE */}
      {!foodLoading && foodItems.length > 0 && (
        <div className="px-4">
          <div className="overflow-hidden whitespace-nowrap relative">
            <div
              ref={marqueeContentRef}
              className="flex space-x-4"
              style={{ willChange: 'transform' }}
            >
              {[...foodItems, ...foodItems].map((item, index) => (
                <FoodItemCard key={`${item.id}-${index}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <ScrollableContainer className="px-4 pb-24">
        {/* CAFES */}
        <h2 className="font-bold text-lg my-4">Cafes Near You</h2>

        {cafesLoading &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 rounded-xl mb-3 animate-pulse"
            />
          ))}

        {!cafesLoading &&
          cafes.map((cafe) => (
            <div
              key={cafe.branch_id}
              onClick={() => {
                setSelectedCafe({
                  id: cafe.branch_id,
                  branch_id: cafe.branch_id,
                  name: cafe.branch_name,
                  location: `${cafe.campus_name}${
                    cafe.building_name ? ', ' + cafe.building_name : ''
                  }`,
                  status: cafe.is_open ? 'Open' : 'Closed',
                  image: cafe.image_url || '',
                });
                navigate('/menu');
              }}
              className="bg-white p-4 rounded-2xl mb-3 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={cafe.image_url || '/placeholder-food.png'}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold text-gray-800">{cafe.branch_name}</p>
                  <p className="text-sm text-gray-500">
                    {cafe.building_name ? `${cafe.building_name}, ` : ''}
                    {cafe.campus_name}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full text-white ${
                  cafe.is_open ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {cafe.is_open ? 'Open' : 'Closed'}
              </span>
            </div>
          ))}

        {/* POPULAR SECTION */}
        {foodItems.length > 0 && (
          <>
            <h2 className="font-bold text-lg my-4">Popular Near You</h2>

            <div className="space-y-3">
              {foodItems.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-white p-3 rounded-xl shadow-sm cursor-pointer"
                  onClick={() => onViewFoodItem(item)}
                >
                  <img
                    src={item.image}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  <div className="ml-4 flex-grow">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">({item.cafe})</p>
                    <p className="text-sm font-semibold mt-2">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="bg-orange-100 text-orange-600 font-bold px-4 py-1.5 text-sm rounded-lg"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </ScrollableContainer>

      {cartItemCount > 0 && (
        <footer className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[380px] z-40">
          <div className=" bg-gray-800 text-white rounded-xl shadow-lg flex justify-between items-center px-4 py-3">
            <p className="text-sm font-medium">
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} | ₹{' '}
              {cart
                .reduce((acc, cv) => acc + cv.item.price * cv.quantity, 0)
                .toFixed(2)}
            </p>

            <button onClick={() => navigate('/cart')} className="font-semibold">
              View Cart →
            </button>
          </div>
        </footer>
      )}

      <BottomNav />

      {showChangeLocation && context && (
        <ChangeLocationModal
          isOpen
          initialContext={context}
          onClose={() => setShowChangeLocation(false)}
          onSaved={async () => {
            setShowChangeLocation(false);
            await refresh();
          }}
        />
      )}
    </div>
  );
};

export default HomeScreen;