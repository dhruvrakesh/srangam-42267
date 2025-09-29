# Interactive Article Layout Patterns

This document catalogs the enhanced layout patterns and interactive components developed for Srangam articles, inspired by modern data-driven storytelling techniques.

## Enhanced Timeline Component

**File:** `src/components/articles/enhanced/EnhancedTimeline.tsx`

### Features
- Alternating left/right layout for visual rhythm
- Central timeline with connected dots
- Expandable event details
- Smooth animations and hover effects
- Responsive design with mobile-first approach

### Usage
```tsx
import { EnhancedTimeline, jambudvipaTimelineData } from '@/components/articles/enhanced';

<EnhancedTimeline 
  events={jambudvipaTimelineData}
  title="Civilizational Continuum"
/>
```

### Data Structure
```tsx
interface TimelineEvent {
  era: string;
  date: string;
  description: string;
  side: 'left' | 'right';
  category?: string;
  details?: string;
}
```

## Archaeological Comparison Chart

**File:** `src/components/articles/enhanced/ArchaeologicalChart.tsx`

### Features
- Interactive bar chart using Chart.js
- Custom tooltips with detailed explanations
- HSL color scheme matching design system
- Responsive container sizing
- Professional academic styling

### Usage
```tsx
import { ArchaeologicalChart } from '@/components/articles/enhanced';

<ArchaeologicalChart title="Archaeological Nexus: Comparing Cultural Markers" />
```

### Styling Philosophy
- Uses semantic color tokens from design system
- Professional, academic presentation
- Clear data visualization with contextual tooltips
- Methodology explanations included

## Interactive Textual Sources

**File:** `src/components/articles/enhanced/InteractiveTextualSources.tsx`

### Features
- Filterable content by source category
- Card-based layout with hover effects
- Academic citations and significance notes
- Smooth transitions between filter states
- Comprehensive source categorization

### Usage
```tsx
import { InteractiveTextualSources } from '@/components/articles/enhanced';

<InteractiveTextualSources title="The Textual Tapestry" />
```

### Content Categories
- **Mahabharata**: Epic geographical knowledge
- **Puranas**: Administrative and cosmological data
- **Sangam Literature**: Tamil classical sources

## Design System Integration

All components follow these principles:

### Color Usage
- **Primary:** HSL-based burgundy (`hsl(344, 73%, 22%)`)
- **Accent:** Warm gold (`hsl(42, 78%, 58%)`)
- **Saffron highlights:** (`hsl(25, 95%, 53%)`)
- **Semantic tokens:** Always use CSS variables from `index.css`

### Typography
- **Headers:** Lora serif for elegance
- **Body text:** Inter sans-serif for readability
- **Responsive sizing:** Base 16px with fluid scaling

### Animation Patterns
- **Hover states:** `-translate-y-1` with shadow increase
- **Fade transitions:** `animate-fade-in` utility class
- **Timeline dots:** Pulse animation for active states
- **Chart animations:** 1.5s duration with easing

## Responsive Breakpoints

```css
/* Mobile First */
Base: 100% width, stacked layout
md: 768px+ - Side-by-side layouts enabled
lg: 1024px+ - Three-column grids
```

## Performance Considerations

- **Chart.js:** Lazy loading, cleanup on unmount
- **Images:** Responsive sizing with aspect ratios
- **Animations:** GPU acceleration with transforms
- **Bundle size:** Tree-shaking enabled for all imports

## Future Extensions

### Planned Components
1. **Interactive Map System** - Mapbox integration for geographical data
2. **Correlation Matrix Grid** - Advanced filtering for oceanic trade data
3. **Cultural Term Visualization** - Network graphs for term relationships
4. **Citation Management** - Academic reference system

### Template Patterns
- **Data-Rich Articles:** Timeline + Chart + Sources pattern
- **Geographical Studies:** Map + Timeline + Correlation pattern
- **Cultural Analysis:** Terms + Sources + Interactive quotes pattern

## Implementation Notes

- All components are TypeScript-first with strict typing
- Design system tokens prevent color inconsistencies
- Mobile-responsive by default
- Accessibility considerations built-in
- Performance optimized with proper cleanup