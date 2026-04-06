/**
 * Skeleton Components
 *
 * Loading placeholder components with animated shimmer effect.
 * Provides visual feedback during content loading to improve perceived performance
 * and reduce cumulative layout shift (CLS).
 *
 * Accessibility (WCAG AAA):
 * - Respects prefers-reduced-motion media query (Section 7: Motion & Cognitive)
 * - Uses aria-hidden="true" as content is decorative (Section 7: Screen Readers & ARIA)
 * - Parent containers should use aria-busy="true" and aria-live for dynamic updates
 * - All skeleton elements have aria-hidden to prevent screen reader announcements
 * - Functional animations respect reduced motion preferences
 *
 * Design System:
 * - Uses semantic design tokens: bg-muted (loading state), bg-card (card backgrounds)
 * - Section 3: Design Tokens - Three-tier token system enforced
 * - Section 10: Loading States - Skeleton loaders recommended for initial loads
 *
 * Performance:
 * - Minimal DOM overhead (single elements per skeleton variant)
 * - CLS (Cumulative Layout Shift) prevention: skeleton dimensions match final content
 * - Respects animation budget via prefers-reduced-motion hook
 *
 * @module @nasnet/ui/primitives/skeleton
 * @see Section 10 - Loading States: Skeleton loaders displayed for initial loads
 * @see Section 7 - Accessibility: prefers-reduced-motion compliance
 * @see Section 3 - Design Tokens: Semantic token usage
 */

import * as React from 'react';

import { useReducedMotion } from '../hooks';
import { cn } from '../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: string;
  lineHeight?: number;
  gap?: number;
  animate?: boolean;
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showTitle?: boolean;
  showDescription?: boolean;
  showFooter?: boolean;
  contentHeight?: number;
  animate?: boolean;
}

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  animate?: boolean;
}

export interface SkeletonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  showTitle?: boolean;
  showLegend?: boolean;
  height?: number;
  type?: 'bar' | 'line' | 'pie' | 'area';
  animate?: boolean;
}

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  animate?: boolean;
}

const Skeleton = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, animate = true, ...props }, ref) => {
      const prefersReducedMotion = useReducedMotion();
      const shouldAnimate = animate && !prefersReducedMotion;

      return (
        <div
          ref={ref}
          className={cn(
            'bg-muted rounded-[var(--semantic-radius-input)]',
            shouldAnimate && 'animate-pulse',
            className
          )}
          aria-hidden="true"
          {...props}
        />
      );
    }
  )
);
Skeleton.displayName = 'Skeleton';

const SkeletonText = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonTextProps>(
    (
      {
        className,
        lines = 3,
        lastLineWidth = '60%',
        lineHeight = 16,
        gap = 8,
        animate = true,
        ...props
      },
      ref
    ) => {
      const prefersReducedMotion = useReducedMotion();
      const shouldAnimate = animate && !prefersReducedMotion;

      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          role="presentation"
          aria-hidden="true"
          style={{ gap }}
          {...props}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'bg-muted rounded-[var(--semantic-radius-input)]',
                shouldAnimate && 'animate-pulse'
              )}
              style={{
                height: lineHeight,
                width: index === lines - 1 ? lastLineWidth : '100%',
              }}
            />
          ))}
        </div>
      );
    }
  )
);
SkeletonText.displayName = 'SkeletonText';

const SkeletonCard = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonCardProps>(
    (
      {
        className,
        showTitle = true,
        showDescription = false,
        showFooter = false,
        contentHeight = 120,
        animate = true,
        ...props
      },
      ref
    ) => {
      const prefersReducedMotion = useReducedMotion();
      const shouldAnimate = animate && !prefersReducedMotion;
      const baseClass = cn(
        'bg-muted rounded-[var(--semantic-radius-input)]',
        shouldAnimate && 'animate-pulse'
      );

      return (
        <div
          ref={ref}
          className={cn(
            'border-border bg-card space-y-4 rounded-[var(--semantic-radius-card)] border p-4',
            className
          )}
          role="presentation"
          aria-hidden="true"
          {...props}
        >
          {(showTitle || showDescription) && (
            <div className="space-y-2">
              {showTitle && <div className={cn(baseClass, 'h-5 w-1/2')} />}
              {showDescription && <div className={cn(baseClass, 'h-4 w-3/4')} />}
            </div>
          )}

          <div
            className={cn(baseClass, 'w-full')}
            style={{ height: contentHeight }}
          />

          {showFooter && (
            <div className="flex gap-2 pt-2">
              <div className={cn(baseClass, 'h-9 w-20')} />
              <div className={cn(baseClass, 'h-9 w-20')} />
            </div>
          )}
        </div>
      );
    }
  )
);
SkeletonCard.displayName = 'SkeletonCard';

const SkeletonTable = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonTableProps>(
    ({ className, rows = 5, columns = 4, showHeader = true, animate = true, ...props }, ref) => {
      const prefersReducedMotion = useReducedMotion();
      const shouldAnimate = animate && !prefersReducedMotion;
      const baseClass = cn(
        'bg-muted rounded-[var(--semantic-radius-input)]',
        shouldAnimate && 'animate-pulse'
      );

      return (
        <div
          ref={ref}
          className={cn('w-full', className)}
          role="presentation"
          aria-hidden="true"
          {...props}
        >
          {showHeader && (
            <div className="border-border flex gap-4 border-b pb-3">
              {Array.from({ length: columns }).map((_, i) => (
                <div
                  key={i}
                  className={cn(baseClass, 'h-4 flex-1')}
                />
              ))}
            </div>
          )}

          <div className="divide-border divide-y">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex gap-4 py-3"
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={cn(baseClass, 'h-4 flex-1')}
                    style={{
                      maxWidth: colIndex === 0 ? '40%' : undefined,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
  )
);
SkeletonTable.displayName = 'SkeletonTable';

const SkeletonChart = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonChartProps>(
    (
      {
        className,
        showTitle = false,
        showLegend = false,
        height = 200,
        type: _type = 'bar',
        animate = true,
        ...props
      },
      ref
    ) => {
      const prefersReducedMotion = useReducedMotion();
      const shouldAnimate = animate && !prefersReducedMotion;
      const baseClass = cn(
        'bg-muted rounded-[var(--semantic-radius-card)]',
        shouldAnimate && 'animate-pulse'
      );

      return (
        <div
          ref={ref}
          className={cn('space-y-4', className)}
          role="presentation"
          aria-hidden="true"
          {...props}
        >
          {showTitle && <div className={cn(baseClass, 'h-5 w-1/3')} />}

          <div
            className={cn(baseClass, 'w-full')}
            style={{ height }}
          />

          {showLegend && (
            <div className="flex justify-center gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2"
                >
                  <div className={cn(baseClass, 'h-3 w-3 rounded-full')} />
                  <div className={cn(baseClass, 'h-3 w-16')} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  )
);
SkeletonChart.displayName = 'SkeletonChart';

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
} as const;

const SkeletonAvatar = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
    ({ className, size = 'md', shape = 'circle', animate = true, ...props }, ref) => {
      const prefersReducedMotion = useReducedMotion();
      const shouldAnimate = animate && !prefersReducedMotion;

      return (
        <div
          ref={ref}
          className={cn(
            'bg-muted',
            avatarSizes[size],
            shape === 'circle' ? 'rounded-full' : 'rounded-[var(--semantic-radius-input)]',
            shouldAnimate && 'animate-pulse',
            className
          )}
          aria-hidden="true"
          {...props}
        />
      );
    }
  )
);
SkeletonAvatar.displayName = 'SkeletonAvatar';

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonChart, SkeletonAvatar };
