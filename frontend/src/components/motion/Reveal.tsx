import type React from 'react';
import { useInView } from '../../hooks/useAsync';
import { cn } from '../../utils/cn';

/**
 * Staggered entrance animation. Plays once when the element scrolls into view
 * and is skipped entirely when the user prefers reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 620,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'aside' | 'li' | 'article';
}) {
  const [ref, inView] = useInView<HTMLElement>();

  return (
    <Tag
      ref={ref as never}
      className={cn('nrk-reveal', inView && 'nrk-reveal--in', className)}
      style={
        {
          '--nrk-reveal-delay': `${delay}ms`,
          '--nrk-reveal-y': `${y}px`,
          '--nrk-reveal-duration': `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
