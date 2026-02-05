import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex flex-col h-full items-center justify-center bg-orange-500 animate-fade-in">
      <h1 className="text-6xl font-extrabold text-white tracking-widest animate-pulse">
        OFFO
      </h1>
      <p className="text-white text-lg mt-2 tracking-wide">
        Order Food From Office
      </p>
    </div>
  );
};

export default SplashScreen;