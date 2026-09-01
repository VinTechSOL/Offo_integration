import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col h-screen w-screen min-h-[100dvh] items-center justify-center bg-[#F3DDCA] overflow-hidden overscroll-none touch-none select-none">
      {/* Background gradient split */}
      <div className="absolute top-0 right-0 w-[45%] h-full bg-[#EBD6C3] skew-x-[-10deg] transform translate-x-32 z-0 hidden lg:block pointer-events-none"></div>
      
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#E66A00]/5 rounded-full blur-3xl hidden md:block pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#E66A00]/5 rounded-full blur-3xl hidden md:block pointer-events-none"></div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        {/* OFFO Logo */}
        <div className="flex items-center gap-1">
          <span className="text-7xl md:text-8xl lg:text-9xl font-black text-[#E66A00] animate-in fade-in slide-in-from-left duration-700">O</span>
          <span className="text-7xl md:text-8xl lg:text-9xl font-black text-[#2D1E12] animate-in fade-in slide-in-from-bottom duration-700 delay-100">FF</span>
          <span className="text-7xl md:text-8xl lg:text-9xl font-black text-[#E66A00] animate-in fade-in slide-in-from-right duration-700 delay-200">O</span>
        </div>
        
        {/* Tagline */}
        <div className="border-l-[4px] border-[#E66A00] pl-4 md:pl-6 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <p className="text-[#2D1E12] text-base md:text-lg lg:text-xl font-bold tracking-[0.3em] uppercase opacity-80">
            Order Food From Office.
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2 mt-8 animate-in fade-in duration-700 delay-500">
          <div className="w-3 h-3 rounded-full bg-[#E66A00] animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 rounded-full bg-[#E66A00] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 rounded-full bg-[#E66A00] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-[#E66A00] text-white font-black px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[11px] uppercase tracking-[0.2em] shadow-lg animate-in fade-in slide-in-from-bottom duration-700 delay-700">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white animate-pulse"></span>
          Loading...
        </div>
      </div>

      {/* Version/Footer */}
      <div className="absolute bottom-12 text-[#2D1E12]/30 text-xs font-bold tracking-[0.2em] uppercase animate-in fade-in duration-1000 delay-700">
        v1.0.0
      </div>
    </div>
  );
};

export default SplashScreen;