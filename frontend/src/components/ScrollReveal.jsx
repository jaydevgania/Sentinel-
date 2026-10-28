import React, { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal Hook
 * Returns ref and boolean `isRevealed` using IntersectionObserver.
 */
export function useScrollReveal({
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true
} = {}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isRevealed];
}

/**
 * ScrollReveal Component
 * Smooth hardware-accelerated scroll transition wrapper.
 * Props:
 * - animation: 'fade-up' | 'fade-in' | 'scale-up' | 'slide-left' | 'slide-right'
 * - delay: number (milliseconds)
 * - duration: number (milliseconds, default: 800)
 * - className: string
 * - children: ReactNode
 */
export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 800,
  threshold = 0.12,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const [ref, isRevealed] = useScrollReveal({ threshold });

  const getAnimationStyles = () => {
    const baseTransition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    switch (animation) {
      case 'fade-in':
        return {
          opacity: isRevealed ? 1 : 0,
          transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
          willChange: 'opacity'
        };
      case 'scale-up':
        return {
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'scale(1)' : 'scale(0.92)',
          transition: baseTransition,
          willChange: 'opacity, transform'
        };
      case 'slide-left':
        return {
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'translateX(0)' : 'translateX(-40px)',
          transition: baseTransition,
          willChange: 'opacity, transform'
        };
      case 'slide-right':
        return {
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'translateX(0)' : 'translateX(40px)',
          transition: baseTransition,
          willChange: 'opacity, transform'
        };
      case 'fade-up':
      default:
        return {
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'translateY(0)' : 'translateY(36px)',
          transition: baseTransition,
          willChange: 'opacity, transform'
        };
    }
  };

  return (
    <Component
      ref={ref}
      style={getAnimationStyles()}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
