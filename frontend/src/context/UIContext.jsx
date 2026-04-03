import { createContext, useContext, useState } from "react";
const UIContext = createContext();
export function UIProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);
  return (
    <UIContext.Provider value={{ menuOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
    </UIContext.Provider>
  );
}
export function useUI() {
  return useContext(UIContext);
}

