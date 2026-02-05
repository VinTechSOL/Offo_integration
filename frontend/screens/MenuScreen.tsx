import React, { useEffect, useMemo, useState } from "react";
import type { Screen } from "../types/navigation";
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
  image: string | null;
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
  categories: MenuCategoryApi[];
}

interface MenuScreenProps {
  cafe: Cafe;
  cart: CartItem[];
  navigateTo: (screen: Screen) => void;
  addToCart: (item: FoodItem) => void;
  isEditingOrder?: boolean;
  onCancelEdit?: () => void;
}

/* ================= COMPONENT ================= */

const MenuScreen: React.FC<MenuScreenProps> = ({
  cafe,
  cart,
  navigateTo,
  addToCart,
  isEditingOrder,
  onCancelEdit,
}) => {
  const [menu, setMenu] = useState<BranchMenuApi | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  /* ================= LOAD MENU ================= */

  useEffect(() => {
    console.log("menu cafe",cafe);
    console.log("branch id",cafe.branch_id);
  }, [cafe]);

  useEffect(() => {
    let active = true;

    const loadMenu = async () => {
      try {
        setLoading(true);
        const data = await getBranchMenuForUser(cafe.branch_id);
        console.log("menu api response",data);
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
                : navigateTo("home")
            }
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>

          <div className="relative">
            <button onClick={() => navigateTo("cart")}>
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
          <h1 className="text-xl font-bold">{cafe.name}</h1>
          <p className="text-sm text-gray-500">{cafe.location}</p>
        </div>

        <div className="mt-4 flex gap-3">
          <input
            className="flex-1 p-2 border rounded-lg"
            placeholder="Search your food"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`px-4 rounded-full font-semibold ${
              isVegOnly ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Veg
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ================= ITEMS ================= */}
      <ScrollableContainer className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.branch_menu_item_id}
              className="bg-white rounded-xl p-3 shadow"
            >
              <img
                src={item.image || "/placeholder-food.png"}
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <p className="font-bold text-sm">{item.name}</p>
              <p className="text-sm text-gray-600">₹ {item.price}</p>

              <button
                onClick={() =>
                  addToCart({
                    id: item.item_id,
                    name: item.name,
                    price: item.price,
                    image: item.image || "",
                    isVeg: item.is_veg,
                    cafe: cafe.name,
                    category: item.category_name,
                  })
                }
                className="mt-2 w-full bg-orange-100 text-orange-600 rounded-lg py-1 font-semibold"
              >
                Add +
              </button>
            </div>
          ))}
        </div>
      </ScrollableContainer>
      {cartItemCount > 0 && cafe.status === 'Open' && (
              <footer className="p-4 bg-gray-100 border-t flex-shrink-0">
               <div className="bg-gray-800 text-white rounded-lg shadow-lg flex justify-between items-center p-3">
                  <p>{cartItemCount} items | ₹ {cart.reduce((acc, cv) => acc + cv.item.price * cv.quantity, 0).toFixed(2)}</p>
                  <button onClick={() => navigateTo('cart')} className="font-bold">View Cart &gt;</button>
              </div>
          </footer>
      )}
    </div>
  );
};

export default MenuScreen;
