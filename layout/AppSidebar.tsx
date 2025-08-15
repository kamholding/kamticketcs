'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  ChevronDown,
  Plus,
  Eye,
  Share2,
  RefreshCcw,
  BarChart2,
  Repeat,
  UserPlus,
  UserCheck,
  Layers3
} from 'lucide-react';

const AppSidebarComponent: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  const navItems = useMemo(() => [
    { icon: <LayoutDashboard size={18} />, name: 'Home', subItems: [{ name: 'HelpDesk', path: '/', icon: <Layers3 size={16} /> }] },
    { icon: <Ticket size={18} />, name: 'Ticket', subItems: [
      { name: 'Add', path: '/ticket/add', icon: <Plus size={16} /> },
      { name: 'View', path: '/ticket/view', icon: <Eye size={16} /> },
      { name: 'Assign', path: '/ticket/assign', icon: <Share2 size={16} /> },
      { name: 'Reassign', path: '/ticket/reassign', icon: <RefreshCcw size={16} /> },
      { name: 'Analysis', path: '/ticket/analysis', icon: <BarChart2 size={16} /> },
      { name: 'Change Status', path: '/ticket/change-status', icon: <Repeat size={16} /> },
    ] },
    { icon: <Users size={18} />, name: 'User', subItems: [
      { name: 'Add User', path: '/users/add', icon: <UserPlus size={16} /> },
      { name: 'View', path: '/users/view', icon: <UserCheck size={16} /> },
    ] },
  ], []);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    const activeIndex = navItems.findIndex(nav => nav.subItems?.some(item => item.path === pathname));
    setOpenSubmenu(activeIndex >= 0 ? activeIndex : null);
  }, [pathname, navItems]);

  const handleSubmenuToggle = useCallback((index: number) => {
    setOpenSubmenu(prev => (prev === index ? null : index));
  }, []);

  const expanded = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 mt-16 lg:mt-0 px-4 bg-white dark:bg-black h-screen z-50 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out
        ${expanded ? 'w-[280px]' : 'w-[80px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-6 flex flex-col items-center lg:items-start">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo/logo-icon.svg"
            alt="Logo"
            className={`transition-all ${expanded ? 'w-[150px] h-[40px]' : 'w-[32px] h-[32px]'}`}
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-4 overflow-y-auto mb-6">
        <ul className="flex flex-col gap-2">
          {navItems.map((nav, index) => (
            <li key={nav.name}>
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors duration-200 ${
                  openSubmenu === index
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-gray-500 dark:text-gray-400">{nav.icon}</span>
                {expanded && (
                  <>
                    <span className="font-medium">{nav.name}</span>
                    <ChevronDown
                      className={`ml-auto transition-transform ${openSubmenu === index ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}
                      size={16}
                    />
                  </>
                )}
              </button>

              {expanded && (
                <div className={`transition-all ml-7 mt-1 overflow-hidden ${openSubmenu === index ? 'max-h-96' : 'max-h-0'}`}>
                  <ul className="space-y-1">
                    {nav.subItems.map(subItem => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                            isActive(subItem.path)
                              ? 'bg-blue-100 text-blue-700 dark:bg-gray-800 dark:text-blue-400'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span>{subItem.icon}</span>
                          <span className="flex-1">{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

AppSidebarComponent.displayName = "AppSidebar";

export const AppSidebar = React.memo(AppSidebarComponent);

export default AppSidebar;
