import React, { useState, useEffect ,useRef} from 'react';
import { AuthPage } from './pages/Authpage';
import { Dashboard } from './pages/Dashbord';
import { IntroSplashPage } from './components/IntroSplashPage';
import { VendorProvider } from './context/VendorContext';
import { VendorOrdersApi } from './apis/vendorOrders';

// Define the screens as an enum for clear state management
enum AppScreen {
  IntroSplash1,
  IntroSplash2,
  IntroSplash3,
  BrandSplash, // Original OFFO splash screen
  AuthOrDashboard, // The main application flow
}

const SPLASH_PAGE_CONFIGS = [
  {
    backgroundImage: '../../assets/food items/chikentikka.jpg', // Example: Butter Chicken (from data.ts)
    title: 'Savor Every Flavor',
    subtitle: 'From gourmet meals to everyday delights, bring your culinary masterpieces to hungry customers.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
  {
    backgroundImage: '../../assets/food items/cofeee.jpg', // Example: Coffee (from data.ts)
    title: 'Growing Success Together',
    subtitle: 'Capture the essence of corporate dining with seamless food solutions.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
  {
    backgroundImage: '../../assets/food items/muton.jpg', // Example: Samosa (from data.ts)
    title: 'Seamless Management, Delighted Customers',
    subtitle: 'OFFO Vendor: Your partner in streamlined operations and growth.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
];

// Extracted and renamed original SplashScreen for clarity
const BrandSplashScreen: React.FC = () => {
  const brandName = "OFFO.";
  return (
    <div className="min-h-screen flex justify-center items-center bg-offo-tan-light">
      <div className="animate-fadeIn">
        <h1 className="text-8xl font-bold text-offo-orange tracking-wider flex">
          {brandName.split('').map((letter, index) => (
            <span
              key={index}
              className="opacity-0 animate-popIn"
              style={{ animationDelay: `${100 + index * 150}ms` }}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
};


const App: React.FC = () => {

  // 🔔 Global Alert Tracking
  const previousAlertRef = useRef<{
    latestOrderId: string | null;
    latestHighId: string | null;
    totalActive: number;
  }>({
    latestOrderId: null,
    latestHighId: null,
    totalActive: 0,
  });

  const normalAudio = useRef<HTMLAudioElement | null>(null);
  const highAudio = useRef<HTMLAudioElement | null>(null);

  const [currentAppScreen, setCurrentAppScreen] = useState<AppScreen>(AppScreen.IntroSplash1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const SPLASH_DURATION = 3000;

    const advanceScreen = () => {
      setCurrentAppScreen(prevScreen => {
        switch (prevScreen) {
          case AppScreen.IntroSplash1: return AppScreen.IntroSplash2;
          case AppScreen.IntroSplash2: return AppScreen.IntroSplash3;
          case AppScreen.IntroSplash3: return AppScreen.BrandSplash;
          case AppScreen.BrandSplash: return AppScreen.AuthOrDashboard;
          default: return prevScreen;
        }
      });
    };

    if (currentAppScreen !== AppScreen.AuthOrDashboard) {
      timer = setTimeout(advanceScreen, SPLASH_DURATION);
    }

    return () => clearTimeout(timer);
  }, [currentAppScreen]);

  // 🔊 Initialize sounds once
  useEffect(() => {
    normalAudio.current = new Audio("/assets/sounds/new-order.mp3");
    highAudio.current = new Audio("/assets/sounds/high-priority.mp3");
  }, []);

  // 🔔 Lightweight global alert polling
  useEffect(() => {

    // Only start polling when logged in and inside main app
    if (!isAuthenticated || currentAppScreen !== AppScreen.AuthOrDashboard) {
      return;
    }

    const poll = setInterval(async () => {
      try {
        const data = await VendorOrdersApi.getAlerts();

        const { latest_order_id, latest_high_priority_id , total_active_orders } = data;

        const isFirstPoll = 
        previousAlertRef.current.latestOrderId === null &&
        previousAlertRef.current.latestHighId === null;

        const hasNewHigh =
          latest_high_priority_id &&
          latest_high_priority_id !== previousAlertRef.current.latestHighId;

        const hasNewOrder =
          latest_order_id &&
          latest_order_id !== previousAlertRef.current.latestOrderId;

        const activeCountIncreased = total_active_orders > previousAlertRef.current.totalActive


        if (!isFirstPoll) {
          if (hasNewHigh) {
            if (highAudio.current){
              highAudio.current.currentTime = 0;
              highAudio.current.play().catch(() => {});
            }  
            
            //dispatch global priority event
            window.dispatchEvent(
              new CustomEvent("high-priority-order", {
                detail: { orderId: latest_high_priority_id }
              })
            )
          }
          else if (hasNewOrder || activeCountIncreased) {
            if (normalAudio.current){
              normalAudio.current.currentTime = 0;
              normalAudio.current.play().catch(() => {});
            }
          }
        }

        previousAlertRef.current = {
          latestOrderId: latest_order_id,
          latestHighId: latest_high_priority_id,
          totalActive: total_active_orders,
        };

      } catch (err) {
        console.error("Alert polling failed", err);
      }
    }, 15000);

    return () => clearInterval(poll);

  }, [isAuthenticated, currentAppScreen]);


  useEffect(() => {
    const unlockAudio = () => {
      normalAudio.current?.play().then(() => {
        normalAudio.current?.pause();
        normalAudio.current!.currentTime = 0;
      }).catch(() => {});
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);

    return () => window.removeEventListener("click", unlockAudio);
  }, []);


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentAppScreen(AppScreen.AuthOrDashboard);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAppScreen(AppScreen.AuthOrDashboard);

    //reset alert memory

    previousAlertRef.current = {
      latestOrderId: null,
      latestHighId: null,
      totalActive: 0,
    };
  };

  return (
    <VendorProvider>
      {currentAppScreen === AppScreen.IntroSplash1 && (
        <IntroSplashPage key="intro1" {...SPLASH_PAGE_CONFIGS[0]} />
      )}

      {currentAppScreen === AppScreen.IntroSplash2 && (
        <IntroSplashPage key="intro2" {...SPLASH_PAGE_CONFIGS[1]} />
      )}

      {currentAppScreen === AppScreen.IntroSplash3 && (
        <IntroSplashPage key="intro3" {...SPLASH_PAGE_CONFIGS[2]} />
      )}

      {currentAppScreen === AppScreen.BrandSplash && (
        <BrandSplashScreen />
      )}

      {currentAppScreen === AppScreen.AuthOrDashboard && (
        !isAuthenticated
          ? <AuthPage onLoginSuccess={handleLoginSuccess} />
          : <Dashboard onLogout={handleLogout} />
      )}
    </VendorProvider>
  );
};

export default App;
