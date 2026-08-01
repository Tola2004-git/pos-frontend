export const defaultBg = 'https://i.pinimg.com/1200x/ef/be/e3/efbee3b59f6b81175085fe6dad2a1c31.jpg'

// Solid-color presets, not photos - encoded as a tiny inline SVG so they go
// through the exact same `background: url(...)` rendering path as every
// other preset (no special-casing needed in bgStyle/PresetGrid/img src).
// Their exact string value doubles as the theme trigger - see
// getThemeForBackground() below.
export const PURE_WHITE_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23ffffff'/%3E%3C/svg%3E"
export const PURE_BLACK_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23000000'/%3E%3C/svg%3E"

export const bgPresets = [
  {
    name: 'Food Dark',
    url: 'https://i.pinimg.com/1200x/ef/be/e3/efbee3b59f6b81175085fe6dad2a1c31.jpg'
  },
  {
    name: 'Coffee Shop',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920'
  },
  {
    name: 'Restaurant',
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920'
  },
  {
    name: 'Dark Minimal',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920'
  },
  {
    name: 'Burger',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1920'
  },
  {
    name: 'Pure White',
    url: PURE_WHITE_BG,
  },
  {
    name: 'Pure Black',
    url: PURE_BLACK_BG,
  },
]

export const getCurrentBg = () => {
  return localStorage.getItem('pos_background') || defaultBg
}

// The only two backgrounds with a deterministic, uniform color - text can
// safely auto-invert for these specifically. Every photo preset (and any
// custom upload/URL) keeps the app's normal white text + adjustable dark
// overlay, since there's no reliable way to know a photo's dominant
// brightness without actually analyzing its pixels.
export const getThemeForBackground = (bgUrl) => {
  return bgUrl === PURE_WHITE_BG ? 'light' : 'dark'
}

export const defaultBgOverlayOpacity = 0.5

// The overlay darkening the background photo so white text stays readable
// is user-adjustable (see BackgroundChanger) since a fixed level looks fine
// against some photos and too washed-out or too murky against others.
export const getCurrentBgOverlayOpacity = () => {
  const stored = parseFloat(localStorage.getItem('pos_bg_overlay_opacity'))
  return Number.isFinite(stored) ? stored : defaultBgOverlayOpacity
}

export const getGradientBg = () => ({
  background: `url("${getCurrentBg()}") center/cover no-repeat fixed`,
  backgroundColor: '#2c3e50',
  minHeight: '100vh',
})

export const glassSidebar = {
  background: 'rgba(30, 39, 46, 0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRight: '1px solid var(--surface-border)',
  boxShadow: '4px 0 25px rgba(0,0,0,0.3)',
}

export const glass = {
  background: 'rgba(255,255,255,0.0)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  border: '1px solid var(--surface-border)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
}

export const glassCard = {
  background: 'rgba(255,255,255,0.0)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  border: '1px solid var(--surface-border)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
}

export const colors = {
  gold: '#f1c40f',
  red: '#c0392b',
  white: 'rgba(255,255,255,0.7)',
  whiteFull: '#ffffff',
}

// Theme-aware counterparts of colors.white/whiteFull, for the "active/selected"
// indicator borders (tab underlines, selected-row accents) that need to stay
// visible against the page background specifically - the plain white/whiteFull
// above vanish on the Pure White background the same way glass's border did.
export const accentBorder = {
  soft: 'var(--accent-border-soft)',
  full: 'var(--accent-border-full)',
}