import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import type { WirelessInterface } from '@nasnet/core/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from '@nasnet/ui/primitives';

interface WifiSecuritySummaryProps {
  interfaces: WirelessInterface[];
  isLoading?: boolean;
}

function getSecurityInfo(securityProfile: string) {
  const profile = securityProfile.toLowerCase();
  if (profile.includes('wpa3'))
    return { label: 'WPA3', icon: ShieldCheck, variant: 'success' as const };
  if (profile.includes('wpa2'))
    return { label: 'WPA2', icon: Shield, variant: 'success' as const };
  if (profile.includes('wpa') || profile.includes('wep'))
    return { label: profile.includes('wep') ? 'WEP' : 'WPA', icon: ShieldAlert, variant: 'warning' as const };
  if (profile === 'default' || profile === 'none' || profile === '')
    return { label: 'Open', icon: ShieldX, variant: 'error' as const };
  return { label: securityProfile || 'Unknown', icon: Shield, variant: 'outline' as const };
}

export const WifiSecuritySummary = React.memo(function WifiSecuritySummary({
  interfaces,
  isLoading,
}: WifiSecuritySummaryProps) {
  if (isLoading) {
    return (
      <section>
        <h2 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
          Security Summary
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="flat">
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (interfaces.length === 0) return null;

  return (
    <section>
      <h2 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
        Security Summary
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {interfaces.map((iface) => {
          const security = getSecurityInfo(iface.securityProfile);
          const Icon = security.icon;
          return (
            <Card key={iface.id} variant="flat">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-foreground font-medium">{iface.name}</p>
                    <p className="text-muted-foreground font-mono text-sm">
                      {iface.ssid || 'Not configured'}
                    </p>
                  </div>
                  <Icon className="text-muted-foreground h-5 w-5" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={security.variant}>{security.label}</Badge>
                  <span className="text-muted-foreground text-xs">
                    {iface.securityProfile || 'No profile'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
});

WifiSecuritySummary.displayName = 'WifiSecuritySummary';
