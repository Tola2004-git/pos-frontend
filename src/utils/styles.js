export const defaultBg = 'https://i.pinimg.com/1200x/ef/be/e3/efbee3b59f6b81175085fe6dad2a1c31.jpg'

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
]

export const getCurrentBg = () => {
  return localStorage.getItem('pos_background') || defaultBg
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
  borderRight: '1px solid rgba(255,255,255,0.15)',
  boxShadow: '4px 0 25px rgba(0,0,0,0.3)',
}

export const glass = {
  background: 'rgba(255,255,255,0.0)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
}

export const glassCard = {
  background: 'rgba(255,255,255,0.0)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
}

export const colors = {
  gold: '#f1c40f',
  red: '#c0392b',
  white: 'rgba(255,255,255,0.7)',
  whiteFull: '#ffffff',
}