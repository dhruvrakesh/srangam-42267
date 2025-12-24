import { useState, useEffect, useRef } from 'react';

// easeOutQuart: fast start, smooth deceleration
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export interface CountUpResult {
  count: number;
  isComplete: boolean;
}

export function useCountUp(
  target: number,
  duration: number = 2000,
  start: boolean = false
): CountUpResult {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Only animate once when start becomes true
    if (!start || hasAnimatedRef.current || target === 0) {
      return;
    }

    hasAnimatedRef.current = true;
    startTimeRef.current = null;
    setIsComplete(false);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentCount = Math.round(easedProgress * target);

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target); // Ensure we end exactly on target
        setIsComplete(true);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration, start]);

  // Reset when target changes (but not during animation)
  useEffect(() => {
    if (!start) {
      setCount(0);
      setIsComplete(false);
      hasAnimatedRef.current = false;
    }
  }, [target, start]);

  return { count, isComplete };
}

// Helper to format numbers with locale separators
export function formatCountUp(value: number, suffix: string = ''): string {
  return `${value.toLocaleString()}${suffix}`;
}
