"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const debounce = (fn: Function, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobileStatus = debounce(() => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    }, 100);

    updateMobileStatus();
    window.addEventListener("resize", updateMobileStatus);
    return () => window.removeEventListener("resize", updateMobileStatus);
  }, []);

  const toggleSidebar = useCallback(() => setIsExpanded(prev => !prev), []);
  const toggleMobileSidebar = useCallback(() => setIsMobileOpen(prev => !prev), []);
  const toggleSubmenu = useCallback((item: string) => {
    setOpenSubmenu(prev => (prev === item ? null : item));
  }, []);

  const value = useMemo(
    () => ({
      isExpanded: isMobile ? false : isExpanded,
      isMobileOpen,
      isHovered,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      setIsHovered,
      setActiveItem,
      toggleSubmenu,
    }),
    [isMobile, isExpanded, isMobileOpen, isHovered, activeItem, openSubmenu, toggleSidebar, toggleMobileSidebar, toggleSubmenu]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
