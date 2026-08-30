import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem, FoodItem, Cafe } from "../types";
import { getBranchMenuForUser } from "@/api/menu";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import CartIcon from "../components/icons/CartIcon";
import ScrollableContainer from "../components/ScrollableContainer";

/* ================= TYPES ================= */

interface MenuItemApi {
  branch_menu_item_id: number;
  item_id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  is_veg: boolean;
  is_available: boolean;
  category_name: string;
}

interface MenuCategoryApi {
  category_id: number;
  category_name: string;
  items: MenuItemApi[];
}

interface BranchMenuApi {
  branch_id: number;
  fssai_license_number?: string | null;
  categories: MenuCategoryApi[];
}

interface MenuScreenProps {
  cafe: Cafe;
  cart: CartItem[];
  addToCart: (item: FoodItem, quantity?: number) => void;
  isEditingOrder?: boolean;
  onCancelEdit?: () => void;
}

/* ================= COMPONENT ================= */

const MenuScreen: React.FC<MenuScreenProps> = ({
  cafe,
  cart,
  addToCart,
  isEditingOrder,
  onCancelEdit,
}) => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<BranchMenuApi | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  /* ================= LOAD MENU ================= */

  useEffect(() => {
    let active = true;

    const loadMenu = async () => {
      try {
        setLoading(true);
        const data = await getBranchMenuForUser(cafe.branch_id);
        if (active) {
          setMenu(data);
        }
      } catch (err) {
        console.error("Failed to load menu", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMenu();
    return () => {
      active = false;
    };
  }, [cafe.branch_id]);

  /* ================= DERIVED DATA ================= */

  const categories = useMemo(() => {
    if (!menu) return [];
    return ["All", ...menu.categories.map((c) => c.category_name)];
  }, [menu]);

  const allItems = useMemo(() => {
    if (!menu) return [];
    return menu.categories.flatMap((c) => c.items);
  }, [menu]);

  const filteredItems = useMemo(() => {
    return allItems
      .filter((i) => (isVegOnly ? i.is_veg : true))
      .filter((i) =>
        selectedCategory === "All"
          ? true
          : i.category_name === selectedCategory
      )
      .filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [allItems, isVegOnly, selectedCategory, searchQuery]);

  const cartItemCount = cart.reduce(
    (sum, c) => sum + c.quantity,
    0
  );

  const getItemQuantity = (id: string | number) => {
    const cartItem = cart.find((c) => c.item.id === id);
    return cartItem && cartItem.quantity > 0 ? cartItem.quantity : 0;
  };

  /* ================= REUSABLE QUANTITY CONTROL ================= */

  const QuantityControl = ({ item }: { item: MenuItemApi }) => {
    const qty = getItemQuantity(item.branch_menu_item_id);

    const foodPayload: FoodItem = {
      id: item.branch_menu_item_id,
      branchId: cafe.branch_id,
      name: item.name,
      price: item.price,
      image: item.imageUrl || "",
      isVeg: item.is_veg,
      cafe: cafe.name,
      category: item.category_name,
    };

    if (qty <= 0) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(foodPayload, 1);
          }}
          className="w-full bg-orange-100 text-orange-600 font-bold py-1.5 text-sm rounded-lg active:scale-95 transition"
        >
          Add +
        </button>
      );
    }

    return (
      <div
        className="flex items-center justify-between bg-orange-500 text-white rounded-lg font-bold text-sm overflow-hidden w-full"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          onClick={() => addToCart(foodPayload, -1)}
          className="px-3 py-1 hover:bg-orange-600 active:scale-90 transition"
        >
          -
        </button>
        <span className="text-xs px-1">{qty}</span>
        <button
          onClick={() => addToCart(foodPayload, 1)}
          className="px-3 py-1 hover:bg-orange-600 active:scale-90 transition"
        >
          +
        </button>
      </div>
    );
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading menu…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      {/* ================= HEADER ================= */}
      <header className="p-4 sticky top-0 bg-[#FFF9F2] z-10 border-b">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() =>
              isEditingOrder && onCancelEdit
                ? onCancelEdit()
                : navigate('/home')
            }
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>

          <div className="relative">
            <button onClick={() => navigate('/cart')}>
              <CartIcon className="w-8 h-8 text-gray-700" />
            </button>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">{cafe.name}</h1>
          <p className="text-sm text-gray-500">{cafe.location}</p>
        </div>

        <div className="mt-4 flex gap-3">
          <input
            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
            placeholder="Search your food"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`px-4 rounded-full font-semibold text-sm transition ${
              isVegOnly ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Veg
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ================= ITEMS GRID ================= */}
      <ScrollableContainer className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.branch_menu_item_id}
              className="bg-white rounded-xl p-3 shadow-sm flex flex-col justify-between h-full border border-gray-100"
            >
              <div>
                <img
                  src={item.imageUrl || '/placeholder-food.png'}
                  alt={item.name}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />
                <p 
                  className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]"
                  title={item.name}
                >
                  {item.name}
                </p>
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  ₹ {item.price.toFixed(2)}
                </p>
                <QuantityControl item={item} />
              </div>
            </div>
          ))}
        </div>

        {/* ================= RESTAURANT INFORMATION ================= */}
        <div className="px-2 pb-6 pt-6">
          <div className="border-t border-gray-200 pt-5 text-xs text-gray-500 space-y-2">
            <p className="font-semibold text-gray-900">Disclaimer</p>

            <p>
              • Prices are decided and maintained by the respective restaurant
              and may change from time to time.
            </p>

            <p>
              • Menu item availability is controlled by the restaurant and may
              change without prior notice.
            </p>

            <p>
              • Food images are for representation purposes only. Actual items
              may vary slightly in appearance.
            </p>

            <p>
              • Customers with food allergies or dietary restrictions are
              advised to confirm ingredients directly with the restaurant.
            </p>

            <p>
              • Order acceptance and preparation are subject to restaurant
              confirmation and availability.
            </p>

            <div className="pt-2">
              <p className="font-semibold text-gray-700">FSSAI License Number : {menu?.fssai_license_number || "Not available"}</p>
            </div>
          </div>
        </div>
      </ScrollableContainer>

      {/* ================= FLOATING CART SUMMARY ================= */}
      {cartItemCount > 0 && cafe.status === 'Open' && (
        <footer className="p-4 bg-transparent border-t flex-shrink-0">
          <div className="bg-gray-800 text-white rounded-xl shadow-lg flex justify-between items-center p-3">
            <p className="text-sm font-medium">
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} | ₹{' '}
              {cart
                .reduce((acc, cv) => acc + cv.item.price * cv.quantity, 0)
                .toFixed(2)}
            </p>
            <button 
              onClick={() => navigate('/cart')} 
              className="font-bold text-sm hover:text-orange-400 transition"
            >
              View Cart &gt;
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MenuScreen;