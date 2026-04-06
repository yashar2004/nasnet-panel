/**
 * useDefaultCommands Hook
 * Registers default navigation commands and keyboard shortcuts
 *
 * This hook should be called once at the app root level to register
 * all default commands and shortcuts for the command palette.
 *
 * @see NAS-4.10: Implement Navigation & Command Palette
 */

import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { Home, Wifi, Plus, Download, RefreshCw, Server, HardDrive, FileText } from 'lucide-react';

import {
  useCommandRegistry,
  useConnectionStore,
  useShortcutRegistry,
  useUIStore,
  type Command,
  type Shortcut,
} from '@nasnet/state/stores';

function navigateToWifi(navigate: ReturnType<typeof useNavigate>, currentRouterId: string | null) {
  if (currentRouterId) {
    navigate({
      to: '/router/$id/wifi',
      params: { id: currentRouterId },
    });
    return;
  }

  navigate({ to: '/' });
}

/**
 * Default navigation commands
 */
function createNavigationCommands(
  navigate: ReturnType<typeof useNavigate>,
  currentRouterId: string | null
): Command[] {
  return [
    {
      id: 'nav-home',
      label: 'Home',
      description: 'Go to home page',
      icon: Home,
      category: 'navigation',
      shortcut: 'g h',
      onExecute: () => navigate({ to: '/' }),
    },

    {
      id: 'nav-wifi',
      label: 'WiFi',
      description: 'Wireless network settings',
      icon: Wifi,
      category: 'navigation',
      shortcut: 'g w',
      onExecute: () => navigateToWifi(navigate, currentRouterId),
    },
  ];
}

/**
 * Default action commands
 */
function createActionCommands(): Command[] {
  return [
    {
      id: 'action-add-router',
      label: 'Add Router',
      description: 'Connect a new router',
      icon: Plus,
      category: 'action',
      keywords: ['new', 'connect', 'add'],
      onExecute: () => {
        // TODO: Open add router modal
        console.log('Add router action');
      },
    },
    {
      id: 'action-backup',
      label: 'Create Backup',
      description: 'Backup router configuration',
      icon: Download,
      category: 'action',
      requiresNetwork: true,
      keywords: ['save', 'export', 'backup'],
      onExecute: () => {
        // TODO: Trigger backup
        console.log('Backup action');
      },
    },
    {
      id: 'action-refresh',
      label: 'Refresh Data',
      description: 'Reload current data',
      icon: RefreshCw,
      category: 'action',
      shortcut: 'r',
      keywords: ['reload', 'update'],
      onExecute: () => {
        window.location.reload();
      },
    },
  ];
}

/**
 * Default resource commands (for quick access to common resources)
 */
function createResourceCommands(navigate: ReturnType<typeof useNavigate>): Command[] {
  return [
    {
      id: 'resource-dhcp',
      label: 'DHCP Leases',
      description: 'View DHCP leases',
      icon: Server,
      category: 'resource',
      requiresNetwork: true,
      keywords: ['lease', 'ip', 'clients'],
      onExecute: () => {
        // Navigate to DHCP section
        console.log('DHCP leases');
      },
    },
    {
      id: 'resource-logs',
      label: 'System Logs',
      description: 'View router logs',
      icon: FileText,
      category: 'resource',
      requiresNetwork: true,
      keywords: ['log', 'events', 'history'],
      onExecute: () => {
        console.log('System logs');
      },
    },
    {
      id: 'resource-storage',
      label: 'Storage',
      description: 'Router storage info',
      icon: HardDrive,
      category: 'resource',
      requiresNetwork: true,
      keywords: ['disk', 'space', 'files'],
      onExecute: () => {
        console.log('Storage');
      },
    },
  ];
}

/**
 * Create default keyboard shortcuts
 */
function createDefaultShortcuts(
  navigate: ReturnType<typeof useNavigate>,
  currentRouterId: string | null,
  toggleCommandPalette: () => void,
  toggleShortcutsOverlay: () => void
): Shortcut[] {
  return [
    // Global shortcuts
    {
      id: 'global-command-palette',
      label: 'Open Command Palette',
      keys: 'cmd+k',
      group: 'global',
      onExecute: toggleCommandPalette,
    },
    {
      id: 'global-shortcuts-help',
      label: 'Show Keyboard Shortcuts',
      keys: '?',
      group: 'global',
      onExecute: toggleShortcutsOverlay,
    },
    // Navigation shortcuts (vim-style)
    {
      id: 'nav-go-home',
      label: 'Go to Home',
      keys: 'g h',
      group: 'navigation',
      onExecute: () => navigate({ to: '/' }),
    },

    {
      id: 'nav-go-wifi',
      label: 'Go to WiFi',
      keys: 'g w',
      group: 'navigation',
      onExecute: () => navigateToWifi(navigate, currentRouterId),
    },
    // Action shortcuts
    {
      id: 'action-refresh-shortcut',
      label: 'Refresh Page',
      keys: 'r',
      group: 'actions',
      onExecute: () => window.location.reload(),
    },
  ];
}

/**
 * Hook to register default commands and shortcuts
 *
 * @example
 * ```tsx
 * function App() {
 *   useDefaultCommands();
 *   useGlobalShortcuts();
 *
 *   return (
 *     <>
 *       <RouterOutlet />
 *       <CommandPalette />
 *       <ShortcutsOverlay />
 *     </>
 *   );
 * }
 * ```
 */
export function useDefaultCommands() {
  const navigate = useNavigate();
  const currentRouterId = useConnectionStore((state) => state.currentRouterId);
  const { registerMany: registerCommands } = useCommandRegistry();
  const { registerMany: registerShortcuts, toggleOverlay } = useShortcutRegistry();
  const { toggleCommandPalette } = useUIStore();

  useEffect(() => {
    // Register navigation commands
    const navCommands = createNavigationCommands(navigate, currentRouterId);
    registerCommands(navCommands);

    // Register action commands
    const actionCommands = createActionCommands();
    registerCommands(actionCommands);

    // Register resource commands
    const resourceCommands = createResourceCommands(navigate);
    registerCommands(resourceCommands);

    // Register shortcuts
    const shortcuts = createDefaultShortcuts(
      navigate,
      currentRouterId,
      toggleCommandPalette,
      toggleOverlay
    );
    registerShortcuts(shortcuts);
  }, [
    currentRouterId,
    navigate,
    registerCommands,
    registerShortcuts,
    toggleCommandPalette,
    toggleOverlay,
  ]);
}
