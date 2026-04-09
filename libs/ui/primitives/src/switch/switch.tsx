import * as React from 'react';

import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '../lib/utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the Switch component
 *
 * @interface SwitchProps
 * @extends {React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>}
 * @property {string} [className] - Additional CSS classes to apply
 */
export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  /** Additional CSS classes to apply */
  className?: string;
}

// ============================================================================
// Switch Component
// ============================================================================

/**
 * Switch Component
 *
 * A toggle switch for boolean input. Built on Radix UI Switch.
 * Uses semantic success color when checked, muted color when unchecked.
 * Supports disabled state with reduced opacity.
 *
 * Accessibility:
 * - Full keyboard navigation (Tab, Space/Enter to toggle)
 * - Focus visible indicator with ring
 * - Screen reader support via Radix UI
 * - Respects disabled state
 *
 * @example
 * ```tsx
 * // Basic toggle
 * <Switch />
 *
 * // With initial state
 * <Switch defaultChecked />
 *
 * // Disabled
 * <Switch disabled />
 *
 * // With change handler
 * <Switch onCheckedChange={(checked) => console.log(checked)} />
 * ```
 *
 * @see https://radix-ui.com/docs/primitives/components/switch
 */
const Switch = React.memo(
  React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
    ({ className, ...props }, ref) => (
      <SwitchPrimitives.Root
        className={cn(
          'focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-success data-[state=unchecked]:bg-input peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        />
      </SwitchPrimitives.Root>
    )
  )
);

Switch.displayName = 'Switch';

export { Switch };
