# Sowmya Selections - Color Theme Guide

## Primary Brand Colors

| Color Name | Hex Value | Usage |
|------------|------------|-------|
| brand-primary | #640d5F | Primary brand color, main CTAs, headings |
| brand-secondary | #d91656 | Secondary brand color, accents, highlights |
| brand-accent | #ffc107 | Accent color, special highlights, badges |

## Extended Color Palette

| Color Name | Hex Value | Usage |
|------------|------------|-------|
| brand-gold | #D4AF37 | Gold accents, special elements, borders |
| brand-red | #ef4444 | Error states, sale badges, warnings |
| brand-green | #10b981 | Success states, in-stock indicators |

## Neutral Colors

| Color Name | Hex Value | Light Mode | Dark Mode |
|------------|------------|------------|-----------|
| white | #FFFFFF | Text on dark backgrounds | Background |
| black | #000000 | Text | Text on light backgrounds |
| gray-50 | #F9FAFB | Backgrounds | - |
| gray-100 | #F3F4F6 | Cards, hover states | - |
| gray-200 | #E5E7EB | Borders | - |
| gray-300 | #D1D5DB | Disabled elements | - |
| gray-400 | #9CA3AF | Placeholders | - |
| gray-500 | #6B7280 | Secondary text | - |
| gray-600 | #4B5563 | Muted text | - |
| gray-700 | #374151 | Text | - |
| gray-800 | #1F2937 | - | Hover states |
| gray-900 | #111827 | - | Cards, backgrounds |

## Theme Implementation Guidelines

### 1. Use Tailwind Classes with Custom Colors
Always use the custom brand colors defined in tailwind.config:
- `text-brand-primary`
- `bg-brand-secondary`
- `border-brand-accent`
- `hover:bg-brand-primary`

### 2. Inline Styles (When Necessary)
When inline styles are unavoidable, use CSS variables:
```css
style={{ color: 'var(--brand-primary)' }}
```

### 3. Dark Mode Implementation
Always provide dark mode alternatives:
```jsx
className={`${theme === 'dark' ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`}
```

### 4. Component Color Patterns

#### Buttons
- Primary: `bg-brand-primary hover:bg-brand-secondary text-white`
- Secondary: `border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white`
- Accent: `bg-brand-accent hover:bg-yellow-500 text-black`

#### Cards
- Background: `theme === 'dark' ? 'bg-gray-800' : 'bg-white'`
- Border: `theme === 'dark' ? 'border-gray-700' : 'border-gray-200'`
- Text: `theme === 'dark' ? 'text-white' : 'text-gray-900'`

#### Links
- Default: `text-brand-primary hover:text-brand-secondary`
- Inverted: `text-white hover:text-gray-200`

#### Status Indicators
- Success: `text-green-500 bg-green-50`
- Error: `text-red-500 bg-red-50`
- Warning: `text-yellow-500 bg-yellow-50`

## Common Color Issues to Avoid

1. **Hard-coded hex values** - Always use theme variables or Tailwind classes
2. **Missing dark mode support** - Ensure all components work in both themes
3. **Inconsistent color usage** - Use brand-primary consistently for primary actions
4. **Poor contrast** - Ensure text is readable on backgrounds in both themes
5. **Too many colors** - Stick to the defined palette for consistency

## Implementation Checklist

When updating or creating components:

- [ ] Use brand colors from the defined palette
- [ ] Implement dark mode support
- [ ] Ensure proper contrast ratios
- [ ] Test hover and focus states
- [ ] Verify color consistency across similar elements
- [ ] Avoid hard-coded hex values