import React, { useState, useEffect, useRef } from 'react';
import { AuthPage } from './pages/Authpage';
import { Dashboard } from './pages/Dashbord';
import { IntroSplashPage } from './components/IntroSplashPage';
import { VendorProvider } from './context/VendorContext';
import { VendorOrdersApi } from './apis/vendorOrders';
import { getStaffMe } from './apis/auth';

// =========================================================
// APP SCREENS
// =========================================================

enum AppScreen {
  IntroSplash1,
  IntroSplash2,
  IntroSplash3,
  BrandSplash,
  AuthOrDashboard,
}

// =========================================================
// SPLASH CONFIG
// =========================================================

const SPLASH_PAGE_CONFIGS = [
  {
    backgroundImage: '../../assets/food items/chikentikka.jpg',
    title: 'Savor Every Flavor',
    subtitle:
      'From gourmet meals to everyday delights, bring your culinary masterpieces to hungry customers.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
  {
    backgroundImage: '../../assets/food items/cofeee.jpg',
    title: 'Growing Success Together',
    subtitle:
      'Capture the essence of corporate dining with seamless food solutions.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
  {
    backgroundImage: '../../assets/food items/muton.jpg',
    title: 'Seamless Management, Delighted Customers',
    subtitle:
      'OFFO Vendor: Your partner in streamlined operations and growth.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
];

// =========================================================
// BRAND SPLASH
// =========================================================

const BrandSplashScreen: React.FC = () => {
  const brandName = 'OFFO.';

  return (
    <div className="min-h-screen flex justify-center items-center bg-offo-tan-light">
      <div className="animate-fadeIn">
        <h1 className="text-8xl font-bold text-offo-orange tracking-wider flex">
          {brandName.split('').map((letter, index) => (
            <span
              key={index}
              className="opacity-0 animate-popIn"
              style={{
                animationDelay: `${100 + index * 150}ms`,
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
};

// =========================================================
// APP
// =========================================================

const App: React.FC = () => {
  // =======================================================
  // ALERT TRACKING
  // =======================================================

  const previousAlertRef = useRef<{
    latestOrderId: string | null;
    latestHighId: string | null;
    totalActive: number;
  }>({
    latestOrderId: null,
    latestHighId: null,
    totalActive: 0,
  });

  const hasCompletedInitialAlertPollRef = useRef(false);

  // =======================================================
  // AUDIO REFERENCES
  // =======================================================

  const normalAudio = useRef<HTMLAudioElement | null>(null);
  const highAudio = useRef<HTMLAudioElement | null>(null);

  // =======================================================
  // SESSION
  // =======================================================

  const hasStoredSession = !!localStorage.getItem('access_token');

  const [currentAppScreen, setCurrentAppScreen] =
    useState<AppScreen>(
      hasStoredSession
        ? AppScreen.AuthOrDashboard
        : AppScreen.IntroSplash1,
    );

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [authChecking, setAuthChecking] =
    useState(hasStoredSession);

  // =======================================================
  // RESTORE SESSION
  // =======================================================

  useEffect(() => {
    if (!hasStoredSession) {
      setAuthChecking(false);
      return;
    }

    let mounted = true;

    const restoreSession = async () => {
      try {
        await getStaffMe();

        if (mounted) {
          setIsAuthenticated(true);
          setCurrentAppScreen(
            AppScreen.AuthOrDashboard,
          );
        }
      } catch (error) {
        if (mounted) {
          setIsAuthenticated(false);
          setCurrentAppScreen(
            AppScreen.AuthOrDashboard,
          );
        }
      } finally {
        if (mounted) {
          setAuthChecking(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [hasStoredSession]);

  // =======================================================
  // SPLASH SCREEN
  // =======================================================

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const SPLASH_DURATION = 3000;

    const advanceScreen = () => {
      setCurrentAppScreen((prevScreen) => {
        switch (prevScreen) {
          case AppScreen.IntroSplash1:
            return AppScreen.IntroSplash2;

          case AppScreen.IntroSplash2:
            return AppScreen.IntroSplash3;

          case AppScreen.IntroSplash3:
            return AppScreen.BrandSplash;

          case AppScreen.BrandSplash:
            return AppScreen.AuthOrDashboard;

          default:
            return prevScreen;
        }
      });
    };

    if (
      currentAppScreen !==
      AppScreen.AuthOrDashboard
    ) {
      timer = setTimeout(
        advanceScreen,
        SPLASH_DURATION,
      );
    }

    return () => {
      clearTimeout(timer);
    };
  }, [currentAppScreen]);

  // =======================================================
  // INITIALIZE AUDIO
  // =======================================================

  useEffect(() => {
    const normal = new Audio(
      '/assets/sounds/New-Order.mp3',
    );

    const high = new Audio(
      '/assets/sounds/high-priority.mp3',
    );

    normal.preload = 'auto';
    high.preload = 'auto';

    normal.volume = 1.0;
    high.volume = 1.0;

    normalAudio.current = normal;
    highAudio.current = high;

    // -------------------------------------------------------
    // Browser audio unlock
    // -------------------------------------------------------

    const unlockAudio = async () => {
      try {
        // Unlock normal audio
        normal.muted = true;
        await normal.play();
        normal.pause();
        normal.currentTime = 0;
        normal.muted = false;

        // Unlock high priority audio
        high.muted = true;
        await high.play();
        high.pause();
        high.currentTime = 0;
        high.muted = false;

        console.log(
          '🔊 OFFO notification audio unlocked',
        );

        window.removeEventListener(
          'click',
          unlockAudio,
        );
      } catch (error) {
        console.error(
          '🔇 Audio unlock failed:',
          error,
        );
      }
    };

    window.addEventListener(
      'click',
      unlockAudio,
    );

    return () => {
      window.removeEventListener(
        'click',
        unlockAudio,
      );

      normal.pause();
      high.pause();

      normalAudio.current = null;
      highAudio.current = null;
    };
  }, []);

  // =======================================================
  // ORDER ALERT POLLING
  // =======================================================

  useEffect(() => {
    if (
      !isAuthenticated ||
      currentAppScreen !==
        AppScreen.AuthOrDashboard
    ) {
      return;
    }

    // -------------------------------------------------------
    // IMPORTANT:
    // Do NOT reset hasCompletedInitialAlertPollRef here.
    // -------------------------------------------------------

    const poll = async () => {
      try {
        const data =
          await VendorOrdersApi.getAlerts();

        console.log(
          '🔔 ALERT RESPONSE:',
          data,
        );

        const {
          latest_order_id,
          latest_high_priority_id,
          total_active_orders,
        } = data;

        const previous =
          previousAlertRef.current;

        const isFirstPoll =
          !hasCompletedInitialAlertPollRef.current;

        // ---------------------------------------------------
        // NEW ORDER DETECTION
        // ---------------------------------------------------

        const hasNewOrder =
          !isFirstPoll &&
          latest_order_id !== null &&
          String(latest_order_id) !==
            String(previous.latestOrderId);

        // ---------------------------------------------------
        // HIGH PRIORITY DETECTION
        // ---------------------------------------------------

        const hasNewHigh =
          !isFirstPoll &&
          latest_high_priority_id !== null &&
          String(latest_high_priority_id) !==
            String(previous.latestHighId);

        console.log(
          '🔔 ALERT STATE:',
          {
            isFirstPoll,
            previous,
            latest_order_id,
            latest_high_priority_id,
            total_active_orders,
            hasNewOrder,
            hasNewHigh,
          },
        );

        // ===================================================
        // SOUND LOGIC
        // ===================================================

        if (
          !isFirstPoll &&
          hasNewOrder
        ) {
          // -------------------------------------------------
          // HIGH PRIORITY
          // -------------------------------------------------

          if (hasNewHigh) {
            console.log(
              '🚨 NEW HIGH PRIORITY ORDER → HIGH SOUND',
            );

            const audio =
              highAudio.current;

            if (audio) {
              audio.currentTime = 0;

              audio
                .play()
                .then(() => {
                  console.log(
                    '🔊 HIGH PRIORITY SOUND PLAYING',
                  );
                })
                .catch((error) => {
                  console.error(
                    '🔇 HIGH PRIORITY SOUND FAILED:',
                    error,
                  );
                });
            }

            window.dispatchEvent(
              new CustomEvent(
                'high-priority-order',
                {
                  detail: {
                    orderId:
                      latest_order_id,
                  },
                },
              ),
            );
          }

          // -------------------------------------------------
          // LOW / NORMAL
          // -------------------------------------------------

          else {
            console.log(
              '🔊 NEW LOW/NORMAL ORDER → NORMAL SOUND',
            );

            const audio =
              normalAudio.current;

            if (audio) {
              audio.currentTime = 0;

              audio
                .play()
                .then(() => {
                  console.log(
                    '🔊 NORMAL ORDER SOUND PLAYING',
                  );
                })
                .catch((error) => {
                  console.error(
                    '🔇 NORMAL ORDER SOUND FAILED:',
                    error,
                  );
                });
            }
          }
        }

        // ===================================================
        // SAVE CURRENT ALERT STATE
        // ===================================================

        previousAlertRef.current = {
          latestOrderId:
            latest_order_id !== null
              ? String(latest_order_id)
              : null,

          latestHighId:
            latest_high_priority_id !== null
              ? String(
                  latest_high_priority_id,
                )
              : null,

          totalActive:
            total_active_orders,
        };

        // ---------------------------------------------------
        // Initial poll is now complete.
        // ---------------------------------------------------

        hasCompletedInitialAlertPollRef.current =
          true;
      } catch (error) {
        console.error(
          '❌ Alert polling failed:',
          error,
        );
      }
    };

    // -------------------------------------------------------
    // Initial poll
    // -------------------------------------------------------

    poll();

    // -------------------------------------------------------
    // Poll every 15 seconds
    // -------------------------------------------------------

    const interval =
      setInterval(poll, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [
    isAuthenticated,
    currentAppScreen,
  ]);

  // =======================================================
  // LOGIN SUCCESS
  // =======================================================

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);

    setCurrentAppScreen(
      AppScreen.AuthOrDashboard,
    );

    // Start a fresh alert baseline after login.
    previousAlertRef.current = {
      latestOrderId: null,
      latestHighId: null,
      totalActive: 0,
    };

    hasCompletedInitialAlertPollRef.current =
      false;
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = () => {
    setIsAuthenticated(false);

    setCurrentAppScreen(
      AppScreen.AuthOrDashboard,
    );

    previousAlertRef.current = {
      latestOrderId: null,
      latestHighId: null,
      totalActive: 0,
    };

    hasCompletedInitialAlertPollRef.current =
      false;
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <VendorProvider>
      {currentAppScreen ===
        AppScreen.IntroSplash1 && (
        <IntroSplashPage
          key="intro1"
          {...SPLASH_PAGE_CONFIGS[0]}
        />
      )}

      {currentAppScreen ===
        AppScreen.IntroSplash2 && (
        <IntroSplashPage
          key="intro2"
          {...SPLASH_PAGE_CONFIGS[1]}
        />
      )}

      {currentAppScreen ===
        AppScreen.IntroSplash3 && (
        <IntroSplashPage
          key="intro3"
          {...SPLASH_PAGE_CONFIGS[2]}
        />
      )}

      {currentAppScreen ===
        AppScreen.BrandSplash && (
        <BrandSplashScreen />
      )}

      {currentAppScreen ===
        AppScreen.AuthOrDashboard &&
        (authChecking ? (
          <div className="min-h-screen flex justify-center items-center bg-offo-tan-light">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-offo-orange">
                OFFO.
              </h1>

              <p className="mt-3 text-text-secondary">
                Restoring session...
              </p>
            </div>
          </div>
        ) : isAuthenticated ? (
          <Dashboard
            onLogout={handleLogout}
          />
        ) : (
          <AuthPage
            onLoginSuccess={
              handleLoginSuccess
            }
          />
        ))}
    </VendorProvider>
  );
};

export default App;