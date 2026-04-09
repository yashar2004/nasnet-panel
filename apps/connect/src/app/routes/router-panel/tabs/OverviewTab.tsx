/**
 * Overview Tab Component
 * Epic 0.2: Dashboard Overview
 * Redesigned — compact status header, information-dense layout
 *
 * Layout (top to bottom):
 * 1. Compact StatusBar card — status indicator, key metrics inline, LastUpdated
 * 2. Quick Actions row — 4 horizontal action buttons
 * 3. Resources row — 3 gauges (CPU, Memory, Disk) with progress bars
 * 4. Network row — DHCPSummaryCard, TrafficChart, VPNClientsSummary
 * 5. System Details row — SystemInfoCard + HardwareCard
 */

import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  Users,
  Activity,
} from 'lucide-react';
import {
  useRouterInfo,
  useRouterResource,
  useRouterboard,
  useDHCPLeases,
  useDHCPServers,
  useDHCPPools,
  useVPNStats,
  usePPPActive,
  useInterfaces,
} from '@nasnet/api-client/queries';
import { calculateStatus, formatBytes, parseRouterOSUptime } from '@nasnet/core/utils';
import { useConnectionStore, useRouterStore } from '@nasnet/state/stores';
import {
  Card,
  CardContent,
  Badge,
  Progress,
  Separator,
  Skeleton,
} from '@nasnet/ui/primitives';
import {
  SystemInfoCard,
  ResourceGauge,
  HardwareCard,
  LastUpdated,
  DHCPSummaryCard,
  TrafficChart,
  VPNClientsSummary,
  StatusIndicator,
} from '@nasnet/ui/patterns';
import type {
  ConnectedVPNClient,
  NetworkStatus,
  TrafficDataPoint,
} from '@nasnet/ui/patterns';

export const OverviewTab = React.memo(function OverviewTab() {
  const routerIp = useConnectionStore((state) => state.currentRouterIp) || '';
  const routerId = useConnectionStore((state) => state.currentRouterId) || '';
  const connectionState = useConnectionStore((state) => state.state);
  const router = useRouterStore((state) => routerId ? state.routers[routerId] : undefined);
  const routerName = router?.name || 'Router';

  const { data, isLoading, error, refetch } = useRouterInfo(routerIp);

  const {
    data: resourceData,
    isLoading: resourceLoading,
    dataUpdatedAt,
  } = useRouterResource(routerIp);

  const {
    data: hardwareData,
    isLoading: hardwareLoading,
    error: hardwareError,
  } = useRouterboard(routerIp);

  const { data: dhcpLeases, isLoading: dhcpLeasesLoading } = useDHCPLeases(routerIp);
  const { data: dhcpServers } = useDHCPServers(routerIp);
  const { data: dhcpPools } = useDHCPPools(routerIp);

  const { isLoading: vpnLoading } = useVPNStats(routerIp);
  const { data: pppActive } = usePPPActive(routerIp);

  // ─── Interface traffic ─────────────────────────────────────────────────────

  const { data: interfaces, dataUpdatedAt: interfacesUpdatedAt } = useInterfaces(routerIp);

  // Pick primary WAN interface: prefer pppoe > ether1 > first running ether
  const primaryInterface = React.useMemo(() => {
    if (!interfaces) return undefined;
    const running = interfaces.filter((i) => i.linkStatus === 'up');
    return (
      running.find((i) => i.type === 'pppoe') ||
      running.find((i) => i.name === 'ether1') ||
      running.find((i) => i.type === 'ether') ||
      running[0]
    );
  }, [interfaces]);

  // Track byte counter deltas to compute real-time rates
  const MAX_POINTS = 12; // ~1 minute of history at 5s polling
  const trafficHistoryRef = React.useRef<TrafficDataPoint[]>([]);
  const prevTrafficRef = React.useRef<{ rxBytes: number; txBytes: number; time: number } | null>(
    null
  );
  const [trafficData, setTrafficData] = React.useState<TrafficDataPoint[] | undefined>(undefined);
  const prevInterfaceIdRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    // Reset history when interface changes
    if (prevInterfaceIdRef.current !== primaryInterface?.id) {
      trafficHistoryRef.current = [];
      prevTrafficRef.current = null;
      setTrafficData(undefined);
      prevInterfaceIdRef.current = primaryInterface?.id;
    }

    if (!primaryInterface?.txBytes && primaryInterface?.txBytes !== 0) return;

    const rxBytes = primaryInterface.rxBytes ?? 0;
    const txBytes = primaryInterface.txBytes ?? 0;
    const now = Date.now();
    const prev = prevTrafficRef.current;

    if (prev) {
      const elapsed = (now - prev.time) / 1000; // seconds
      if (elapsed > 0) {
        const rxRate = ((rxBytes - prev.rxBytes) / elapsed / 1_000_000) * 8; // Mb/s
        const txRate = ((txBytes - prev.txBytes) / elapsed / 1_000_000) * 8; // Mb/s

        // Only add positive rates (negative means counter reset)
        if (rxRate >= 0 && txRate >= 0) {
          trafficHistoryRef.current = [
            ...trafficHistoryRef.current.slice(-(MAX_POINTS - 1)),
            { time: 'now', download: Math.round(rxRate * 100) / 100, upload: Math.round(txRate * 100) / 100 },
          ];

          // Re-label time axis
          const history = trafficHistoryRef.current;
          setTrafficData(
            history.map((point, i) => ({
              ...point,
              time: i === history.length - 1 ? 'now' : `-${(history.length - 1 - i) * 5}s`,
            }))
          );
        }
      }
    }

    prevTrafficRef.current = { rxBytes, txBytes, time: now };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interfacesUpdatedAt]);

  // ─── Derived values ────────────────────────────────────────────────────────

  const cpuStatus = resourceData?.cpuLoad ? calculateStatus(resourceData.cpuLoad) : 'healthy';

  const memoryUsed = resourceData ? resourceData.totalMemory - resourceData.freeMemory : 0;
  const memoryPercentage = resourceData ? (memoryUsed / resourceData.totalMemory) * 100 : 0;
  const memoryStatus = calculateStatus(memoryPercentage);
  const memorySubtitle = resourceData
    ? `${formatBytes(memoryUsed)} / ${formatBytes(resourceData.totalMemory)}`
    : undefined;

  const diskUsed = resourceData ? resourceData.totalHddSpace - resourceData.freeHddSpace : 0;
  const diskPercentage = resourceData ? (diskUsed / resourceData.totalHddSpace) * 100 : 0;
  const diskStatus = calculateStatus(diskPercentage);
  const diskSubtitle = resourceData
    ? `${formatBytes(diskUsed)} / ${formatBytes(resourceData.totalHddSpace)}`
    : undefined;

  const getNetworkStatus = (): NetworkStatus => {
    if (!resourceData) {
      if (isLoading || resourceLoading || connectionState === 'reconnecting') return 'loading';
      if (connectionState === 'disconnected') return 'error';
    }
    if (cpuStatus === 'critical' || memoryStatus === 'critical' || diskStatus === 'critical')
      return 'error';
    if (cpuStatus === 'warning' || memoryStatus === 'warning' || diskStatus === 'warning')
      return 'warning';
    return 'healthy';
  };
  const networkStatus = getNetworkStatus();

  const uptimeFormatted = data?.uptime ? parseRouterOSUptime(data.uptime) : 'N/A';
  const vpnConnectedCount = pppActive?.length || 0;
  const activeDhcpLeases =
    dhcpLeases?.filter((l) => l.status === 'bound' || !l.status)?.length || 0;

  const getDhcpPoolRange = () => {
    if (!dhcpPools || dhcpPools.length === 0) return undefined;
    const ranges = dhcpPools[0].ranges;
    if (!ranges) return undefined;
    return Array.isArray(ranges) ? ranges.join(', ') : String(ranges);
  };

  // ─── Status bar ────────────────────────────────────────────────────────────

  const statusIndicatorStatus =
    networkStatus === 'healthy' ? 'online'
    : networkStatus === 'warning' ? 'warning'
    : networkStatus === 'error' ? 'offline'
    : 'pending';

  const statusLabel =
    networkStatus === 'healthy' ? 'All systems operational'
    : networkStatus === 'warning' ? 'Attention needed'
    : networkStatus === 'error' ? 'Issues detected'
    : 'Loading...';

  const StatusIcon =
    networkStatus === 'healthy' ? CheckCircle
    : networkStatus === 'warning' ? AlertTriangle
    : networkStatus === 'error' ? XCircle
    : Loader2;

  const statusIconClass =
    networkStatus === 'healthy' ? 'text-success'
    : networkStatus === 'warning' ? 'text-warning'
    : networkStatus === 'error' ? 'text-error'
    : 'text-muted-foreground animate-spin';

  // ─── VPN Clients ───────────────────────────────────────────────────────────

  const connectedVpnClients: ConnectedVPNClient[] = (pppActive || []).slice(0, 5).map((conn) => ({
    id: conn.id,
    name: conn.name || 'Unknown',
    protocol: conn.service as ConnectedVPNClient['protocol'],
    localAddress: conn.address,
    uptime: conn.uptime,
  }));

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const statusBadgeVariant = (status: string) =>
    status === 'healthy' ? 'success' as const
    : status === 'warning' ? 'warning' as const
    : 'error' as const;

  const statusBadgeLabel = (status: string) =>
    status === 'healthy' ? 'Normal'
    : status === 'warning' ? 'Warning'
    : 'Critical';

  const statusProgressClass = (status: string) =>
    status === 'healthy' ? '[&>div]:bg-primary'
    : status === 'warning' ? '[&>div]:bg-warning'
    : '[&>div]:bg-error';

  return (
    <div className="animate-fade-in-up px-page-mobile md:px-page-tablet lg:px-page-desktop py-4 md:py-6 mx-auto max-w-7xl space-y-6 pb-10">

      {/* ── 1. Compact Status Bar ─────────────────────────────────────────── */}
      <Card variant="flat">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: router name with status dot */}
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-foreground text-lg font-semibold">{routerName}</h2>
                  <StatusIndicator
                    status={statusIndicatorStatus}
                    label=""
                    size="sm"
                    pulse={networkStatus === 'healthy'}
                  />
                  {networkStatus === 'warning' && <Badge variant="warning">Warning</Badge>}
                  {networkStatus === 'error' && <Badge variant="error">Critical</Badge>}
                </div>
                <p className="text-muted-foreground text-xs font-mono">{routerIp}</p>
              </div>
            </div>

            {/* Right: inline key metrics + last updated */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
              <div className="flex items-center gap-1.5">
                <Clock className="text-muted-foreground h-3.5 w-3.5" aria-hidden="true" />
                {!data && isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="text-foreground text-sm font-medium tabular-nums">
                    {uptimeFormatted}
                  </span>
                )}
                <span className="text-muted-foreground text-xs">uptime</span>
              </div>

              <Separator orientation="vertical" className="hidden h-4 sm:block" />

              <div className="flex items-center gap-1.5">
                <Users className="text-muted-foreground h-3.5 w-3.5" aria-hidden="true" />
                {!dhcpLeases && dhcpLeasesLoading ? (
                  <Skeleton className="h-4 w-6" />
                ) : (
                  <span className="text-foreground text-sm font-medium tabular-nums">
                    {activeDhcpLeases}
                  </span>
                )}
                <span className="text-muted-foreground text-xs">devices</span>
              </div>

              <Separator orientation="vertical" className="hidden h-4 sm:block" />

              <div className="flex items-center gap-1.5">
                <Activity className="text-muted-foreground h-3.5 w-3.5" aria-hidden="true" />
                {!pppActive && vpnLoading ? (
                  <Skeleton className="h-4 w-6" />
                ) : (
                  <span
                    className={`text-sm font-medium tabular-nums ${vpnConnectedCount > 0 ? 'text-success' : 'text-foreground'}`}
                  >
                    {vpnConnectedCount}
                  </span>
                )}
                <span className="text-muted-foreground text-xs">VPN</span>
              </div>

              <Separator orientation="vertical" className="hidden h-4 sm:block" />

              <LastUpdated timestamp={dataUpdatedAt} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Resources ─────────────────────────────────────────────────── */}
      <section aria-labelledby="resources-heading">
        <h2
          id="resources-heading"
          className="font-display text-foreground mb-3 text-sm font-semibold uppercase tracking-wider opacity-60"
        >
          Resources
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* CPU */}
          <Card variant="flat">
            <CardContent className="p-component-md md:p-component-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-semibold">CPU</span>
                {resourceLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <Badge variant={statusBadgeVariant(cpuStatus)}>
                    {resourceData?.cpuLoad !== undefined ? statusBadgeLabel(cpuStatus) : 'N/A'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center py-2">
                <ResourceGauge
                  label=""
                  value={resourceData?.cpuLoad}
                  status={cpuStatus}
                  isLoading={resourceLoading}
                />
              </div>
              <div className="space-y-1">
                <Progress
                  value={resourceData?.cpuLoad ?? 0}
                  size="sm"
                  className={statusProgressClass(cpuStatus)}
                  aria-label={`CPU usage ${Math.round(resourceData?.cpuLoad ?? 0)}%`}
                />
                <p className="text-muted-foreground text-center text-xs">
                  {resourceLoading ? '—' : `${resourceData?.cpuCount ?? 1} core${(resourceData?.cpuCount ?? 1) > 1 ? 's' : ''} · ${resourceData?.cpuFrequency ?? 0} MHz`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Memory */}
          <Card variant="flat">
            <CardContent className="p-component-md md:p-component-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-semibold">Memory</span>
                {resourceLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <Badge variant={statusBadgeVariant(memoryStatus)}>
                    {statusBadgeLabel(memoryStatus)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center py-2">
                <ResourceGauge
                  label=""
                  value={memoryPercentage}
                  status={memoryStatus}
                  isLoading={resourceLoading}
                />
              </div>
              <div className="space-y-1">
                <Progress
                  value={memoryPercentage}
                  size="sm"
                  className={statusProgressClass(memoryStatus)}
                  aria-label={`Memory usage ${Math.round(memoryPercentage)}%`}
                />
                <p className="text-muted-foreground text-center text-xs">
                  {resourceLoading ? '—' : memorySubtitle ?? `${Math.round(memoryPercentage)}% used`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disk */}
          <Card variant="flat">
            <CardContent className="p-component-md md:p-component-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-semibold">Disk</span>
                {resourceLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <Badge variant={statusBadgeVariant(diskStatus)}>
                    {statusBadgeLabel(diskStatus)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center py-2">
                <ResourceGauge
                  label=""
                  value={diskPercentage}
                  status={diskStatus}
                  isLoading={resourceLoading}
                />
              </div>
              <div className="space-y-1">
                <Progress
                  value={diskPercentage}
                  size="sm"
                  className={statusProgressClass(diskStatus)}
                  aria-label={`Disk usage ${Math.round(diskPercentage)}%`}
                />
                <p className="text-muted-foreground text-center text-xs">
                  {resourceLoading ? '—' : diskSubtitle ?? `${Math.round(diskPercentage)}% used`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── 4. Network Activity ───────────────────────────────────────────── */}
      <section aria-labelledby="network-heading">
        <h2
          id="network-heading"
          className="font-display text-foreground mb-3 text-sm font-semibold uppercase tracking-wider opacity-60"
        >
          Network
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DHCPSummaryCard
            activeLeases={activeDhcpLeases}
            ipRange={getDhcpPoolRange()}
            serverName={dhcpServers?.[0]?.name || 'Default DHCP Server'}
            isLoading={dhcpLeasesLoading}
            linkTo="dhcp"
            className="shadow-none"
          />
          <TrafficChart
            title={`Network Traffic${primaryInterface ? ` (${primaryInterface.name})` : ''}`}
            data={trafficData}
            showPlaceholder={false}
            height={140}
            className="shadow-none"
          />
          <VPNClientsSummary
            connectedCount={vpnConnectedCount}
            clients={connectedVpnClients}
            isLoading={vpnLoading}
            linkTo="vpn"
            maxVisible={3}
            className="shadow-none"
          />
        </div>
      </section>

      {/* ── 5. System Details ─────────────────────────────────────────────── */}
      <section aria-labelledby="system-heading">
        <h2
          id="system-heading"
          className="font-display text-foreground mb-3 text-sm font-semibold uppercase tracking-wider opacity-60"
        >
          System
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SystemInfoCard data={data} isLoading={isLoading} error={error} onRetry={() => refetch()} />
          <HardwareCard data={hardwareData} systemResource={resourceData} isLoading={hardwareLoading} error={hardwareError} />
        </div>
      </section>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';
