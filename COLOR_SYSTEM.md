# Unified Color System

## Design Philosophy
A consistent, interconnected color palette across the entire Krishi Hedge application that creates visual harmony and clear role differentiation.

## Color Palette

### Primary Colors

#### Farmer Section
- **Primary**: `emerald-600` (#059669)
- **Hover/Active**: `emerald-700` (#047857)
- **Light variants**: `emerald-50`, `emerald-100`, `emerald-200`
- **Usage**: Navigation active states, primary buttons, success indicators, active contracts

#### Buyer Section
- **Primary**: `blue-600` (#2563eb)
- **Hover/Active**: `blue-700` (#1d4ed8)  
- **Light variants**: `blue-50`, `blue-100`, `blue-200`
- **Usage**: Navigation active states, buyer dashboard elements, buyer-specific actions

### Accent Colors

#### Amber (Pending/Warning)
- **Primary**: `amber-500` (#f59e0b)
- **Dark**: `amber-600` (#d97706)
- **Light**: `amber-100`, `amber-50`
- **Usage**: Pending status, warnings, highlights

#### Rose (Error/Loss)
- **Primary**: `rose-500` (#f43f5e)
- **Dark**: `rose-600` (#e11d48)
- **Light**: `rose-100`, `rose-50`
- **Usage**: Loss indicators, errors, cancelled status

### Neutral Colors

#### Slate (Base)
- **Background**: `slate-50` (#f8fafc)
- **Surface**: `white` (#ffffff)
- **Dark**: `slate-900` (#0f172a)
- **Borders**: `slate-200`, `slate-300`
- **Text**: `slate-600`, `slate-700`, `slate-800`

## Component Usage

### Navigation
- **Farmer Bottom Nav**: emerald-600 for active, slate-400 for inactive
- **Buyer Bottom Nav**: blue-500 for active, slate-400 for inactive

### Status Badges
- **Active**: emerald-100 background, emerald-700 text
- **Pending**: amber-100 background, amber-700 text
- **Completed**: blue-100 background, blue-700 text
- **Cancelled**: rose-100 background, rose-700 text
- **Expired**: slate-100 background, slate-700 text

### Financial Indicators
- **Profit/Gain**: emerald-600 text, emerald-50 background
- **Loss**: rose-600 text, rose-50 background

### Buttons
- **Farmer Primary**: bg-emerald-600 hover:bg-emerald-700
- **Buyer Primary**: bg-blue-600 hover:bg-blue-700
- **Secondary**: bg-slate-900 hover:bg-slate-800
- **Accent**: bg-amber-500 hover:bg-amber-600

### Headers
- **Farmer**: Gradient from emerald-600 to emerald-700
- **Buyer**: Gradient from slate-900 via slate-800 to blue-900

## CSS Variables (globals.css)

```css
:root {
  --kh-farmer-primary: #059669;    /* emerald-600 */
  --kh-farmer-deep: #047857;       /* emerald-700 */
  --kh-buyer-primary: #2563eb;     /* blue-600 */
  --kh-buyer-deep: #1d4ed8;        /* blue-700 */
  --kh-accent: #f59e0b;            /* amber-500 */
  --kh-accent-deep: #d97706;       /* amber-600 */
  --kh-bg-soft: #f8fafc;           /* slate-50 */
  --kh-surface: #ffffff;           /* white */
  --kh-dark: #0f172a;              /* slate-900 */
  --kh-success: #10b981;           /* emerald-500 */
  --kh-error: #f43f5e;             /* rose-500 */
}
```

## Migration Notes

### Old → New Mapping
- `green-600/700` → `emerald-600/700`
- `red-600` → `rose-600`
- `yellow-100` → `amber-100`
- `gray-*` → `slate-*`
- `purple-*` → Removed (consistency)

## Files Updated
1. ✅ `globals.css` - CSS variables
2. ✅ `BottomNav.tsx` - Navigation colors
3. ✅ `buyer/home/page.tsx` - Buyer dashboard
4. ✅ `contracts/page.tsx` - Contracts page
5. ✅ `HomeScreen.tsx` - Farmer home
6. ✅ `market/page.tsx` - Market page
7. ✅ `portfolio/page.tsx` - Portfolio page

## Benefits
- ✨ Consistent visual language across all pages
- 🎯 Clear role differentiation (Farmer vs Buyer)
- 📊 Better readability with standardized status colors
- 🔄 Easy maintenance with centralized color system
- 💚 Modern, professional appearance
