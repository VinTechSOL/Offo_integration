import React, { useState, useRef, useEffect } from 'react';

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({ children, className }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState({ height: 0, top: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const calculateThumb = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const scrollable = scrollHeight > clientHeight;
      if (scrollable) {
        const height = (clientHeight / scrollHeight) * 100;
        const top = (scrollTop / scrollHeight) * 100;
        setThumbStyle({ height, top });
      } else {
        setThumbStyle({ height: 0, top: 0 });
      }
    }
  };

  const handleScroll = () => {
    calculateThumb();
    setIsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsVisible(false), 1500);
  };

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    // Call calculateThumb after a delay to ensure DOM is ready
    const initialCheck = setTimeout(calculateThumb, 50);

    const resizeObserver = new ResizeObserver(calculateThumb);
    resizeObserver.observe(element);
    
    // Also observe children for content changes
    const mutationObserver = new MutationObserver(calculateThumb);
    mutationObserver.observe(element, { childList: true, subtree: true });

    return () => {
      clearTimeout(initialCheck);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [children]);

  return (
    <div className="relative flex-grow overflow-hidden">
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className={`h-full overflow-y-auto no-scrollbar ${className || ''}`}
      >
        {children}
      </div>
      {thumbStyle.height > 0 && thumbStyle.height < 100 && (
        <div className="absolute top-0 right-1 w-1.5 h-full pointer-events-none">
          <div
            className={`absolute w-full bg-orange-400 rounded-full transition-opacity duration-300 ${isVisible ? 'opacity-75' : 'opacity-0'}`}
            style={{
              height: `${thumbStyle.height}%`,
              top: `${thumbStyle.top}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ScrollableContainer;
