declare const APP_VERSION: string;

import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useAlertNotifications } from '@nasnet/features/alerts';
import { ResponsiveShell } from '@nasnet/ui/layouts';
import {
  CommandPalette,
  ShortcutsOverlay,
  useGlobalShortcuts,
  SearchFAB,
  ConnectionBanner,
} from '@nasnet/ui/patterns';
import { Toaster } from '@nasnet/ui/primitives';
import { AppHeader } from '../app/components/AppHeader';
import { useConnectionHeartbeat } from '../app/hooks/useConnectionHeartbeat';
import { useConnectionToast } from '../app/hooks/useConnectionToast';
import { useDefaultCommands } from '../app/hooks/useDefaultCommands';
import { Providers } from '../app/providers';
function RootInner() {
  // Enable connection toast notifications
  useConnectionToast();

  // Enable connection heartbeat monitoring
  useConnectionHeartbeat();

  // Register default commands and shortcuts
  useDefaultCommands();

  // Enable global keyboard shortcuts (Cmd+K, ?, etc.)
  useGlobalShortcuts();

  // Enable alert notifications subscription with toast + sound playback
  useAlertNotifications();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMainRoute = pathname === '/';

  return (
    <ResponsiveShell
      header={isMainRoute ? undefined : <AppHeader />}
      banner={<ConnectionBanner />}
    >
      {/* Skip to main content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:p-4 focus:shadow-lg"
      >
        {'Skip to main content'}
      </a>
      <main
        id="main-content"
        className="animate-fade-in-up px-page-mobile md:px-page-tablet lg:px-page-desktop flex-1 py-6"
      >
        <Outlet />
      </main>
      <footer className="border-border border-t py-4 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Nasnet Panel v{APP_VERSION}
          {import.meta.env.DEV && (
            <span className="ml-2 rounded bg-warning/20 px-1.5 py-0.5 font-medium text-warning">DEV</span>
          )}
        </p>
      </footer>
      <Toaster />
      {/* Command Palette - opens with Cmd+K or via SearchFAB on mobile */}
      <CommandPalette />
      {/* Shortcuts Overlay - opens with ? key (desktop only) */}
      <ShortcutsOverlay />
      {/* Search FAB - visible on mobile only */}
      <SearchFAB />
    </ResponsiveShell>
  );
}
function RootComponent() {
  return (
    <Providers>
      <RootInner />
      {/* Only show devtools in development */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </Providers>
  );
}

// Root-level error boundary
function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div
      className="bg-background flex min-h-screen items-center justify-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-card text-card-foreground border-border max-w-md rounded-lg border p-8 shadow-lg">
        <h1 className="text-error mb-4 text-2xl font-bold">{'Application error'}</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring min-h-[44px] rounded px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {'Reload application'}
        </button>
        {import.meta.env.DEV && (
          <pre className="bg-muted text-foreground mt-4 overflow-auto rounded p-4 text-xs">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}

// 404 Not Found component
function NotFoundComponent() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-muted text-6xl font-bold">{'404'}</h1>
        <p className="text-muted-foreground mt-4 text-xl">{'Page not found'}</p>
        <a
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring mt-6 inline-block min-h-[44px] rounded px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {'Go home'}
        </a>
      </div>
    </div>
  );
}
export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent,
});
