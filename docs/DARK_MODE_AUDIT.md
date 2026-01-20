# Dark Mode Audit Report

**Date:** 2026-01-20  
**Status:** Phase 1 Complete

## Executive Summary

Comprehensive audit of 52+ UI components for dark mode contrast issues. Identified patterns of fragility where hardcoded Tailwind colors (e.g., `text-gray-700`) break WCAG 2.1 AA compliance in dark mode.

## WCAG 2.1 AA Requirements

| Text Type | Required Contrast Ratio |
|-----------|------------------------|
| Normal text (< 18px) | 4.5:1 |
| Large text (≥ 18px or 14px bold) | 3:1 |
| UI components & graphics | 3:1 |

## Component Audit Results

### ✅ Fixed (Phase 1)

| Component | Issue | Fix Applied |
|-----------|-------|-------------|
| `TagChip.tsx` | `bg-sand` no dark override | Added `dark:bg-card dark:text-card-foreground` |
| `ArticleThemeChips.tsx` | Selected state contrast | Added `dark:text-charcoal-om` for saffron bg |
| `ArticleCard.tsx` | Tag chips invisible | Added explicit dark mode classes |
| `GeomythologySection.tsx` | `text-gray-700`, `bg-gray-800` | Replaced with semantic tokens |
| `CrossReferencePanel.tsx` | Category badges hardcoded | Replaced with dharmic palette |
| `OceanicIndex.tsx` | `text-gray-700`, blue gradients | Replaced with semantic tokens |
| `PuranaCategoryBadge.tsx` | Tailwind purple/blue/green | Replaced with dharmic palette |

### ✅ Good (No Changes Needed)

| Component | Reason |
|-----------|--------|
| `Button.tsx` | Uses semantic tokens |
| `Card.tsx` | Uses semantic tokens |
| `Badge.tsx` | Uses semantic tokens |
| `Dialog.tsx` | Uses semantic tokens |
| `Popover.tsx` | Uses semantic tokens |
| `Select.tsx` | Uses semantic tokens |
| Most Shadcn components | Already use semantic tokens |

### ⚠️ Exempt (Data Visualization)

These components use hardcoded hex colors for data visualization purposes. Color consistency is critical for interpretation and are **not subject** to dark mode adaptation:

| Component | Exemption Reason |
|-----------|-----------------|
| `InteractiveAtlas.tsx` | Map markers, cluster colors |
| `JyotirlingaMap.tsx` | Geographic markers |
| `ImprovedInteractiveChart.tsx` | Chart data colors |
| `ArchaeologicalStrataViewer.tsx` | Strata layer colors |
| `AncientTradeRoutesMap.tsx` | Trade route polylines |
| `FossilWorshipSitesGrid.tsx` | Data markers |
| `KashmirLakeTimeline.tsx` | Timeline visualization |
| `ParashuramaCoastalTimeline.tsx` | Timeline visualization |

## CSS Variables Added

```css
.dark {
  --sand: 218 15% 22%;    /* Dark gray-blue for chip backgrounds */
  --ocean: 195 75% 50%;   /* Brighter teal for visibility */
  --saffron: 25 90% 58%;  /* Slightly brighter saffron */
  --cream: 218 15% 90%;   /* Lighter cream for dark mode text */
}
```

## Utility Library

Created `src/lib/darkModeUtils.ts` with:

- `getSemanticColor(colorName)` - Returns full color classes
- `getSemanticBgColor(colorName)` - Returns background-only classes
- `getSemanticTextColor(colorName)` - Returns text-only classes
- Constants: `cardBg`, `textPrimary`, `textSecondary`, `borderDefault`

### Usage Example

```tsx
// ❌ Before (hardcoded, breaks in dark mode)
className="bg-gray-500/10 text-gray-700"

// ✅ After (semantic, works in both modes)
import { getSemanticColor } from '@/lib/darkModeUtils';
className={getSemanticColor('gray')}
// Output: "bg-muted text-muted-foreground"
```

## Color Mapping Guide

| Tailwind Color | Dharmic Replacement | Usage |
|----------------|---------------------|-------|
| `gray-*` | `muted`, `muted-foreground` | Default/neutral elements |
| `blue-*` | `ocean`, `peacock-blue` | Links, navigation, water themes |
| `green-*` | `ocean-teal` | Success, nature themes |
| `purple-*` | `burgundy`, `burgundy-light` | Primary brand, sacred themes |
| `orange-*`, `amber-*` | `saffron`, `gold-warm` | Highlights, sacred themes |
| `red-*` | `laterite` | Errors, warnings |
| `yellow-*` | `gold-warm`, `gold-light` | Accents |

## Testing Checklist

After implementation, verified in **both light and dark modes**:

- [x] Theme filter pills visible (Home page)
- [x] Article card tags visible (Home/Articles pages)
- [x] GeomythologySection cards readable
- [x] CrossReferencePanel badges visible
- [x] OceanicIndex headers and text readable
- [x] PuranaCategoryBadge colors consistent
- [x] Selected vs unselected filter states distinct
- [x] No visual regressions in light mode

## Future Maintenance

When adding new components:

1. **Never use** hardcoded Tailwind grays (`text-gray-700`, `bg-gray-800`)
2. **Always use** semantic tokens (`text-muted-foreground`, `bg-card`)
3. **Import** `darkModeUtils.ts` for color mappings
4. **Test** in both light and dark modes before committing
