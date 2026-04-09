import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ApolloProvider } from '@nasnet/api-client/core';
import { PlatformProvider } from '@nasnet/ui/layouts';
import { AnimationProvider, ToastProvider } from '@nasnet/ui/patterns';
import { TooltipProvider } from '@nasnet/ui/primitives';

import { ThemeProvider } from './ThemeProvider';

const queryClient = new QueryClient();

/**
 * Root providers for the application
 *
 * Combines all context providers in proper nesting order (outermost to innermost):
 * 1. ThemeProvider - Theme management
 * 2. PlatformProvider - Platform detection for responsive presenters (ADR-018)
 * 3. AnimationProvider - Animation context with reduced motion support (NAS-4.18)
 * 4. ApolloProvider - GraphQL client for server state (subscriptions, normalized cache)
 * 5. QueryClientProvider - TanStack Query for REST endpoints (coexists during migration)
 * 6. ToastProvider - Sonner-based toast notifications (NAS-4.19)
 *
 * Note: Apollo and TanStack Query coexist during migration period:
 * - Apollo: New GraphQL features (subscriptions, real-time updates)
 * - TanStack Query: Existing REST endpoints
 *
 * Animation Provider provides:
 * - reducedMotion detection from UI store
 * - Platform detection (mobile/tablet/desktop)
 * - Animation tokens adjusted for platform
 * - Helper functions (getVariant, getTransition, getDuration)
 *
 * Toast Provider provides:
 * - Sonner toaster with theme integration
 * - NotificationManager for store-to-Sonner sync
 * - Responsive positioning (bottom-right desktop, bottom-center mobile)
 * - Max 3 visible toasts with queue management
 *
 * Usage:
 * ```tsx
 * <Providers>
 *   <RouterProvider router={router} />
 * </Providers>
 * ```
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PlatformProvider>
        <AnimationProvider>
          <ApolloProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <ToastProvider>{children}</ToastProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </ApolloProvider>
        </AnimationProvider>
      </PlatformProvider>
    </ThemeProvider>
  );
}
Providers.displayName = 'Providers';
