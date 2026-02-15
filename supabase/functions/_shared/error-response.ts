/**
 * Shared Error Response Utility — Phase C Logic Hardening
 * Standardizes error responses across all edge functions.
 * 
 * Error Codes:
 *   E_VALIDATION   — Invalid input (bad YAML, missing fields, invalid language)
 *   E_DUPLICATE    — Slug or record conflict (Postgres 23505)
 *   E_TIMEOUT      — Operation exceeded time limit
 *   E_RATE_LIMIT   — External AI service rate-limited
 *   E_EXTERNAL     — External service failure (AI, Drive, etc.)
 *   E_CONFIG       — Missing configuration (API keys, env vars)
 *   E_INTERNAL     — Unclassified / unexpected error
 */

export interface ErrorDetail {
  code: string;
  type: string;
  message: string;
  hint?: string;
}

export function createErrorResponse(
  status: number,
  detail: ErrorDetail,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ success: false, error: detail }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function classifyError(error: unknown): ErrorDetail {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('duplicate key') || msg.includes('23505')) {
    return {
      code: 'E_DUPLICATE',
      type: 'conflict',
      message: 'A record with this identifier already exists.',
      hint: 'Enable overwrite mode or use a different slug.',
    };
  }
  if (msg.includes('YAML') || msg.includes('frontmatter')) {
    return {
      code: 'E_VALIDATION',
      type: 'validation',
      message: msg,
      hint: 'Ensure all text values in YAML frontmatter are wrapped in quotes.',
    };
  }
  if (msg.includes('timeout') || msg.includes('TIMEOUT')) {
    return {
      code: 'E_TIMEOUT',
      type: 'timeout',
      message: 'The operation timed out.',
      hint: 'Try again or reduce input size.',
    };
  }
  if (msg.includes('rate limit') || msg.includes('429')) {
    return {
      code: 'E_RATE_LIMIT',
      type: 'external_service',
      message: 'AI service rate limit reached.',
      hint: 'Wait a few minutes and retry.',
    };
  }
  if (msg.includes('not configured') || msg.includes('API key')) {
    return {
      code: 'E_CONFIG',
      type: 'config',
      message: msg,
      hint: 'Check that required API keys and environment variables are configured.',
    };
  }
  return { code: 'E_INTERNAL', type: 'internal', message: msg };
}
