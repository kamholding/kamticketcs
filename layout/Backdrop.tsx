'use client';
import { memo, useCallback } from "react";
import { useSidebar } from "@/context/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMobileSidebar();
  }, [toggleMobileSidebar]);

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={handleClick}
      aria-hidden="true"
    />
  );
};

export default memo(Backdrop);
