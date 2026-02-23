import { RefObject, useEffect, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  once?: boolean;
}

export function useIntersectionObserver(
  ref: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const { once = true, threshold = 0.1, ...observerOptions } = options;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (once) {
          observer.disconnect();
        }
      } else if (!once) {
        setIsVisible(false);
      }
    }, {
      threshold,
      ...observerOptions,
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, once, threshold, observerOptions]);

  return isVisible;
}
