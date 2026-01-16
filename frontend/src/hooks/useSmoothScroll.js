import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false, // Disable on mobile for better performance
    });

    let requestHandle;
    function raf(time) {
      lenis.raf(time);
      requestHandle = requestAnimationFrame(raf);
    }

    requestHandle = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(requestHandle);
      lenis.destroy();
    };
  }, []);
}
