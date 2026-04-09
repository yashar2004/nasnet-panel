/**
 * ThemeToggle Component
 *
 * Provides a button to cycle through three theme modes:
 * 1. Light (Sun icon)
 * 2. Dark (Moon icon)
 * 3. System (Monitor icon) - follows OS preference
 *
 * Features:
 * - Three-state toggle: Light → Dark → System → Light
 * - Displays appropriate icon for each mode
 * - Keyboard accessible with full keyboard support
 * - Screen reader friendly with descriptive aria-label
 * - Smooth icon rotation animation on hover
 * - Persistent state via Zustand store
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle className="ml-2" />
 * ```
 */

import { Moon, Sun } from 'lucide-react';

import { useThemeStore } from '@nasnet/state/stores';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  cn,
} from '@nasnet/ui/primitives';
import { memo } from 'react';

/**
 * Props for ThemeToggle component
 */
export interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle Component — shadcn/ui dropdown pattern
 */
function ThemeToggleComponent({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useThemeStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-full', className)}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ThemeToggle = memo(ThemeToggleComponent);
ThemeToggle.displayName = 'ThemeToggle';
