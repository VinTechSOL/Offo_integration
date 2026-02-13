import React from 'react';

interface IntroSplashPageProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  backgroundColorClass?: string;
  textColorClass?: string;
}

export const IntroSplashPage: React.FC<IntroSplashPageProps> = ({
  backgroundImage,
  title,
  subtitle,
  backgroundColorClass = 'bg-dark-navy',
  textColorClass = 'text-white',
}) => {
  return (
    <div
      className={`relative h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden ${backgroundColorClass}`}
    >
      <img
        src={backgroundImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-60" // Reduced opacity for text readability
      />
      {/* Subtle gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/70 via-transparent to-dark-navy/70"></div> 
      <div className="relative z-10 text-center animate-fadeIn">
        <h2 className={`text-4xl sm:text-6xl font-bold mb-4 ${textColorClass} drop-shadow-lg`}>{title}</h2>
        <p className={`text-lg sm:text-xl ${textColorClass} opacity-90 drop-shadow-md`}>{subtitle}</p>
      </div>
    </div>
  );
};