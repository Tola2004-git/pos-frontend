import { createContext, useState } from 'react';
import AppRouter from './routes/AppRouter'
import { LowStockProvider } from './context/LowStockContext';

export const SidebarContext = createContext({
  sidebarOpen: true,
  toggleSidebar: () => {},
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? saved === "true" : true;
  });

  const handleToggle = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarOpen", String(next));
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar: handleToggle }}>
      <LowStockProvider>
        <AppRouter />
      </LowStockProvider>
    </SidebarContext.Provider>
  )
}

export default App