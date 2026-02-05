import React, { useState, useEffect, useRef } from 'react';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

const onboardingSteps = [
  {
    image: '../../assets/illustrations/17177.jpg',
    title: 'Order from your work place',
    description: 'Pre-book your lunch, save your time - we\'ll have it ready when you are.',
  },
  {
    image: '../../assets/illustrations/1236.jpg',
    title: 'No Queue, No hassles',
    description: 'Smart, fast, and fresh - your cafeteria just got an upgrade!',
  },
  {
    image: '../../assets/illustrations/flash6.jpg',
    title: 'Order from Anywhere',
    description: 'Get all your favorite meals in one place — Order ahead, skip the line!',
  }
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  const [step, setStep] = useState(0);
  const touchStartX = useRef(0);
  const autoSlideTimer = useRef<number | null>(null);

  const resetAutoSlide = () => {
    if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current);
    if (step < onboardingSteps.length - 1) {
      autoSlideTimer.current = window.setTimeout(() => {
        setStep(prevStep => prevStep + 1);
      }, 2500); // Auto-advance every 2.5 seconds
    }
  };

  useEffect(() => {
    resetAutoSlide();
    return () => {
      if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current);
    };
  }, [step]);


  const isFinalStep = step === onboardingSteps.length - 1;

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current); // Pause timer on touch
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) { // Swiped left
        handleNext();
    } else if (diff < -50) { // Swiped right
        handlePrev();
    } else {
        // Not a swipe, just a tap. Reset the timer.
        resetAutoSlide();
    }
    // `useEffect` will reset the timer on `step` change after a successful swipe.
  };


  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div 
        className="flex-grow flex flex-col items-center justify-center text-center overflow-y-auto no-scrollbar py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
         <div
          className="flex transition-transform duration-700 ease-in-out w-full"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {onboardingSteps.map((currentStep, index) => (
            <div key={index} className="w-full flex-shrink-0 px-8 flex flex-col items-center justify-center">
              {index === onboardingSteps.length - 1 ? (
                <>
                  <h2 className="text-5xl font-extrabold text-orange-500">OFFO</h2>
                  <p className="text-gray-500 text-lg mt-1 mb-6">Order Food From Office</p>
                  <img
                    src="../../assets/illustrations/flash1.jpg"
                    alt="Colleagues ordering food in an office"
                    className="w-full max-w-sm sm:max-w-md object-contain mb-8 max-h-60"
                  />
                </>
              ) : (
                <img
                  src={currentStep.image}
                  alt={currentStep.title}
                  className="w-full max-w-xs sm:max-w-sm h-60 object-cover rounded-lg mb-8"
                />
              )}
              <h1 className="text-xl font-bold text-gray-800 mb-2">{currentStep.title}</h1>
              <p className="text-gray-600 text-base px-4">{currentStep.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls and dots */}
      <div className="p-8 flex-shrink-0">
        <div className="flex justify-center items-center mb-6">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`h-2 w-2 rounded-full mx-1 transition-all duration-500 ease-in-out ${
                index === step ? 'bg-orange-500 w-6' : 'bg-orange-200'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {isFinalStep ? (
          <div className="animate-fade-in h-[52px] flex items-center">
            <button
              onClick={onGetStarted}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="h-[52px]">
            {/* Empty space to maintain layout consistency */}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
