import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/Authpage';
import { Dashboard } from './pages/Dashbord';
import { IntroSplashPage } from './components/IntroSplashPage';
import { VendorProvider } from './context/VendorContext';

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
    backgroundImage: '../../assets/food items/chickentikka.jpg', // Example: Butter Chicken (from data.ts)
    title: 'Savor Every Flavor',
    subtitle: 'From gourmet meals to everyday delights, bring your culinary masterpieces to hungry customers.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
  {
    backgroundImage: '../../assets/food items/coffeee.jpg', // Example: Coffee (from data.ts)
    title: 'Brewing Success Together',
    subtitle: 'Offer delightful experiences and capture the essence of your cafe.',
    backgroundColorClass: 'bg-dark-navy',
    textColorClass: 'text-white',
  },
  {
    backgroundImage: '../../assets/food items/mutton.jpg', // Example: Samosa (from data.ts)
    title: 'Seamless Management, Delighted Customers',
    subtitle: 'OFFO Vendor: Your partner in streamlined operations and growth.',
    backgroundColorClass: 'bg-offo-orange',
    textColorClass: 'text-white',
  },
];

// Extracted and renamed original SplashScreen for clarity
const BrandSplashScreen: React.FC = () => {
  const brandName = "OFFO";
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

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentAppScreen(AppScreen.AuthOrDashboard);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAppScreen(AppScreen.AuthOrDashboard);
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
