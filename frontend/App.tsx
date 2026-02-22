import React, { useState, useEffect } from "react";
import {Routes, Route, useNavigate,useLocation } from "react-router-dom";
import type { CartItem, OrderDetails, Cafe, Order, FoodItem } from "./types";
import BootstrapLoader from "./screens/BootstrapLoader";
import ErrorToast from "./components/ErrorToast";
import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import LocationScreen from "./screens/LocationScreen";
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import CartScreen from "./screens/CartScreen";
import ScheduleScreen from "./screens/ScheduleScreen";
import PaymentScreen from "./screens/PaymentScreen";
import SuccessScreen from "./screens/SuccessScreen";
import OrdersScreen from "./screens/OrdersScreen";
import HelpScreen from "./screens/HelpScreen";
import PaymentMethodsScreen from "./screens/PaymentMethodsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MyAccountScreen from "./screens/MyAccountScreen";
import OfflineScreen from "./screens/OfflineScreen";
import AboutScreen from "./screens/AboutScreen";
import FoodItemDetailModal from "./components/FoodItemDetailModal";
import { useToastStore } from "./store/toastStore";
import type { Screen } from "./types/navigation";

import { getUserContextDetails } from "./api/userContext";
import {
  getActiveCart,
  addToCartApi,
  updateCartItemApi,
  clearCartApi,
} from "./api/cart";
import { getMyOrdersApi,getMyActiveOrdersApi} from "./api/order";
import { mapBackendOrder } from "./utils/mapOrder";

const App: React.FC = () => {
  /* =======================
     STATE
  ======================= */

  const [screen, setScreen] = useState<Screen>("splash");
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  const [foodDetailItem, setFoodDetailItem] = useState<FoodItem | null>(null);

  const [isOffline, setIsOffline] = useState(false);

  const [location, setLocation] = useState({
    city: "",
    company: "",
    building: "",
  });

  /* =======================
     CART
  ======================= */

  const loadCart = async () => {
    const data = await getActiveCart();

    if (!data || !data.items) {
      setCart([]);
      return;
    }

    const mapped: CartItem[] = data.items.map((i: any) => ({
      item: {
        id: i.item_id,
        name: i.name ?? `Item #${i.item_id}`,
        price: i.price_at_time,
        image: i.image ?? "/placeholder.png",
        cafe: data.branch_name ?? selectedCafe?.name ?? "",
        category: "",
        isVeg: i.is_veg ?? true,
      },
      quantity: i.quantity,
    }));

    setCart(mapped);
  };

  const addToCart = async (item: FoodItem, quantity = 1) => {
    const branchId = item.branchId ?? selectedCafe?.branch_id;
    if (!branchId) return;

    await addToCartApi({
      branch_id: branchId,
      item_id: item.id,
      quantity,
    });

    await loadCart();
  };

  const updateCartQuantity = async (itemId: number, quantity: number) => {
    await updateCartItemApi(itemId, quantity);
    await loadCart();
  };

  const clearCart = async () => {
    await clearCartApi();
    setCart([]);
  };

  /* =======================
     LOCATION
  ======================= */

  const refreshLocationFromContext = async () => {
    const ctx = await getUserContextDetails();
    if (!ctx) return false;

    setLocation({
      city: ctx.city_name,
      company: ctx.campus_name,
      building: ctx.building_name || "",
    });

    return true;
  };

  /* =======================
     BOOTSTRAP
  ======================= */

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setScreen("onboarding");
        setIsBootstrapping(false);
        return;
      }

      try {
        const hasContext = await refreshLocationFromContext();
        setScreen(hasContext ? "home" : "location");
      } catch(err: any){
        if (err.code == "ERR_NETWORK"){
          setIsOffline(true);
        } else{
          setScreen("location");
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  /* =======================
     SIDE EFFECTS
  ======================= */

  useEffect(() => {
    if (screen === "home") {
      loadCart();
    }
  }, [screen]);

  useEffect(() => {
    if ((screen === "schedule" || screen === "payment") && !orderDetails) {
      setScreen("cart");
    }
  }, [screen, orderDetails]);

  useEffect(() => {
    if (screen !== "orders") return;

    let isMounted = true;

    const pollOrders = async () => {
      try {
        // 🔹 active = ongoing orders (CREATED → READY)
        const active = await getMyActiveOrdersApi();

        // 🔹 all = full history (includes completed)
        const all = await getMyOrdersApi();

        if (!isMounted) return;

        const mappedActive = active.map(mapBackendOrder);
        const mappedAll = all.map(mapBackendOrder);

        /**
        * Merge logic:
        * - Active orders always win (latest status)
        * - Past orders come from /users/orders
        */
        const mergedOrders = [
          ...mappedActive,
          ...mappedAll.filter(
            o => !mappedActive.find(a => a.id === o.id)
          ),
        ];

        setOrders(mergedOrders);
      } catch (err) {
        console.error("Order polling failed", err);
      }
    };

    // Initial load when Orders screen opens
    pollOrders();

    // Poll every 15 seconds
    const interval = setInterval(pollOrders, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [screen]);


  useEffect(() => {
    if (screen === "orders") {
      loadOrders();
    }
  }, [screen]);

  useEffect(() => {
    const handleOnline = () => {
      useToastStore.getState().showError("Back online ✅");
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);


  /* =======================
     ORDERS
  ======================= */

  const loadOrders = async () => {
    try {
      const data = await getMyOrdersApi();
      setOrders(data.map(mapBackendOrder));
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  const handleUpdateOrder = (updated: Order) => {
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
    setOrderToEdit(null);
    setIsEditingOrder(false);
    setCart([]);
    setScreen("orders");
  };

  /* =======================
     NAVIGATION
  ======================= */

  const navigateTo = (next: Screen) => {
    if (next === "login") {
      localStorage.removeItem("access_token");
      setCart([]);
      setOrders([]);
      setOrderDetails(null);
      setSelectedCafe(null);
      setFoodDetailItem(null);
    }
    setScreen(next);
  };

  /* =======================
     RENDER GUARD
  ======================= */

  if (isOffline) {
    return <OfflineScreen onRetry={() => window.location.reload()} />;
  }


  if (isBootstrapping) {
    return <BootstrapLoader />;
  }

  /* =======================
     SCREEN RENDERER
  ======================= */

  const renderScreen = () => {
    switch (screen) {
      case "splash":
        return <SplashScreen onFinish={() => navigateTo("onboarding")} />;

      case "onboarding":
        return <OnboardingScreen onGetStarted={() => navigateTo("login")} />;

      case "login":
        return (
          <LoginScreen
            navigateTo={navigateTo}
            onLoginSuccess={async flow => {
              if (flow === "signup") {
                navigateTo("location");
              } else {
                await refreshLocationFromContext();
                navigateTo("home");
              }
            }}
          />
        );

      case "location":
        return (
          <LocationScreen
            navigateTo={navigateTo}
            onConfirm={async loc => {
              setLocation(loc);
              await refreshLocationFromContext();
              navigateTo("home");
            }}
          />
        );

      case "home":
        return (
          <HomeScreen
            cart={cart}
            navigateTo={navigateTo}
            addToCart={addToCart}
            setSelectedCafe={setSelectedCafe}
            onViewFoodItem={setFoodDetailItem}
          />
        );

      case "menu":
        return (
          <MenuScreen
            cafe={selectedCafe!}
            cart={cart}
            navigateTo={navigateTo}
            addToCart={addToCart}
            isEditingOrder={isEditingOrder}
            onCancelEdit={() => navigateTo("orders")}
          />
        );

      case "cart":
        return (
          <CartScreen
            cart={cart}
            updateCartQuantity={updateCartQuantity}
            navigateTo={navigateTo}
            clearCart={clearCart}
            setOrderDetails={setOrderDetails}
            isEditingOrder={isEditingOrder}
            onUpdateOrder={() => {}}
            onOrderNow={() => {
              const subtotal = cart.reduce(
                (a, c) => a + c.item.price * c.quantity,
                0
              );
              setOrderDetails({
                items: cart,
                subtotal,
                convenienceFee: 6,
                total: subtotal + 6,
              });
              navigateTo("payment");
            }}
            onSchedule={() => {
              const subtotal = cart.reduce(
                (a, c) => a + c.item.price * c.quantity,
                0
              );
              setOrderDetails({
                items: cart,
                subtotal,
                convenienceFee: 6,
                total: subtotal + 6,
              });
              navigateTo("schedule");
            }}
          />
        );

      case "schedule":
        return (
          <ScheduleScreen
            orderDetails={orderDetails!}
            setOrderDetails={setOrderDetails}
            navigateTo={navigateTo}
            orderToEdit={orderToEdit}
            onUpdateOrder={handleUpdateOrder}
          />
        );

      case "payment":
        return (
          <PaymentScreen
            orderDetails={orderDetails!}
            setOrderDetails={setOrderDetails}
            navigateTo={navigateTo}
          />
        );

      case "success":
        return (
          <SuccessScreen
            navigateTo={navigateTo}
            clearCart={clearCart}
            orderDetails={orderDetails}
          />
        );

      case "orders":
        return (
          <OrdersScreen
            navigateTo={navigateTo}
            orders={orders}
            setOrders={setOrders}
            onEditSchedule={order => {
              setOrderToEdit(order);
              setIsEditingOrder(true);
              navigateTo("schedule");
            }}
            onEditOrderItems={order => {
              setOrderToEdit(order);
              setIsEditingOrder(true);
              setCart(order.items);
              navigateTo("menu");
            }}
          />
        );

      case 'help':
        return <HelpScreen navigateTo={navigateTo} />;

      case 'profile':
        return <ProfileScreen navigateTo={navigateTo} />;

      case 'about':
        return <AboutScreen navigateTo={navigateTo} />;

      case 'my-account':
        return <MyAccountScreen navigateTo={navigateTo} />;

      case 'payment-methods':
        return <PaymentMethodsScreen navigateTo={navigateTo} />;

      default:
        return <SplashScreen onFinish={() => navigateTo("onboarding")} />;
    }
  };

  /* =======================
     ROOT
  ======================= */

  return (
    <div className="bg-gray-100 sm:bg-slate-900 flex justify-center items-center h-screen w-full">
      <div className="w-full h-full sm:w-[412px] sm:h-[892px] bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden relative sm:border-[8px] sm:border-slate-800">
        {renderScreen()}
        <ErrorToast/>
        {foodDetailItem && (
          <FoodItemDetailModal
            item={foodDetailItem}
            onClose={() => setFoodDetailItem(null)}
            onAddToCart={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default App;
