import { createContext, useState, useEffect } from 'react';
import AppRouter from './routes/AppRouter'
import { LowStockProvider } from './context/LowStockContext';
import { LanguageProvider } from './context/LanguageContext';
import { initRealtimeSync } from './realtime';

export const SidebarContext = createContext({
  sidebarOpen: true,
  toggleSidebar: () => {},
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    // No cleanup here on purpose - the connection is a module-level
    // singleton (see realtime.js) meant to live for the whole tab session,
    // not tied to this component's mount lifecycle.
    initRealtimeSync();
  }, []);

  const handleToggle = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarOpen", String(next));
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar: handleToggle }}>
      <LanguageProvider>
        <LowStockProvider>
          <AppRouter />
        </LowStockProvider>
      </LanguageProvider>
    </SidebarContext.Provider>
  )
}

export default App