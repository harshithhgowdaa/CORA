import type { ActionResponse } from './domain'

export async function withActionHandler<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: unknown) {
    console.error('Server Action Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    const [prefix, ...parts] = message.split(': ')
    const knownCodes = ['UNAUTHENTICATED', 'FORBIDDEN', 'VALIDATION', 'NOT_FOUND', 'CONFLICT', 'DATABASE'] as const
    const code = knownCodes.includes(prefix as (typeof knownCodes)[number]) ? prefix as (typeof knownCodes)[number] : undefined
    return {
      success: false,
      error: parts.length ? parts.join(': ') : message,
      ...(code ? { code } : {}),
    };
  }
}
