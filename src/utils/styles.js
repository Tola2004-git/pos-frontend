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
    name: 'Anime Loop',
    // Re-encoded from a 4K/60fps/19.5Mbps 52MB source down to 1080p/24fps/
    // ~2.4Mbps/6.5MB (H.264, audio stripped since it's always muted) -
    // see frontend/public/videos/ - the source resolution/framerate was far
    // more than a blurred, overlay-darkened background can show, and would
    // have cost proportionally more battery/CPU to decode for zero visible
    // benefit.
    url: '/videos/bg-jjk.mp4',
    poster: '/videos/bg-jjk-poster.jpg',
    type: 'video',
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

// Video backgrounds are stored the same way as image ones - just the URL
// string in `pos_background` - and told apart by file extension rather than
// a separate stored "type" field, so old saved values (image data URLs,
// https:// photo URLs) keep working with zero migration.
export const isVideoBg = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(url || '')

// Looks up the poster frame for a video preset by URL, so a page rendering
// the current background doesn't need its own copy of bgPresets to find it.
export const getVideoPoster = (url) =>
  bgPresets.find((p) => p.url === url)?.poster

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

// The Sidebar always stays a dark, fixed surface regardless of theme, but
// which dark it uses is tuned per-preset so it visually pairs with
// whichever background is active instead of clashing with it - see
// --sidebar-bg in index.css.
export const getBgVariant = (bgUrl) => {
  if (bgUrl === PURE_WHITE_BG) return 'pure-white'
  if (bgUrl === PURE_BLACK_BG) return 'pure-black'
  return 'photo'
}

export const defaultBgOverlayOpacity = 0.5

// The overlay darkening the background photo so white text stays readable
// is user-adjustable (see BackgroundChanger) since a fixed level looks fine
// against some photos and too washed-out or too murky against others.
export const getCurrentBgOverlayOpacity = () => {
  const stored = parseFloat(localStorage.getItem('pos_bg_overlay_opacity'))
  return Number.isFinite(stored) ? stored : defaultBgOverlayOpacity
}

// `background` shorthand only (color folded into the same value, never a
// separate `backgroundColor` key) - Login.jsx conditionally swaps this
// object for a video-mode fallback of just a color, and mixing shorthand
// with the longhand across that swap trips React's
// "Removing a style property... when a conflicting property is set" warning.
export const getGradientBg = () => ({
  background: `#2c3e50 url("${getCurrentBg()}") center/cover no-repeat fixed`,
  minHeight: '100vh',
})

export const glassSidebar = {
  background: 'var(--sidebar-bg)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRight: '1px solid var(--surface-border)',
  boxShadow: '4px 0 25px var(--shadow-color)',
}

export const glass = {
  background: 'rgba(255,255,255,0.0)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  border: '1px solid var(--surface-border)',
  boxShadow: '0 2px 10px var(--shadow-color)',
}

export const glassCard = {
  background: 'rgba(255,255,255,0.0)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  border: '1px solid var(--surface-border)',
  boxShadow: '0 2px 10px var(--shadow-color)',
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