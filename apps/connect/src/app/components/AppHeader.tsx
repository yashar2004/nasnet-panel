import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import {
  useAlertNotificationStore,
  useUnreadCount,
  useNotifications,
  useConnectionStore,
} from '@nasnet/state/stores';
import type { InAppNotification } from '@nasnet/state/stores';
import { ThemeToggle, NotificationBell } from '@nasnet/ui/patterns';
import { Button } from '@nasnet/ui/primitives';

export const AppHeader = React.memo(function AppHeader() {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const allNotifications = useNotifications();
  const recentNotifications = allNotifications.slice(0, 5);
  const setDisconnected = useConnectionStore((s) => s.setDisconnected);

  const markAsRead = useAlertNotificationStore((s) => s.markAsRead);
  const markAllRead = useAlertNotificationStore((s) => s.markAllRead);

  const handleNotificationClick = (notification: InAppNotification) => {
    markAsRead(notification.id);
  };

  const handleSignOut = () => {
    setDisconnected();
    navigate({ to: '/' });
  };

  return (
    <div className="h-full">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-page-mobile md:px-page-tablet lg:px-page-desktop">
        {/* Left: Logo + Title */}
        <Link to="/" className="flex cursor-pointer items-center gap-3">
          <img
            src="/favicon.png"
            alt="Nasnet Panel"
            className="h-7 w-7 rounded-md"
          />
          <div>
            <p className="text-foreground text-sm font-semibold leading-tight">Nasnet Panel</p>
            <p className="text-muted-foreground text-[11px] leading-tight">Enterprise free internet dashboard</p>
          </div>
        </Link>

        {/* Right: Theme + Notifications + Sign Out */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell
            unreadCount={unreadCount}
            notifications={recentNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={() => markAllRead()}
            onViewAll={() => {}}
          />
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-full"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
});
AppHeader.displayName = 'AppHeader';
