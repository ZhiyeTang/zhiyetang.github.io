import { useRef } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLDivElement>;
  className: string;
}

export function useScrollAnimation(): UseScrollAnimationReturn {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  const className = isVisible
    ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out'
    : 'opacity-0 translate-y-8';

  return { ref, className };
}
