import React, { useMemo } from 'react';
import { Signal, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import type { WirelessClient } from '@nasnet/core/types';
import { formatBytes } from '@nasnet/core/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nasnet/ui/primitives';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';

interface ConnectedClientsTableProps {
  clients: WirelessClient[];
  isLoading?: boolean;
}

function SignalBars({ signal }: { signal: number }) {
  const bars =
    signal >= -50 ? 4
    : signal >= -60 ? 3
    : signal >= -70 ? 2
    : 1;
  const color =
    bars >= 3 ? 'bg-success'
    : bars === 2 ? 'bg-warning'
    : 'bg-error';

  return (
    <div className="flex h-4 items-end gap-0.5">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-sm ${bar <= bars ? color : 'bg-muted'}`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
}

export const ConnectedClientsTable = React.memo(function ConnectedClientsTable({
  clients,
  isLoading,
}: ConnectedClientsTableProps) {
  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => b.signalStrength - a.signalStrength),
    [clients]
  );

  const { page, totalPages, startIndex, endIndex, setPage } = usePagination({
    totalItems: sortedClients.length,
    pageSize: 10,
  });

  const paginatedClients = sortedClients.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <section>
        <Card variant="flat">
          <CardHeader>
            <CardTitle className="text-base">Connected Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (clients.length === 0) {
    return (
      <section>
        <Card variant="flat">
          <CardHeader>
            <CardTitle className="text-base">Connected Clients</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Signal className="text-muted-foreground mb-2 h-8 w-8 animate-pulse" />
            <p className="text-muted-foreground text-sm">No clients connected</p>
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
            <CardTitle className="text-base">Connected Clients</CardTitle>
            <span className="text-muted-foreground text-sm tabular-nums">{clients.length} total</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>MAC Address</TableHead>
                <TableHead>Interface</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Traffic</TableHead>
                <TableHead>Connected For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-mono text-sm">{client.macAddress}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{client.interface}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SignalBars signal={client.signalStrength} />
                      <span className="text-muted-foreground font-mono text-sm">
                        {client.signalStrength} dBm
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground font-mono text-sm">
                      <span className="text-success">↓</span> {client.rxRate} Mbps
                      <span className="text-primary ml-2">↑</span> {client.txRate} Mbps
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground font-mono text-sm">
                      <span className="text-success">↓</span> {formatBytes(client.rxBytes)}
                      <span className="text-primary ml-2">↑</span> {formatBytes(client.txBytes)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex items-center gap-1 font-mono text-sm">
                      <Clock className="h-3.5 w-3.5" />
                      {client.uptime}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-border divide-y md:hidden">
          {paginatedClients.map((client) => (
            <div key={client.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-mono text-sm">{client.macAddress}</span>
                <SignalBars signal={client.signalStrength} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{client.interface}</span>
                <span className="text-muted-foreground font-mono">{client.signalStrength} dBm</span>
              </div>
              <div className="text-muted-foreground flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <ArrowDown className="text-success h-3 w-3" />
                  {formatBytes(client.rxBytes)}
                  <ArrowUp className="text-primary h-3 w-3" />
                  {formatBytes(client.txBytes)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {client.uptime}
                </div>
              </div>
            </div>
          ))}
        </div>

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </CardContent>
    </Card>
    </section>
  );
});

ConnectedClientsTable.displayName = 'ConnectedClientsTable';
