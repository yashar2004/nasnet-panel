/**
 * VPN Clients Summary Component
 * Summary card showing connected VPN client count with expandable list
 * Based on UX Design Specification - Direction 4: Action-First
 *
 * @example
 * ```tsx
 * <VPNClientsSummary
 *   connectedCount={3}
 *   clients={vpnClients}
 *   linkTo="/vpn"
 * />
 * ```
 */

import React, { memo, useState, useCallback } from 'react';
import { Shield, ChevronDown, ChevronRight, Loader2, Wifi } from 'lucide-react';

import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, Button, Icon } from '@nasnet/ui/primitives';

import { ProtocolIconBadge } from '../protocol-icon';

import type { VPNProtocol } from '@nasnet/core/types';

/**
 * Connected VPN client info
 */
export interface ConnectedVPNClient {
  /** Client ID */
  id: string;
  /** Client/user name */
  name: string;
  /** VPN protocol */
  protocol: VPNProtocol;
  /** Remote IP address */
  remoteAddress?: string;
  /** Local/assigned IP address */
  localAddress?: string;
  /** Connection uptime */
  uptime?: string;
}

/**
 * VPNClientsSummary Props
 */
export interface VPNClientsSummaryProps {
  /** Total connected clients count */
  connectedCount: number;
  /** List of connected clients (show top 3-5) */
  clients?: ConnectedVPNClient[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Link to full VPN page */
  linkTo?: string;
  /** Maximum clients to show in collapsed view */
  maxVisible?: number;
  /** Custom className */
  className?: string;
}

/**
 * VPNClientsSummary Component
 * Shows VPN client summary with connected count and expandable client list
 */
function VPNClientsSummaryComponent({
  connectedCount,
  clients = [],
  isLoading = false,
  linkTo = '/vpn',
  maxVisible = 3,
  className = '',
}: VPNClientsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasClients = clients.length > 0;
  const visibleClients = isExpanded ? clients : clients.slice(0, maxVisible);
  const hasMore = clients.length > maxVisible;

  const status = connectedCount > 0 ? 'connected' : 'disconnected';
  const statusColor = status === 'connected' ? 'text-success' : 'text-muted-foreground';
  const bgColor = status === 'connected' ? 'bg-success-light dark:bg-success/20' : 'bg-muted';

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-secondary/10 dark:bg-secondary/20 flex h-8 w-8 items-center justify-center rounded-lg">
              <Shield className="text-secondary h-4 w-4" aria-hidden="true" />
            </div>
            <CardTitle className="text-base font-semibold">VPN Clients</CardTitle>
          </div>
          {linkTo && (
            <Link to={linkTo as '/'}>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer rounded-full">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ?
          <div className="flex items-center justify-center py-4">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        : connectedCount === 0 ?
          <div className="flex h-full flex-1 flex-col items-center justify-center py-10 text-center">
            <Shield className="text-muted-foreground mb-2 h-8 w-8 animate-pulse" />
            <p className="text-muted-foreground text-sm">No clients connected</p>
          </div>
        : <>
          {/* Total connected */}
          <div className="flex items-center gap-3">
            <Shield className="text-muted-foreground h-5 w-5" aria-hidden="true" />
            <div>
              <p className="text-foreground text-2xl font-bold">{connectedCount}</p>
              <p className="text-muted-foreground text-xs">Total Connected</p>
            </div>
          </div>

          {/* Per-protocol breakdown */}
          {hasClients && (
            <div className="border-border mt-3 space-y-1 border-t pt-3">
              {Object.entries(
                clients.reduce<Record<string, number>>((acc, c) => {
                  const proto = c.protocol || 'other';
                  acc[proto] = (acc[proto] || 0) + 1;
                  return acc;
                }, {})
              ).map(([protocol, count]) => (
                <div key={protocol} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    <span className="bg-success relative inline-flex h-2.5 w-2.5 rounded-full" />
                  </span>
                  <span className="text-foreground flex-1 text-sm font-medium capitalize">{protocol}</span>
                  <span className="text-muted-foreground tabular-nums text-sm">{count} {count === 1 ? 'user' : 'users'}</span>
                </div>
              ))}
            </div>
          )}
        </>
        }
      </CardContent>
    </Card>
  );
}

export const VPNClientsSummary = memo(VPNClientsSummaryComponent);
VPNClientsSummary.displayName = 'VPNClientsSummary';
