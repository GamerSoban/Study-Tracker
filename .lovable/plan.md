

## Plan: Settings Page with Theme Switcher + QOL Improvements

### What Changes

1. **New Settings page** (`/settings`) accessible from the bottom nav with a gear icon.

2. **Theme system** with three modes:
   - **Dark** (current default) -- deep navy/charcoal with gold accent, green studied, red wasted
   - **Light** -- clean white/light gray background with the same semantic accent colors adjusted for readability
   - **System** -- follows OS preference via `prefers-color-scheme` media query

3. **Theme implementation**:
   - Create a `ThemeProvider` context that reads/writes theme preference to `localStorage`
   - Add a `.light` class variant in `index.css` with light-mode CSS variables (light backgrounds, darker text, adjusted card/border colors)
   - Use `matchMedia('(prefers-color-scheme: dark)')` listener for system mode
   - Apply `dark` or `light` class on `<html>` element

4. **Settings page contents**:
   - Theme selector (Dark / Light / System) using radio buttons or segmented control
   - Visual preview of the selected theme

5. **Bottom nav update**: Add a third tab "Settings" with a `Settings` (gear) icon

6. **QOL improvements**:
   - Add confirmation dialog before deleting a session (prevent accidental deletes)
   - Show "today's stats" summary on the home page (sessions today, studied today)
   - Sort sessions by date (newest first) on the Sessions page

### Technical Details

**Files to create:**
- `src/contexts/ThemeContext.tsx` -- ThemeProvider with `dark | light | system` state, localStorage persistence, media query listener
- `src/pages/Settings.tsx` -- Settings page with theme radio group

**Files to modify:**
- `src/index.css` -- Add light-mode CSS variable overrides under `.light` class
- `src/App.tsx` -- Wrap app in ThemeProvider, add `/settings` route
- `src/components/BottomNav.tsx` -- Add Settings tab
- `src/pages/Sessions.tsx` -- Sort sessions newest-first, add delete confirmation
- `src/pages/Index.tsx` -- Add "Today" stats row

**Theme variable strategy:** The current `:root` vars serve as dark mode. A `.light` selector will override all CSS custom properties with light-appropriate values. The ThemeProvider toggles the class on `document.documentElement`.

