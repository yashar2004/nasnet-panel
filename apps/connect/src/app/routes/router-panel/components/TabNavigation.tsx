import React, { useEffect, useCallback } from 'react';
import { useNavigate, useRouterState, useParams } from '@tanstack/react-router';
import { LayoutDashboard, Wifi, Shield, ShieldAlert, Network, Globe, Cable, ScrollText, Store, Boxes } from 'lucide-react';
import { cn } from '@nasnet/ui/primitives';
import { preloadFirewallTab, preloadLogsTab, preloadDHCPTab, preloadDnsTab, preloadPluginStoreTab, preloadAllHeavyTabs } from '@/app/routes/router-panel/tabs/lazy';

/**
 * Tab definition interface
 */
interface TabDefinition {
  value: string;
  label: string;
  mobileLabel?: string; // Shorter label for mobile
  icon: React.ElementType;
  ariaLabel: string;
  /** Optional preload function for lazy-loaded tabs */
  preload?: () => void;
}

/**
 * Tab configuration
 */
/**
 * Tab configuration with preload functions for lazy-loaded tabs
 *
 * Heavy tabs (firewall, logs, dhcp, plugins) are code-split and
 * their components are preloaded on hover for instant navigation.
 *
 * @see NAS-4.12: Performance Optimization
 */
const tabs: TabDefinition[] = [{
  value: 'overview',
  label: 'Overview',
  icon: LayoutDashboard,
  ariaLabel: 'Router overview and status'
}, {
  value: 'wifi',
  label: 'WiFi',
  icon: Wifi,
  ariaLabel: 'WiFi configuration'
}, {
  value: 'vpn',
  label: 'VPN',
  icon: Shield,
  ariaLabel: 'VPN configuration'
}, {
  value: 'firewall',
  label: 'Firewall',
  mobileLabel: 'FW',
  icon: ShieldAlert,
  ariaLabel: 'Firewall settings',
  preload: preloadFirewallTab
}, {
  value: 'dhcp',
  label: 'DHCP',
  icon: Network,
  ariaLabel: 'DHCP server configuration',
  preload: preloadDHCPTab
}, {
  value: 'dns',
  label: 'DNS',
  icon: Globe,
  ariaLabel: 'DNS configuration and servers',
  preload: preloadDnsTab
}, {
  value: 'network',
  label: 'Network',
  mobileLabel: 'Net',
  icon: Cable,
  ariaLabel: 'Network settings'
}, {
  value: 'logs',
  label: 'Logs',
  icon: ScrollText,
  ariaLabel: 'System logs',
  preload: preloadLogsTab
}
// }, {
//   value: 'plugins',
//   label: 'Store',
//   icon: Store,
//   ariaLabel: 'Plugin store',
//   preload: preloadPluginStoreTab
// }, {
//   value: 'services',
//   label: 'Services',
//   mobileLabel: 'Svc',
//   icon: Boxes,
//   ariaLabel: 'Service management'
// }
];

/**
 * Tab Navigation Component
 *
 * Provides adaptive tab-based navigation for the router panel.
 * Integrates with React Router for URL-driven navigation.
 *
 * Features:
 * - Adaptive layout: bottom navigation on mobile, top tabs on desktop
 * - Icons for visual recognition
 * - URL reflects active tab (e.g., /router/123/wifi)
 * - Deep linking support
 * - Keyboard navigation (Tab, Arrow keys, Enter)
 * - Touch-optimized on mobile (44x44px minimum)
 * - ARIA attributes for accessibility
 *
 * Breakpoint: 768px (md)
 * - Mobile (< 768px): Bottom navigation with icon + label vertical layout
 * - Desktop (≥ 768px): Top tabs with icon + label horizontal layout
 *
 * Usage:
 * ```tsx
 * <TabNavigation />
 * ```
 */
export const TabNavigation = React.memo(function TabNavigation() {
  const {
    id
  } = useParams({
    from: '/router/$id'
  });
  const navigate = useNavigate();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Determine active tab from URL path
  const pathSegments = pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];

  // If last segment is router ID, we're on overview (index route)
  const activeTab = lastSegment === id || !lastSegment ? 'overview' : lastSegment;

  // Preload all heavy tabs when entering router panel
  // This ensures fast tab switches after initial load
  useEffect(() => {
    preloadAllHeavyTabs();
  }, []);

  /**
   * Handle tab change - navigate to new tab URL
   */
  const handleTabClick = (tabValue: string) => {
    const basePath = `/router/${id}`;
    const targetPath = tabValue === 'overview' ? basePath : `${basePath}/${tabValue}`;
    navigate({
      to: targetPath
    });
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, tabValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tabValue);
    }
  };

  /**
   * Handle hover - preload the tab's component
   * Uses mouseenter for instant feedback on hover intent
   */
  const handleMouseEnter = useCallback((preload?: () => void) => {
    if (preload) {
      preload();
    }
  }, []);
  return (
    <nav
      className="bg-card border-border sticky top-0 z-30 border-b"
      role="navigation"
      aria-label="Router panel sections"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-0.5 overflow-x-auto px-page-mobile md:px-page-tablet lg:px-page-desktop">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              onKeyDown={(e) => handleKeyDown(e, tab.value)}
              onMouseEnter={() => handleMouseEnter(tab.preload)}
              onFocus={() => handleMouseEnter(tab.preload)}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.ariaLabel}
              className={cn(
                'flex cursor-pointer items-center gap-2 whitespace-nowrap px-3 py-4 text-sm font-medium transition-all duration-200 md:px-4',
                'focus-visible:ring-ring border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                'hover:bg-muted hover:text-foreground',
                isActive
                  ? 'border-foreground text-foreground font-semibold'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.mobileLabel || tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
TabNavigation.displayName = 'TabNavigation';