import React, { useMemo } from 'react';
import { Wifi, Users, Signal, Radio } from 'lucide-react';
import type { WirelessInterface, WirelessClient } from '@nasnet/core/types';
import {
  Card,
  CardContent,
  Badge,
  Progress,
  Skeleton,
} from '@nasnet/ui/primitives';

interface WifiStatusHeroProps {
  interfaces: WirelessInterface[];
  clients: WirelessClient[];
  isLoading?: boolean;
}

function getSignalQuality(signalDbm: number) {
  if (signalDbm >= -50) return { label: 'Excellent', progressClass: '[&>div]:bg-success', textClass: 'text-success' };
  if (signalDbm >= -60) return { label: 'Good', progressClass: '[&>div]:bg-success', textClass: 'text-success' };
  if (signalDbm >= -70) return { label: 'Fair', progressClass: '[&>div]:bg-warning', textClass: 'text-warning' };
  return { label: 'Weak', progressClass: '[&>div]:bg-error', textClass: 'text-error' };
}

function signalToPercent(signalDbm: number): number {
  const clamped = Math.max(-100, Math.min(-30, signalDbm));
  return Math.round(((clamped + 100) / 70) * 100);
}

export const WifiStatusHero = React.memo(function WifiStatusHero({
  interfaces,
  clients,
  isLoading,
}: WifiStatusHeroProps) {
  const totalClients = clients.length;

  const activeInterfaces = useMemo(
    () => interfaces.filter((i) => !i.disabled && i.running),
    [interfaces]
  );

  const activePercent =
    interfaces.length > 0 ? Math.round((activeInterfaces.length / interfaces.length) * 100) : 0;

  const avgSignal = useMemo(() => {
    if (clients.length === 0) return -100;
    return Math.round(clients.reduce((acc, c) => acc + c.signalStrength, 0) / clients.length);
  }, [clients]);

  const signalQuality = getSignalQuality(avgSignal);
  const signalPercent = signalToPercent(avgSignal);

  const bandCounts = useMemo(
    () =>
      interfaces.reduce(
        (acc, i) => {
          if (i.band === '2.4GHz') acc['2.4GHz']++;
          else if (i.band === '5GHz') acc['5GHz']++;
          else if (i.band === '6GHz') acc['6GHz']++;
          return acc;
        },
        { '2.4GHz': 0, '5GHz': 0, '6GHz': 0 }
      ),
    [interfaces]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="flat">
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-12" />
              <Skeleton className="mb-2 h-7 w-10" />
              <Skeleton className="h-1.5 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Connected Clients */}
      <Card variant="flat">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <Users className="text-info h-3.5 w-3.5" />
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Clients</span>
          </div>
          <p className="text-foreground text-2xl font-bold tabular-nums">{totalClients}</p>
          <p className="text-muted-foreground mt-1 text-xs">Connected devices</p>
        </CardContent>
      </Card>

      {/* Active Interfaces */}
      <Card variant="flat">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <Wifi className="text-success h-3.5 w-3.5" />
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Active</span>
          </div>
          <p className="text-foreground text-2xl font-bold tabular-nums">
            {activeInterfaces.length}
            <span className="text-muted-foreground ml-1 text-sm font-normal">/{interfaces.length}</span>
          </p>
          <Progress value={activePercent} size="sm" className="mt-2 [&>div]:bg-success" />
        </CardContent>
      </Card>

      {/* Signal Quality */}
      <Card variant="flat">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <Signal className="text-warning h-3.5 w-3.5" />
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Signal</span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${signalQuality.textClass}`}>
            {clients.length > 0 ? `${avgSignal} dBm` : '—'}
          </p>
          {clients.length > 0 ? (
            <>
              <Progress value={signalPercent} size="sm" className={`mt-2 ${signalQuality.progressClass}`} />
              <p className={`mt-1 text-xs ${signalQuality.textClass}`}>{signalQuality.label}</p>
            </>
          ) : (
            <p className="text-muted-foreground mt-1 text-xs">No clients</p>
          )}
        </CardContent>
      </Card>

      {/* Frequency Bands */}
      <Card variant="flat">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <Radio className="text-info h-3.5 w-3.5" />
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Bands</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bandCounts['2.4GHz'] > 0 && <Badge variant="info">2.4G</Badge>}
            {bandCounts['5GHz'] > 0 && <Badge variant="warning">5G</Badge>}
            {bandCounts['6GHz'] > 0 && <Badge variant="error">6G</Badge>}
            {interfaces.length === 0 && (
              <span className="text-muted-foreground text-xs">No interfaces</span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{interfaces.length} interface{interfaces.length !== 1 ? 's' : ''}</p>
        </CardContent>
      </Card>
    </div>
  );
});

WifiStatusHero.displayName = 'WifiStatusHero';
