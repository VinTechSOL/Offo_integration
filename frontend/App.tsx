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
import PaymentStatusScreen from "./screens/PaymentStatusScreen";
import PaymentFailedScreen from "./screens/PaymentFailedScreen";
import SuccessScreen from "./screens/SuccessScreen";
import OrdersScreen from "./screens/OrdersScreen";
import HelpScreen from "./screens/HelpScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MyAccountScreen from "./screens/MyAccountScreen";
import OfflineScreen from "./screens/OfflineScreen";
import AboutScreen from "./screens/AboutScreen";
import NotificationScreen from "./screens/NotificationsScreen";
import TicketDetail from "./screens/TicketDetail";
import TicketsScreen from "./screens/TicketScreen";
import FoodItemDetailModal from "./components/FoodItemDetailModal";
import { useToastStore } from "./store/toastStore";
import { unlockAudio } from "./utils/sound";
import { getUserContextDetails } from "./api/userContext";
import api, {refreshApi} from "./api/client";

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
    city: '',
    company: '',
    building: '',
  });

  /* =======================
     AUDIO UNLOCK
  ======================= */

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('click', unlock);

    return () => window.removeEventListener('click', unlock);
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
        image: i.image ?? '/placeholder.png',
        cafe: data.branch_name ?? selectedCafe?.name ?? '',
        category: '',
        isVeg: i.is_veg ?? true,
      },
      quantity: i.quantity,
    }));

    setCart(mapped);
  };

  const addToCart = async (item: FoodItem, delta = 1) => {
    const branchId = item.branchId ?? selectedCafe?.branch_id;
    if (!branchId) return;

    const existingItem = cart.find((c) => c.item.id === item.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + delta;

    // 1. Optimistic UI update (Instant UI response)
    if (newQty <= 0) {
      setCart((prev) => prev.filter((c) => c.item.id !== item.id));
    } else {
      setCart((prev) => {
        const exists = prev.some((c) => c.item.id === item.id);
        if (exists) {
          return prev.map((c) =>
            c.item.id === item.id ? { ...c, quantity: newQty } : c,
          );
        }
        return [...prev, { item, quantity: newQty }];
      });
    }

    // 2. Sync with Backend
    try {
      if (newQty <= 0) {
        // If quantity drops to 0 or below, update/delete via updateCartItemApi
        await updateCartItemApi(item.id, 0);
      } else {
        await addToCartApi({
          branch_id: branchId,
          item_id: item.id,
          quantity: delta,
        });
      }
    } catch (err) {
      console.error('Failed to update cart:', err);
    } finally {
      // 3. Final sync with database state
      await loadCart();
    }
  };

  const updateCartQuantity = async (itemId: number, quantity: number) => {
    // Optimistic UI update
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((c) => (c.item.id === itemId ? { ...c, quantity } : c)),
      );
    }

    try {
      await updateCartItemApi(itemId, quantity);
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
    } finally {
      await loadCart();
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      await clearCartApi();
    } catch (err) {
      console.error('Failed to clear cart:', err);
      await loadCart();
    }
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
      building: ctx.building_name || '',
    });

    return true;
  };



  /* =======================
   BOOTSTRAP / SESSION RESTORE
  ======================= */

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const token = localStorage.getItem('access_token');

        // ------------------------------------------------------
        // CASE 1: Access token already exists
        // ------------------------------------------------------

        if (token) {
          try {
            const hasContext = await refreshLocationFromContext();

            if (!mounted) return;

            if (locationRouter.pathname === '/') {
              navigate(hasContext ? '/home' : '/location', { replace: true });
            }

            return;
          } catch (error: any) {
            // --------------------------------------------------
            // Existing access token is invalid/expired.
            //
            // Remove it and try refresh-session restoration.
            // --------------------------------------------------

            if (error?.response?.status !== 401) {
              throw error;
            }

            localStorage.removeItem('access_token');
          }
        }

        // ------------------------------------------------------
        // CASE 2: No valid access token
        //
        // Try the HttpOnly refresh cookie.
        // ------------------------------------------------------

        try {
          const response = await refreshApi.post('/auth/refresh');

          const newAccessToken = response.data?.access_token;

          if (!newAccessToken) {
            throw new Error('Refresh response did not contain access token');
          }

          localStorage.setItem('access_token', newAccessToken);

          // ----------------------------------------------------
          // Session successfully restored
          // ----------------------------------------------------

          const hasContext = await refreshLocationFromContext();

          if (!mounted) return;

          if (locationRouter.pathname === '/') {
            navigate(hasContext ? '/home' : '/location', { replace: true });
          }

          return;
        } catch (error: any) {
          // ----------------------------------------------------
          // No refresh session.
          //
          // This is NORMAL for a new/unauthenticated user.
          // Do not show an error.
          // Do not mark the application offline.
          // ----------------------------------------------------

          if (error?.code === 'ERR_NETWORK') {
            if (mounted) {
              setIsOffline(true);
            }

            return;
          }

          // 401 from /auth/refresh simply means:
          // user is not logged in.

          localStorage.removeItem('access_token');

          // Do NOT redirect here.
          //
          // Let the existing router show:
          // /onboarding
          // /login
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================
     ROUTE EFFECTS
  ======================= */

  useEffect(() => {
    if (locationRouter.pathname === '/home') {
      loadCart();
    }
  }, [locationRouter.pathname]);

  useEffect(() => {
    if (
      (locationRouter.pathname === '/schedule' ||
        locationRouter.pathname === '/payment') &&
      !orderDetails
    ) {
      navigate('/cart');
    }
  }, [locationRouter.pathname, orderDetails]);

  useEffect(() => {
    if (locationRouter.pathname !== '/orders') return;

    let isMounted = true;
    let interval: number | undefined;

    // ============================================================
    // MERGE ORDERS BY ID
    // ============================================================

    const mergeOrdersById = (
      currentOrders: Order[],
      incomingOrders: Order[],
    ): Order[] => {
      const orderMap = new Map<string, Order>();

      currentOrders.forEach((order: Order) => {
        orderMap.set(String(order.id), order);
      });

      incomingOrders.forEach((order: Order) => {
        orderMap.set(String(order.id), order);
      });

      return Array.from(orderMap.values());
    };

    // ============================================================
    // LOAD COMPLETE ORDER HISTORY
    // ============================================================

    const loadHistoryOnce = async () => {
      try {
        const history = await getMyOrdersApi();

        if (!isMounted) return;

        const mappedHistory: Order[] = history.map(
          (order: any): Order => mapBackendOrder(order),
        );

        // Remove duplicate order IDs from backend response
        const uniqueHistory = Array.from(
          new Map(
            mappedHistory.map((order) => [String(order.id), order]),
          ).values(),
        );

        setOrders(uniqueHistory);
      } catch (err) {
        console.error('Failed to load order history', err);
      }
    };

    // ============================================================
    // LOAD ACTIVE ORDERS
    // ============================================================

    const pollActiveOnly = async () => {
      try {
        const active = await getMyActiveOrdersApi();

        if (!isMounted) return;

        const mappedActive: Order[] = active.map(
          (order: any): Order => mapBackendOrder(order),
        );

        setOrders((prev) => mergeOrdersById(prev, mappedActive));
      } catch (err) {
        console.error('Active polling failed', err);
      }
    };

    // ============================================================
    // POLLING
    // ============================================================

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

    // ============================================================
    // TAB / APP VISIBILITY
    // ============================================================

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pollActiveOnly();
        startPolling();
      } else {
        stopPolling();
      }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    const initializeOrders = async () => {
      await loadHistoryOnce();

      if (!isMounted) return;

      // Get latest status for active orders
      await pollActiveOnly();

      if (!isMounted) return;

      // Start live status polling
      startPolling();
    };

    initializeOrders();

    document.addEventListener('visibilitychange', handleVisibility);

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {
      isMounted = false;

      stopPolling();

      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [locationRouter.pathname]);

  useEffect(() => {
    const handleOnline = () => {
      useToastStore.getState().showError('Back online ✅');
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  /* =======================
     ORDER HANDLERS
  ======================= */

  const handleUpdateOrder = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setOrderToEdit(null);
    setIsEditingOrder(false);
    setCart([]);
    navigate('/orders');
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
     UI - Sticky Mobile View (App Doesn't Move)
  ======================= */

  return (
    <div className="fixed inset-0 w-full h-full bg-[#e5d1bc] flex justify-center items-center overflow-hidden">
      <div className="relative bg-[#F3DDCA] overflow-hidden w-full h-full max-w-full sm:max-w-[390px] sm:max-h-[844px] sm:rounded-[2rem] sm:shadow-2xl sm:border-0.5 sm:border-slate-800">
        {/* Scrollable Content */}
        <div className="w-full h-full bg-[#F3DDCA] overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />

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

            <Route path="/payment/status" element={<PaymentStatusScreen />} />

            <Route path="/payment-failed" element={<PaymentFailedScreen />} />

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
            <Route path="/support/tickets" element={<TicketsScreen />} />
            <Route path="/support/tickets/:ticketId" element={<TicketDetail />} />

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
    </div>
  );
};

export default App;