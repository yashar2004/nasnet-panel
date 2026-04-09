import React, { useState } from 'react';
import { RefreshCw, Power } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@nasnet/ui/primitives';

interface WifiQuickActionsProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const WifiQuickActions = React.memo(function WifiQuickActions({
  onRefresh,
  isRefreshing,
}: WifiQuickActionsProps) {
  const [showRestartDialog, setShowRestartDialog] = useState(false);

  const handleRestart = () => {
    // TODO: Implement WiFi restart functionality
    setShowRestartDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={onRefresh} disabled={isRefreshing} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRestartDialog(true)}
        >
          <Power className="mr-2 h-4 w-4" />
          Restart WiFi
        </Button>
      </div>

      <Dialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restart WiFi?</DialogTitle>
            <DialogDescription>
              This will briefly disconnect all wireless clients while the WiFi service restarts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestartDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRestart}>
              Restart WiFi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

WifiQuickActions.displayName = 'WifiQuickActions';
