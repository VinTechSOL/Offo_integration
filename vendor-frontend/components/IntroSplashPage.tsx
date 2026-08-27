import React from 'react';

interface IntroSplashPageProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  backgroundColorClass?: string;
  textColorClass?: string;
  showBrand?: boolean;
}

export const IntroSplashPage: React.FC<IntroSplashPageProps> = ({
  backgroundImage,
  title,
  subtitle,
  backgroundColorClass = 'bg-dark-navy',
  textColorClass = 'text-white',
  showBrand = true,
}) => {
  return (
    <div
      className={`relative h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden ${backgroundColorClass}`}
    >
      {/* Background Image */}
      <img
        src={backgroundImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      
      {/* Subtle gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/70 via-transparent to-dark-navy/70"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center animate-fadeIn">
        {/* OFFO Brand Logo with Dot - All Orange */}
        {showBrand && (
          <>
            <div className="flex items-center justify-center gap-1 mb-3">
              <span className="text-5xl sm:text-7xl font-black text-[#E66A00] drop-shadow-lg">O</span>
              <span className="text-5xl sm:text-7xl font-black text-[#E66A00] drop-shadow-lg">F</span>
              <span className="text-5xl sm:text-7xl font-black text-[#E66A00] drop-shadow-lg">F</span>
              <span className="text-5xl sm:text-7xl font-black text-[#E66A00] drop-shadow-lg">O</span>
              <span className="text-5xl sm:text-7xl font-black text-[#E66A00] drop-shadow-lg">.</span>
            </div>

            {/* Tagline
            <p className={`text-sm sm:text-base ${textColorClass} opacity-60 mb-6 drop-shadow-md tracking-[0.2em] uppercase`}>
              Order Food From Office.
            </p> */}
          </>
        )}

        {/* Title */}
        <h2 className={`text-3xl sm:text-5xl font-bold mb-4 ${textColorClass} drop-shadow-lg`}>
          {title}
        </h2>
        

      </div>
    </div>
  );
};