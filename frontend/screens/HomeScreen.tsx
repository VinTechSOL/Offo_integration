import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Screen } from "../types/navigation";
import type { CartItem, FoodItem, Cafe, CafeForUser } from "../types";
import { FOOD_ITEMS } from "../constants";

import BottomNav from "../components/BottomNav";
import CartIcon from "../components/icons/CartIcon";
import ScrollableContainer from "../components/ScrollableContainer";
import ChangeLocationModal from "@/components/ChangeLocationModal";

import { getCafesForUser } from "../api/cafes";
import { useUserContext } from "../hooks/useUserContext";

/* ------------------------------------------------------------------ */

interface HomeScreenProps {
  cart: CartItem[];
  navigateTo: (screen: Screen) => void;
  addToCart: (item: FoodItem, quantity?: number) => void;
  setSelectedCafe: React.Dispatch<React.SetStateAction<Cafe | null>>;
  onViewFoodItem: (item: FoodItem) => void;
}


/* ------------------------------------------------------------------ */

const HomeScreen: React.FC<HomeScreenProps> = ({
  cart,
  navigateTo,
  addToCart,
  onViewFoodItem,
  setSelectedCafe,
}) => {
  const [isVeg, setIsVeg] = useState(true);
  const [showChangeLocation, setShowChangeLocation] = useState(false);

  /* ---------- USER CONTEXT ---------- */
  const { context, loading: contextLoading, refresh } = useUserContext();

  /* 🔥 FIX: load context on mount */
  useEffect(() => {
    refresh();
  }, []);

  /* ---------- CAFES ---------- */
  const [cafes, setCafes] = useState<CafeForUser[]>([]);
  const [cafesLoading, setCafesLoading] = useState(true);

  useEffect(()=> {
    console.log("cafes from api",cafes);

  }, [cafes]);

  useEffect(() => {
    
    if (!context) return;

    setCafesLoading(true);
    getCafesForUser()
      .then(setCafes)
      .finally(() => setCafesLoading(false));
  }, [context]);

  /* ---------- HEADER TEXT ---------- */
  const locationLabel = context
    ? `${context.campus_name}${
        context.building_name ? ` · ${context.building_name}` : ""
      }`
    : "Select your location";

  /* ---------- CART COUNT ---------- */
  const cartItemCount = cart.reduce(
    (total, current) => total + current.quantity,
    0
  );

  /* ---------- MARQUEE ---------- */
  const marqueeContentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentTranslateX = useRef(0);
  const speed = useRef(0.4);

  const filteredFoodItems = FOOD_ITEMS.filter((item) =>
    isVeg ? item.isVeg : !item.isVeg
  );
  const marqueeItems = [...filteredFoodItems, ...filteredFoodItems];

  const animateMarquee = useCallback(() => {
    if (!marqueeContentRef.current) return;

    const scrollWidth = marqueeContentRef.current.scrollWidth;
    const resetBoundary = -scrollWidth / 2;

    currentTranslateX.current -= speed.current;
    if (currentTranslateX.current <= resetBoundary) {
      currentTranslateX.current += scrollWidth / 2;
    }

    marqueeContentRef.current.style.transform = `translateX(${currentTranslateX.current}px)`;
    animationFrameRef.current = requestAnimationFrame(animateMarquee);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateMarquee);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateMarquee]);

  /* ========================= RENDER ========================= */

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      {/* HEADER */}
      <header className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => setShowChangeLocation(true)}
              className="flex items-center gap-1 mb-1"
            >
              <span className="text-sm font-semibold text-gray-900">
                {contextLoading ? "Loading..." : locationLabel}
              </span>
              <span className="text-gray-700 text-sm">⌄</span>
            </button>

            <h1 className="font-bold text-xl text-gray-800">
              Hey, have a tasty day!
            </h1>
          </div>

          <div className="relative">
            <button onClick={() => navigateTo("cart")}>
              <CartIcon className="w-8 h-8 text-gray-700" />
            </button>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* CAFES */}
      <ScrollableContainer className="px-4 pb-24">
        <h2 className="font-bold text-lg my-4">Cafes Near You</h2>

        {cafesLoading &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 rounded-xl mb-3 animate-pulse"
            />
          ))}

        {!cafesLoading && cafes.length === 0 && (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-600">
            <p className="text-2xl mb-2">😕</p>
            <p className="font-semibold">
              We couldn’t find cafes in this area
            </p>
          </div>
        )}

        {!cafesLoading &&
          cafes.map((cafe) => (
            <div
              key={cafe.branch_name}
              onClick={() => {
                setSelectedCafe({
                  id: cafe.branch_id,
                  branch_id: cafe.branch_id,
                  name: cafe.branch_name,
                  location: `${cafe.campus_name}${
                    cafe.building_name ? ", " + cafe.building_name : ""
                  }`,
                  status: cafe.is_open ? "Open" : "Closed",
                  image:"public/assets/busiesscafe.jpg",
                  
                });
                navigateTo("menu");
              }}
              className="bg-white p-4 rounded-2xl mb-3 flex justify-between shadow-sm"
            >
              <div>
                <p className="font-bold text-gray-800">
                  {cafe.branch_name}
                </p>
                <p className="text-sm text-gray-500">
                  {cafe.building_name
                    ? `${cafe.building_name}, `
                    : ""}
                  {cafe.campus_name}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs rounded-full text-white h-fit ${
                  cafe.is_open ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {cafe.is_open ? "Open" : "Closed"}
              </span>
            </div>
          ))}
      </ScrollableContainer>

      <BottomNav activeScreen="home" navigateTo={navigateTo} />

      {showChangeLocation && context && (
        <ChangeLocationModal
          isOpen
          initialContext={context}
          onClose={() => setShowChangeLocation(false)}
          onSaved={async () => {
            setShowChangeLocation(false);
            await refresh(); // 🔥 re-sync
          }}
        />
      )}
    </div>
  );
};

export default HomeScreen;
