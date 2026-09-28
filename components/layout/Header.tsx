'use client';

import React from 'react';
import { 
  Home, 
  Bell, 
  HelpCircle, 
  Menu,
  ChevronRight,
  Headphones
} from 'lucide-react';

interface HeaderProps {
  currentBreadcrumb: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ currentBreadcrumb, isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs select-none">
      {/* Left side: Collapse toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          title={isSidebarCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Breadcrumb */}
        <nav className="flex items-center text-xs sm:text-sm text-slate-600 font-normal">
          <span className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
            <Home className="w-4 h-4 text-slate-500" />
          </span>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
          <span className="text-slate-800 font-medium">{currentBreadcrumb}</span>
        </nav>
      </div>

      {/* Right side: Quick status, Help & User profile */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống Định tuyến: Hoạt động</span>
        </div>

        <button 
          id="btn-help"
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="Trợ giúp & Hướng dẫn"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button 
          id="btn-notifications"
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors relative cursor-pointer"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AD
          </div>
          <div className="hidden lg:block text-left text-xs leading-tight">
            <p className="font-semibold text-slate-800">Admin System</p>
            <p className="text-slate-500 text-[11px]">Tổng đài viên VIP</p>
          </div>
        </div>
      </div>
    </header>
  );
}
