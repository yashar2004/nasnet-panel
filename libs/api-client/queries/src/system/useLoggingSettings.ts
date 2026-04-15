/**
 * TanStack Query hooks for RouterOS logging configuration
 * Provides CRUD operations for log rules and actions
 * Epic 0.8: System Logs - RouterOS Log Settings
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { makeRouterOSRequest } from '@nasnet/api-client/core';
import { systemKeys } from './queryKeys';

/**
 * RouterOS logging rule
 */
export interface LoggingRule {
  '.id': string;
  topics: string;
  action: string;
  prefix?: string;
  disabled: boolean;
}

/**
 * RouterOS logging action (destination)
 */
export interface LoggingAction {
  '.id': string;
  name: string;
  target: 'memory' | 'disk' | 'echo' | 'remote';
  'memory-lines'?: number;
  'memory-stop-on-full'?: boolean;
  'disk-file-name'?: string;
  'disk-file-count'?: number;
  'disk-lines-per-file'?: number;
  'disk-stop-on-full'?: boolean;
  remote?: string;
  'remote-port'?: number;
}

/**
 * Extended query keys for logging
 */
export const loggingKeys = {
  all: [...systemKeys.all, 'logging'] as const,
  rules: (routerIp: string) => [...loggingKeys.all, 'rules', routerIp] as const,
  actions: (routerIp: string) => [...loggingKeys.all, 'actions', routerIp] as const,
};

/**
 * Normalize a RouterOS boolean field. RouterOS returns strings like
 * "true"/"false"/"yes"/"no"; coerce to a real boolean so React truthiness
 * checks behave correctly (any non-empty string is truthy otherwise).
 */
function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === 'yes';
  }
  return false;
}

/**
 * Fetch logging rules
 */
async function fetchLoggingRules(routerIp: string): Promise<LoggingRule[]> {
  const result = await makeRouterOSRequest<LoggingRule[]>(routerIp, 'system/logging');

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch logging rules');
  }

  return result.data.map((rule) => ({
    ...rule,
    disabled: toBool(rule.disabled),
  }));
}

/**
 * Fetch logging actions (destinations)
 */
async function fetchLoggingActions(routerIp: string): Promise<LoggingAction[]> {
  const result = await makeRouterOSRequest<LoggingAction[]>(routerIp, 'system/logging/action');

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch logging actions');
  }

  return result.data;
}

/**
 * Hook for fetching logging rules
 */
export function useLoggingRules(routerIp: string): UseQueryResult<LoggingRule[], Error> {
  return useQuery({
    queryKey: loggingKeys.rules(routerIp),
    queryFn: () => fetchLoggingRules(routerIp),
    staleTime: 30_000, // 30 seconds
    enabled: !!routerIp,
  });
}

/**
 * Hook for fetching logging actions
 */
export function useLoggingActions(routerIp: string): UseQueryResult<LoggingAction[], Error> {
  return useQuery({
    queryKey: loggingKeys.actions(routerIp),
    queryFn: () => fetchLoggingActions(routerIp),
    staleTime: 30_000, // 30 seconds
    enabled: !!routerIp,
  });
}

/**
 * Input for creating a logging rule
 */
export interface CreateLoggingRuleInput {
  topics: string;
  action: string;
  prefix?: string;
  disabled?: boolean;
}

/**
 * Input for updating a logging rule
 */
export interface UpdateLoggingRuleInput {
  id: string;
  topics?: string;
  action?: string;
  prefix?: string;
  disabled?: boolean;
}

/**
 * Input for updating a logging action
 */
export interface UpdateLoggingActionInput {
  id: string;
  'memory-lines'?: number;
  'memory-stop-on-full'?: boolean;
  'disk-file-name'?: string;
  'disk-file-count'?: number;
  'disk-lines-per-file'?: number;
  'disk-stop-on-full'?: boolean;
  remote?: string;
  'remote-port'?: number;
}

/**
 * Hook for creating a logging rule
 */
export function useCreateLoggingRule(
  routerIp: string
): UseMutationResult<LoggingRule, Error, CreateLoggingRuleInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLoggingRuleInput) => {
      const result = await makeRouterOSRequest<LoggingRule>(routerIp, 'system/logging/add', {
        method: 'POST',
        body: input,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create logging rule');
      }

      return result.data as LoggingRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loggingKeys.rules(routerIp) });
    },
  });
}

/**
 * Hook for updating a logging rule
 */
export function useUpdateLoggingRule(
  routerIp: string
): UseMutationResult<void, Error, UpdateLoggingRuleInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateLoggingRuleInput) => {
      const result = await makeRouterOSRequest(routerIp, `system/logging/set`, {
        method: 'POST',
        body: { '.id': id, ...input },
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update logging rule');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loggingKeys.rules(routerIp) });
    },
  });
}

/**
 * Hook for deleting a logging rule
 */
export function useDeleteLoggingRule(
  routerIp: string
): UseMutationResult<void, Error, string, { previous: LoggingRule[] | undefined }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      // RouterOS v7 REST: DELETE /rest/system/logging/<id> is the canonical
      // way to remove a rule. The CLI-style POST to .../remove with a body
      // of { numbers: id } or { '.id': id } is accepted inconsistently and
      // was silently failing here.
      const result = await makeRouterOSRequest(
        routerIp,
        `system/logging/${encodeURIComponent(ruleId)}`,
        { method: 'DELETE' }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete logging rule');
      }
    },
    onMutate: async (ruleId) => {
      const key = loggingKeys.rules(routerIp);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LoggingRule[]>(key);
      queryClient.setQueryData<LoggingRule[]>(key, (old) =>
        (old ?? []).filter((r) => r['.id'] !== ruleId)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(loggingKeys.rules(routerIp), ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: loggingKeys.rules(routerIp) });
    },
  });
}

/**
 * Hook for toggling a logging rule enabled/disabled
 */
export function useToggleLoggingRule(
  routerIp: string
): UseMutationResult<
  void,
  Error,
  { id: string; disabled: boolean },
  { previous: LoggingRule[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, disabled }) => {
      // RouterOS v7 REST: PATCH /rest/system/logging/<id> with the field to
      // change is the canonical form. disabled must be sent as a string.
      const result = await makeRouterOSRequest(
        routerIp,
        `system/logging/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: { disabled: disabled ? 'true' : 'false' },
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle logging rule');
      }
    },
    onMutate: async ({ id, disabled }) => {
      const key = loggingKeys.rules(routerIp);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LoggingRule[]>(key);
      queryClient.setQueryData<LoggingRule[]>(key, (old) =>
        (old ?? []).map((r) => (r['.id'] === id ? { ...r, disabled } : r))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(loggingKeys.rules(routerIp), ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: loggingKeys.rules(routerIp) });
    },
  });
}

/**
 * Hook for updating a logging action (destination)
 */
export function useUpdateLoggingAction(
  routerIp: string
): UseMutationResult<void, Error, UpdateLoggingActionInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateLoggingActionInput) => {
      const result = await makeRouterOSRequest(routerIp, `system/logging/action/set`, {
        method: 'POST',
        body: { '.id': id, ...input },
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update logging action');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loggingKeys.actions(routerIp) });
    },
  });
}
