import { useState, useEffect } from 'react';

/**
 * Hook to detect scroll direction and velocity across window and scrollable containers
 * Used for fluid mobile navigation (Uber/Apple style hide on scroll down, show on scroll up).
 */
export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = (e?: Event) => {
      const target = (e?.target as HTMLElement) || document.documentElement;
      const currentScrollY =
        target && 'scrollTop' in target && target.scrollTop !== undefined
          ? target.scrollTop
          : window.scrollY || 0;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY;

          // If at the very top, always show
          if (currentScrollY < 20) {
            setIsVisible(true);
          } else if (diff > 8) {
            // Scrolling down -> hide navbar smoothly
            setIsVisible(false);
          } else if (diff < -8) {
            // Scrolling up -> reveal navbar
            setIsVisible(true);
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  return isVisible;
}
