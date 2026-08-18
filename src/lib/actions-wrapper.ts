import type { ActionResponse } from './domain'

export async function withActionHandler<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: unknown) {
    console.error('ACTION ERROR:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    const [prefix, ...parts] = message.split(': ')
    const knownCodes = ['UNAUTHENTICATED', 'FORBIDDEN', 'VALIDATION', 'NOT_FOUND', 'CONFLICT', 'DATABASE'] as const
    const code = knownCodes.includes(prefix as (typeof knownCodes)[number]) ? prefix as (typeof knownCodes)[number] : undefined
    // Do not send raw database/provider errors back to the browser.
    const safeError = code === 'DATABASE' ? 'A database error occurred. Please try again.' : (parts.length ? parts.join(': ') : message)
    return {
      success: false,
      error: safeError,
      ...(code ? { code } : {}),
    };
  }
}
