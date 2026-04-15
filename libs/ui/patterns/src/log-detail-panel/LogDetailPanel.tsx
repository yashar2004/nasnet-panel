/**
 * Log Detail Panel Component
 * Side panel showing full log entry details
 * Epic 0.8: System Logs - Log Entry Details Panel
 */

import * as React from 'react';

import { Copy, ChevronLeft, ChevronRight, X } from 'lucide-react';

import type { LogEntry } from '@nasnet/core/types';
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  useToast,
} from '@nasnet/ui/primitives';

import { topicToBadgeVariant } from '../log-entry';
import { SeverityBadge } from '../severity-badge';

export interface LogDetailPanelProps {
  /**
   * The log entry to display
   */
  entry: LogEntry | null;
  /**
   * Whether the panel is open
   */
  isOpen: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Related entries (from same topic, for context)
   */
  relatedEntries?: LogEntry[];
  /**
   * Navigate to previous entry
   */
  onPrevious?: () => void;
  /**
   * Navigate to next entry
   */
  onNext?: () => void;
  /**
   * Whether there is a previous entry
   */
  hasPrevious?: boolean;
  /**
   * Whether there is a next entry
   */
  hasNext?: boolean;
}

/**
 * Format topic label
 */
function formatTopicLabel(topic: string): string {
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

/**
 * LogDetailPanel Component
 */
function LogDetailPanelComponent({
  entry,
  isOpen,
  onClose,
  relatedEntries = [],
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: LogDetailPanelProps) {
  const { toast } = useToast();

  const handleCopy = React.useCallback(async () => {
    if (!entry) return;
    const text = `[${new Date(entry.timestamp).toISOString()}] [${entry.topic}] [${entry.severity}] ${entry.message}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'Log entry has been copied',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  }, [entry, toast]);

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  if (!entry) return null;

  const timestamp = new Date(entry.timestamp);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="max-w-lg sm:max-w-xl" hideDefaultClose>
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base">Log Entry Details</DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Entry
              </Button>
              {onPrevious && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  aria-label="Previous entry"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {onNext && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={!hasNext}
                  aria-label="Next entry"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="min-w-0 space-y-4 overflow-hidden">
          {/* Timestamp */}
          <div>
            <label
              htmlFor="timestamp-display"
              className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
            >
              Timestamp
            </label>
            <p className="mt-1 font-mono text-sm">
              {timestamp.toLocaleString()} ({timestamp.toISOString()})
            </p>
          </div>

          {/* Topic & Severity */}
          <div className="flex items-center gap-4">
            <div>
              <label
                htmlFor="topic-badge"
                className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
              >
                Topic
              </label>
              <div className="mt-1">
                <Badge
                  variant={topicToBadgeVariant(entry.topic)}
                  className={entry.topic === 'critical' ? 'font-bold' : undefined}
                >
                  {formatTopicLabel(entry.topic)}
                </Badge>
              </div>
            </div>
            <div>
              <label
                htmlFor="severity-badge"
                className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
              >
                Severity
              </label>
              <div className="mt-1">
                <SeverityBadge severity={entry.severity} />
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message-display"
              className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
            >
              Message
            </label>
            <div className="rounded-card-sm mt-1 border bg-slate-50 p-3 dark:bg-slate-800">
              <p className="whitespace-pre-wrap break-words font-mono text-sm">{entry.message}</p>
            </div>
          </div>

          {/* Related entries */}
          {relatedEntries.length > 0 && (
            <div className="min-w-0">
              <label
                htmlFor="related-entries-list"
                className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
              >
                Related Entries ({relatedEntries.length})
              </label>
              <div className="mt-1 max-h-32 w-full min-w-0 space-y-1 overflow-y-auto overflow-x-hidden">
                {relatedEntries.slice(0, 5).map((related) => (
                  <div
                    key={related.id}
                    className="flex w-full min-w-0 items-center gap-2 rounded bg-slate-50 p-2 text-xs dark:bg-slate-800"
                  >
                    <span className="text-muted-foreground shrink-0 font-mono">
                      {new Date(related.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="shrink-0">
                      <SeverityBadge severity={related.severity} />
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {related.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

export const LogDetailPanel = React.memo(LogDetailPanelComponent);
LogDetailPanel.displayName = 'LogDetailPanel';
