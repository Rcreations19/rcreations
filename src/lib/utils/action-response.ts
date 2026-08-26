import { ZodError } from 'zod';

export type ActionResponse<T = void> = 
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

/**
 * Normalizes an unknown error into a safe, user-facing string.
 * This prevents developer data (raw SQL constraints, complex JSON arrays) from reaching the client.
 */
export function getSafeErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred. Please try again.'): string {
  if (error instanceof ZodError) {
    // Flatten Zod errors into a single, clean sentence
    const issues = error.issues;
    if (issues.length > 0) {
      return issues[0].message;
    }
    return 'Invalid data provided. Please check your inputs.';
  }

  if (error instanceof Error) {
    // If the error message is explicitly thrown from our app logic (e.g. "Rate limit exceeded"), we can pass it through.
    // However, if it looks like a DB error (e.g. contains SQL terms or 'relation'), we sanitize it.
    const msg = error.message;
    if (msg.toLowerCase().includes('relation') || msg.toLowerCase().includes('duplicate key') || msg.toLowerCase().includes('syntax error') || msg.toLowerCase().includes('violates foreign key')) {
      console.error('[DATABASE_ERROR_SWALLOWED]', msg);
      return fallbackMessage;
    }
    return msg;
  }

  return fallbackMessage;
}
