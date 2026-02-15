

# Phase C: Logic Hardening -- Precise Implementation Plan

## Verified Findings from Code Audit (February 15, 2026)

### C1. Error Response Inconsistency (8 functions, 6 different shapes)

| Function | Current Error Shape | HTTP Status |
|----------|-------------------|-------------|
| `markdown-to-article-import` | `{ success: false, error: string }` | 500 |
| `generate-article-tags` | `{ success: false, tags: [], message: string }` | 500 |
| `enrich-cultural-term` | `{ error: string }` (no `success` field) | 400/500 |
| `enrich-cultural-term` (DB fail) | `{ error: string, term, displayTerm, details }` | 500 |
| `backfill-bibliography` | `{ success: false, error: string }` | 500 |
| `detect-duplicate-articles` | `{ is_duplicate: false, method: 'error', reasoning: string }` | 500 |
| `generate-article-seo` | `{ success: false, error: string, metaDescription: fallback, articleCount: 56 }` | 500 |
| `batch-import-from-github` | `{ success: false, error: string }` | 500 |
| `analyze-tag-relationships` | `{ success: false, tagsUpdated: 0, relationshipsFound: 0, message: string }` | 500 |

The frontend `MarkdownImport.tsx` (lines 312-346) catches errors and does string-matching against `"duplicate key"` and `"YAML"` to classify errors -- fragile and tightly coupled to Postgres error messages.

### C2. Slug Generation Race Condition

In `markdown-to-article-import/index.ts` lines 632-675:
- If `overwriteExisting`: SELECT by slug, then UPDATE or INSERT (two-step)
- If not: direct INSERT -- Postgres `23505` unique violation leaks as raw error string
- Race window exists between SELECT and UPDATE when two concurrent imports target the same slug

### C3. Validation Gaps

In `markdown-to-article-import/index.ts` line 478:
```typescript
const targetLang = lang || frontmatter.lang || 'en';
```
Any arbitrary string accepted as a language code -- no validation. No title length cap, no word count sanity check.

---

## Implementation Plan

### Step 1: Create shared error response utility

**New file**: `supabase/functions/_shared/error-response.ts`

```typescript
export interface ErrorDetail {
  code: string;    // E_VALIDATION, E_DUPLICATE, E_TIMEOUT, E_EXTERNAL, E_INTERNAL, E_CONFIG
  type: string;    // validation, conflict, timeout, external_service, internal, config
  message: string; // Human-readable
  hint?: string;   // Actionable guidance
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
    return { code: 'E_DUPLICATE', type: 'conflict', message: 'A record with this identifier already exists.', hint: 'Enable overwrite mode or use a different slug.' };
  }
  if (msg.includes('YAML') || msg.includes('frontmatter')) {
    return { code: 'E_VALIDATION', type: 'validation', message: msg, hint: 'Ensure all text values in YAML frontmatter are wrapped in quotes.' };
  }
  if (msg.includes('timeout') || msg.includes('TIMEOUT')) {
    return { code: 'E_TIMEOUT', type: 'timeout', message: 'The operation timed out.', hint: 'Try again or reduce input size.' };
  }
  if (msg.includes('rate limit') || msg.includes('429')) {
    return { code: 'E_RATE_LIMIT', type: 'external_service', message: 'AI service rate limit reached.', hint: 'Wait a few minutes and retry.' };
  }
  return { code: 'E_INTERNAL', type: 'internal', message: msg };
}
```

This is a pure utility module -- zero risk, no runtime behavior change.

### Step 2: Update 8 edge function catch blocks

Each function's catch block will be updated to use `classifyError()` and `createErrorResponse()`. The success paths remain completely untouched. Specific changes per function:

| Function | Lines Changed | Notes |
|----------|--------------|-------|
| `markdown-to-article-import` | 949-958 (catch block) + line 441 (400 error) | Also add specific duplicate slug handling at line 672 |
| `generate-article-tags` | 230-241 | Preserve `tags: []` in error response for backward compat |
| `enrich-cultural-term` | 210-216 (main catch) + 186-196 (DB error) + 19-22 (validation) | Standardize all 3 error returns |
| `backfill-bibliography` | 363-372 | Simple catch block update |
| `detect-duplicate-articles` | 288-299 | Preserve `is_duplicate: false` in error for backward compat |
| `generate-article-seo` | 168-185 | Preserve fallback `metaDescription` in error for backward compat |
| `batch-import-from-github` | 167-177 | Simple catch block update |
| `analyze-tag-relationships` | 130-142 | Preserve `tagsUpdated: 0` in error for backward compat |

**Backward compatibility**: Functions that currently return extra fields in errors (like `tags: []`, `is_duplicate: false`, `metaDescription`) will continue returning those fields alongside the new structured `error` object. This ensures existing callers are not broken.

### Step 3: Add front-matter validation to import pipeline

In `markdown-to-article-import/index.ts`, after line 478 (where `targetLang` is set), add validation:

```typescript
// Validate language code
const VALID_LANGUAGES = ['en', 'hi', 'pa', 'ta', 'te', 'ml', 'kn', 'bn', 'gu', 'mr', 'sa'];
if (!VALID_LANGUAGES.includes(targetLang)) {
  return createErrorResponse(400, {
    code: 'E_VALIDATION',
    type: 'validation',
    message: `Invalid language code: "${targetLang}"`,
    hint: `Supported languages: ${VALID_LANGUAGES.join(', ')}`
  }, corsHeaders);
}

// Validate title
if (!titleText || titleText.trim().length === 0) {
  return createErrorResponse(400, {
    code: 'E_VALIDATION',
    type: 'validation',
    message: 'Article title is required',
    hint: 'Add a title field in your YAML frontmatter or ensure the markdown has an H1 heading.'
  }, corsHeaders);
}

if (titleText.length > 500) {
  return createErrorResponse(400, {
    code: 'E_VALIDATION',
    type: 'validation',
    message: `Title too long (${titleText.length} chars, max 500)`,
    hint: 'Shorten the title in your frontmatter.'
  }, corsHeaders);
}
```

This rejects invalid input before any database writes occur. Existing valid imports are completely unaffected.

### Step 4: Slug generation concurrency guard

Replace lines 632-675 in `markdown-to-article-import/index.ts` with atomic conflict handling:

```text
Current (fragile, lines 632-675):
  if overwriteExisting:
    SELECT slug -> if exists: UPDATE, else: INSERT
  else:
    INSERT (raw 23505 on conflict)

Proposed (safe):
  if overwriteExisting:
    upsert via .upsert(articleData, { onConflict: 'slug' })
  else:
    INSERT, catch 23505 specifically ->
      return E_DUPLICATE with hint "Enable overwrite or change slug"
```

The `overwriteExisting` path switches from two-step SELECT+UPDATE to a single `.upsert()` call, eliminating the race window entirely. The non-overwrite path catches the specific Postgres error code and returns a structured `E_DUPLICATE` response instead of leaking raw database errors.

### Step 5: Update frontend error handler

In `src/pages/admin/MarkdownImport.tsx` lines 312-346, update the catch block to read structured errors:

```typescript
} catch (error: any) {
  // Try to parse structured error from edge function
  const structuredError = error?.context?.body?.error || error?.error;
  
  let userFriendlyMessage: string;
  let actionableHint = '';

  if (structuredError?.code) {
    // Structured error from edge function
    userFriendlyMessage = structuredError.message;
    actionableHint = structuredError.hint || '';
  } else {
    // Fallback: legacy string-matching (backward compat)
    const errorMessage = error.message || 'Unknown error occurred';
    userFriendlyMessage = errorMessage;
    
    if (errorMessage.includes('duplicate key') && errorMessage.includes('slug')) {
      userFriendlyMessage = `An article with this slug already exists.`;
      actionableHint = 'Enable "Overwrite existing article" or change the slug.';
    } else if (errorMessage.includes('YAML') || errorMessage.includes('frontmatter')) {
      actionableHint = 'Ensure all text values are wrapped in quotes.';
    }
  }
  // ... rest unchanged
}
```

This reads the new structured error format first, falling back to legacy string-matching for any edge case where the old format is still returned. Zero risk of regression.

### Step 6: Update documentation

- `docs/RELIABILITY_AUDIT.md`: Add Phase C completion entry documenting the structured error schema, validation rules, and slug guard
- `.lovable/plan.md`: Mark Phase C complete
- `docs/IMPLEMENTATION_STATUS.md`: Add Phase C row

---

## Files Changed Summary

| # | File | Change Type | Lines Changed | Risk |
|---|------|------------|---------------|------|
| 1 | `supabase/functions/_shared/error-response.ts` | NEW | ~40 lines | Zero |
| 2 | `supabase/functions/markdown-to-article-import/index.ts` | EDIT | Catch block (~10 lines), validation insert (~25 lines), slug logic (~40 lines) | Low |
| 3 | `supabase/functions/generate-article-tags/index.ts` | EDIT | Catch block (~12 lines) | Low |
| 4 | `supabase/functions/enrich-cultural-term/index.ts` | EDIT | 3 error returns (~20 lines total) | Low |
| 5 | `supabase/functions/backfill-bibliography/index.ts` | EDIT | Catch block (~8 lines) | Low |
| 6 | `supabase/functions/detect-duplicate-articles/index.ts` | EDIT | Catch block (~10 lines) | Low |
| 7 | `supabase/functions/generate-article-seo/index.ts` | EDIT | Catch block (~15 lines) | Low |
| 8 | `supabase/functions/batch-import-from-github/index.ts` | EDIT | Catch block (~8 lines) | Low |
| 9 | `supabase/functions/analyze-tag-relationships/index.ts` | EDIT | Catch block (~10 lines) | Low |
| 10 | `src/pages/admin/MarkdownImport.tsx` | EDIT | Error handler (~30 lines) | Low |
| 11 | `docs/RELIABILITY_AUDIT.md` | EDIT | Add Phase C section | Zero |
| 12 | `.lovable/plan.md` | EDIT | Mark Phase C complete | Zero |
| 13 | `docs/IMPLEMENTATION_STATUS.md` | EDIT | Add Phase C row | Zero |

## What This Does NOT Do

- Does not change any success response shapes
- Does not add new database tables or migrations
- Does not change routing, authentication, or business logic
- Does not touch the 15 edge functions not listed (TTS, sitemap, context-bundle, etc.)
- Does not implement Phase D (observability) or Phase E (scalability)

## Risk Assessment

- **Risk**: Low. All changes are in error-handling paths, input validation (early rejection), and slug conflict handling. The happy path for every function remains identical.
- **Backward compatibility**: Functions preserve their existing extra error fields (`tags: []`, `is_duplicate: false`, etc.) alongside the new structured `error` object. Frontend falls back to string-matching if structured error is absent.
- **Rollback**: Delete `_shared/error-response.ts` and revert catch blocks to original `JSON.stringify({ success: false, error: errorMessage })`.
- **Testing**: After deployment, test import with (a) valid markdown, (b) missing title, (c) invalid language code `xyz`, (d) duplicate slug without overwrite, (e) duplicate slug with overwrite enabled.

