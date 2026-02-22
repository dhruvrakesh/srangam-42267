

# Fix: Search Dropdown UI/UX Issues

## Problems Identified (from screenshot)

1. **Transparent background**: The dropdown Card uses `bg-background` which inherits the semi-transparent header backdrop. The hero image bleeds through behind every result row.
2. **Tag overflow**: Tags (e.g., "Vedic Geography", "Puranic Cosmology", "Ancient Trade Networks") wrap and overflow beyond the dropdown boundary since there is no `overflow-hidden` or `flex-wrap` constraint.
3. **No scroll constraint**: All 8 results render at full height, making the dropdown extend well below the viewport fold -- no `max-height` or `overflow-y-auto`.
4. **Truncated titles are unreadable**: Titles like "From Cosm..." and "Jambudvip..." are cut too aggressively. The `truncate` class on a narrow container makes them useless.
5. **No close affordance**: No visible way to dismiss the dropdown other than clicking away.

## Fix Plan

### File 1: `src/components/navigation/SearchResults.tsx`

**Background fix**: Replace `bg-background` with an opaque, solid background class like `bg-popover` (which is defined as a solid color in shadcn themes) and add `backdrop-blur-none` to override any inherited transparency.

**Scroll constraint**: Add `max-h-[420px] overflow-y-auto` to the `CardContent` wrapper so the dropdown never exceeds ~420px height and becomes scrollable.

**Tag overflow fix**: Change the tags container from `flex items-center gap-2` to `flex flex-wrap gap-1.5` and limit to 2 tags max (already sliced, but ensure wrapping works). Add `overflow-hidden` to the tag row.

**Title readability**: Change title from `truncate` (single-line ellipsis) to `line-clamp-1` with a wider min-width, or better: allow 2 lines with `line-clamp-2` so titles like "From Cosmology to Geography" are readable.

**Result count**: Reduce from 8 to 5 results in the dropdown for a tighter, more usable panel. The full search page shows all results.

**Close button**: Add a small "View all results" link at the bottom that navigates to `/search?query=...` and a subtle header showing result count.

### File 2: `src/components/navigation/HeaderNav.tsx`

**Container width**: The search container is `w-80` (320px). The dropdown inherits this via `left-0 right-0`. This is fine but ensure the dropdown can extend slightly wider if needed by using `min-w-[320px] w-[400px]` on the dropdown itself (not constrained by parent).

**Escape key**: Add an `onKeyDown` handler on the search input to close the dropdown on Escape.

## Technical Details

### SearchResults.tsx changes (lines 44-80):

```tsx
// Outer wrapper: solid background, constrained height
<div className="absolute top-full left-0 mt-1 z-50 w-[400px]">
  <Card className="bg-popover border-border shadow-xl">
    <CardContent className="p-2 max-h-[420px] overflow-y-auto">
      {displayResults.map((article) => (
        <Link ...>
          <h4 className="text-sm font-medium text-foreground line-clamp-1">
            {article.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5 overflow-hidden max-h-7">
            <TagChip ...>{article.theme}</TagChip>
            {article.tags.slice(0, 2).map(...)}
          </div>
        </Link>
      ))}
    </CardContent>
    {/* Footer link to full search */}
    <div className="border-t border-border px-3 py-2">
      <Link to={`/search?query=...`} className="text-xs text-primary">
        View all results
      </Link>
    </div>
  </Card>
</div>
```

### HeaderNav.tsx changes (lines 192-227):

- Add `onKeyDown` to input: close dropdown on Escape key
- Ensure the relative container does not clip the dropdown

### Summary of visual fixes:

| Issue | Before | After |
|-------|--------|-------|
| Background | Transparent (hero bleeds through) | Solid `bg-popover` with `shadow-xl` |
| Height | Unconstrained (8 items, extends past fold) | `max-h-[420px]` with scroll, 5 items |
| Tags | Overflow horizontally | `flex-wrap` with `max-h-7 overflow-hidden` |
| Titles | "From Cosm..." (truncated to ~8 chars) | `line-clamp-1` at 400px width (readable) |
| Dropdown width | 320px (parent-constrained) | 400px fixed width |
| Dismiss | Blur only | Blur + Escape key + "View all" link |

