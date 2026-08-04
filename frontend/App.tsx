import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

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
import NotificationScreen from "./screens/NotificationsScreen";
import FoodItemDetailModal from "./components/FoodItemDetailModal";
import { useToastStore } from "./store/toastStore";
import { unlockAudio } from "./utils/sound";
import { getUserContextDetails } from "./api/userContext";
import {
  getActiveCart,
  addToCartApi,
  updateCartItemApi,
  clearCartApi,
} from "./api/cart";
import { getMyOrdersApi, getMyActiveOrdersApi } from "./api/order";
import { mapBackendOrder } from "./utils/mapOrder";

const App: React.FC = () => {
  const navigate = useNavigate();
  const locationRouter = useLocation();

  /* =======================
     STATE
  ======================= */

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  const [foodDetailItem, setFoodDetailItem] = useState<FoodItem | null>(null);

  const [locationData, setLocationData] = useState({
    city: "",
    company: "",
    building: "",
  });

  /* =======================
     AUDIO UNLOCK
  ======================= */

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);

    return () => window.removeEventListener("click", unlock);
  }, []);

  /* =======================
     CART
  ======================= */

  const loadCart = async () => {
    const data = await getActiveCart();
    if (!data?.items) {
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

    setLocationData({
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
        setIsBootstrapping(false);
        return;
      }

      try {
        const hasContext = await refreshLocationFromContext();
        if (locationRouter.pathname === "/") {
          navigate(hasContext ? "/home" : "/location", { replace: true });
        }
      } catch (err: any) {
        if (err.code === "ERR_NETWORK") {
          setIsOffline(true);
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  /* =======================
     ROUTE EFFECTS
  ======================= */

  useEffect(() => {
    if (locationRouter.pathname === "/home") {
      loadCart();
    }
  }, [locationRouter.pathname]);

  useEffect(() => {
    if (
      (locationRouter.pathname === "/schedule" ||
        locationRouter.pathname === "/payment") &&
      !orderDetails
    ) {
      navigate("/cart");
    }
  }, [locationRouter.pathname, orderDetails]);

  useEffect(() => {
    if (locationRouter.pathname !== "/orders") return;

    let isMounted = true;
    let interval: number | undefined;

    const loadHistoryOnce = async () => {
      try {
        const history = await getMyOrdersApi();
        if (!isMounted) return;
        setOrders(history.map(mapBackendOrder));
      } catch (err) {
        console.error("Failed to load order history", err);
      }
    };

    const pollActiveOnly = async () => {
      try {
        const active = await getMyActiveOrdersApi();
        if (!isMounted) return;
        const mappedActive = active.map(mapBackendOrder);
        setOrders((prev) => [
          ...mappedActive,
          ...prev.filter((o) => !mappedActive.find((a) => a.id === o.id)),
        ]);
      } catch (err) {
        console.error("Active polling failed", err);
      }
    };

    const startPolling = () => {
      if (!interval) {
        interval = window.setInterval(pollActiveOnly, 15000);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        pollActiveOnly();
        startPolling();
      } else {
        stopPolling();
      }
    };

    loadHistoryOnce();
    pollActiveOnly();
    startPolling();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMounted = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [locationRouter.pathname]);

  useEffect(() => {
    const handleOnline = () => {
      useToastStore.getState().showError("Back online ✅");
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  /* =======================
     ORDER HANDLERS
  ======================= */

  const handleUpdateOrder = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setOrderToEdit(null);
    setIsEditingOrder(false);
    setCart([]);
    navigate("/orders");
  };

  /* =======================
     OFFLINE / LOADER
  ======================= */

  if (isOffline) {
    return <OfflineScreen onRetry={() => window.location.reload()} />;
  }

  if (isBootstrapping) {
    return <BootstrapLoader />;
  }

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-[100dvh] w-full bg-[#F3DDCA] sm:bg-slate-900 flex justify-center items-center overflow-hidden p-0">
      <div className="relative bg-[#F3DDCA] overflow-hidden w-full h-[100dvh] max-w-[412px] max-h-[892px] sm:rounded-[3rem] sm:shadow-2xl sm:border-8 sm:border-slate-800">
        <Routes>
          <Route
            path="/"
            element={<Navigate to='/onboarding' replace />}
          />

          <Route
            path="/onboarding"
            element={
              <OnboardingScreen onGetStarted={() => navigate('/login')} />
            }
          />

          <Route
            path="/login"
            element={
              <LoginScreen
                onLoginSuccess={async (flow) => {
                  if (flow === 'signup') {
                    navigate('/location');
                  } else {
                    await refreshLocationFromContext();
                    navigate('/home');
                  }
                }}
              />
            }
          />

          <Route
            path="/location"
            element={
              <LocationScreen
                onConfirm={async (loc) => {
                  setLocationData(loc);
                  await refreshLocationFromContext();
                  navigate('/home');
                }}
              />
            }
          />

          <Route
            path="/home"
            element={
              <HomeScreen
                cart={cart}
                addToCart={addToCart}
                setSelectedCafe={setSelectedCafe}
                onViewFoodItem={setFoodDetailItem}
              />
            }
          />

          <Route
            path="/menu"
            element={
              selectedCafe ? (
                <MenuScreen
                  cafe={selectedCafe}
                  cart={cart}
                  addToCart={addToCart}
                  isEditingOrder={isEditingOrder}
                  onCancelEdit={() => navigate('/orders')}
                />
              ) : (
                <Navigate to="/home" replace />
              )
            }
          />

          <Route
            path="/cart"
            element={
              <CartScreen
                cart={cart}
                updateCartQuantity={updateCartQuantity}
                clearCart={clearCart}
                setOrderDetails={setOrderDetails}
                isEditingOrder={isEditingOrder}
                onUpdateOrder={() => {}}
                onOrderNow={() => {
                  const subtotal = cart.reduce(
                    (a, c) => a + c.item.price * c.quantity,
                    0,
                  );

                  const packagingFee = 0;
                  const deliveryFee = 0;
                  const convenienceFee = 5;
                  const gst = Number((convenienceFee * 0.18).toFixed(2));

                  const total =
                    subtotal +
                    packagingFee +
                    deliveryFee +
                    convenienceFee +
                    gst;

                  setOrderDetails({
                    items: cart,
                    subtotal,
                    convenienceFee,
                    gst,
                    total,
                  });

                  navigate('/payment');
                }}
                onSchedule={() => {
                  const subtotal = cart.reduce(
                    (a, c) => a + c.item.price * c.quantity,
                    0,
                  );

                  const packagingFee = 0;
                  const deliveryFee = 0;
                  const convenienceFee = 5;
                  const gst = Number((convenienceFee * 0.18).toFixed(2));

                  const total =
                    subtotal +
                    packagingFee +
                    deliveryFee +
                    convenienceFee +
                    gst;

                  setOrderDetails({
                    items: cart,
                    subtotal,
                    convenienceFee,
                    gst,
                    total,
                  });

                  navigate('/schedule');
                }}
              />
            }
          />

          <Route
            path="/schedule"
            element={
              orderDetails ? (
                <ScheduleScreen
                  orderDetails={orderDetails!}
                  setOrderDetails={setOrderDetails}
                  orderToEdit={orderToEdit}
                  onUpdateOrder={handleUpdateOrder}
                />
              ) : (
                <Navigate to="/cart" replace />
              )
            }
          />

          <Route
            path="/payment"
            element={
              orderDetails ? (
                <PaymentScreen
                  orderDetails={orderDetails!}
                  setOrderDetails={setOrderDetails}
                />
              ) : (
                <Navigate to="/cart" replace />
              )
            }
          />

          <Route
            path="/success"
            element={
              <SuccessScreen
                clearCart={clearCart}
                orderDetails={orderDetails}
              />
            }
          />

          <Route path="/notifications" element={<NotificationScreen />} />

          <Route
            path="/orders"
            element={
              <OrdersScreen
                orders={orders}
                setOrders={setOrders}
                onEditSchedule={(order) => {
                  setOrderToEdit(order);
                  setIsEditingOrder(true);
                  navigate('/schedule');
                }}
                onEditOrderItems={(order) => {
                  setOrderToEdit(order);
                  setIsEditingOrder(true);
                  setCart(order.items);
                  navigate('/menu');
                }}
              />
            }
          />

          <Route path="/help" element={<HelpScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/about" element={<AboutScreen />} />
          <Route path="/my-account" element={<MyAccountScreen />} />
          <Route path="/payment-methods" element={<PaymentMethodsScreen />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ErrorToast />

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