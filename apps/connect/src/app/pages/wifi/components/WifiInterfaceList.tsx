import React from 'react';
import { Wifi } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useWirelessInterfaces } from '@nasnet/api-client/queries';
import { useConnectionStore } from '@nasnet/state/stores';
import { WirelessInterfaceCard } from '@nasnet/features/wireless';
import type { WirelessInterface } from '@nasnet/core/types';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@nasnet/ui/primitives';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';

interface WifiInterfaceListProps {
  routerId: string;
  interfaces?: WirelessInterface[];
}

export const WifiInterfaceList = React.memo(function WifiInterfaceList({
  routerId,
  interfaces: externalInterfaces,
}: WifiInterfaceListProps) {
  const routerIp = useConnectionStore((state) => state.currentRouterIp) || '';
  const navigate = useNavigate();
  const { data: fetchedInterfaces, isLoading, error } = useWirelessInterfaces(routerIp);

  const interfaces = externalInterfaces ?? fetchedInterfaces;

  const { page, totalPages, startIndex, endIndex, setPage } = usePagination({
    totalItems: interfaces?.length ?? 0,
    pageSize: 10,
  });

  const paginatedInterfaces = interfaces?.slice(startIndex, endIndex) ?? [];

  if (!externalInterfaces && isLoading) {
    return (
      <section>
        <Card variant="flat">
          <CardHeader>
            <CardTitle className="text-base">Wireless Interfaces</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!externalInterfaces && error) {
    return (
      <section>
        <Card variant="flat">
          <CardHeader>
            <CardTitle className="text-base">Wireless Interfaces</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Failed to load interfaces</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!interfaces || interfaces.length === 0) {
    return (
      <section>
        <Card variant="flat">
          <CardHeader>
            <CardTitle className="text-base">Wireless Interfaces</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Wifi className="text-muted-foreground mb-2 h-8 w-8 animate-pulse" />
            <p className="text-muted-foreground text-sm">No wireless interfaces found</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <Card variant="flat">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Wireless Interfaces</CardTitle>
            <span className="text-muted-foreground text-sm tabular-nums">{interfaces.length} total</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {paginatedInterfaces.map((iface) => (
              <WirelessInterfaceCard
                key={iface.id}
                interface={iface}
                onClick={() =>
                  navigate({ to: `/router/${routerId}/wifi/${iface.id}` })
                }
              />
            ))}
          </div>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </section>
  );
});

WifiInterfaceList.displayName = 'WifiInterfaceList';
