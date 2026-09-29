'use client';

import React, { useState } from 'react';
import { 
  Database, 
  ChevronDown, 
  ChevronUp,
  BarChart2, 
  FileText, 
  Wrench, 
  Headphones, 
  Radio, 
  Settings,
  PhoneCall,
  MessageSquare,
  Users,
  ShieldCheck,
  CheckCircle,
  Menu,
  Share2,
  GitFork,
  Clock,
  Calendar,
  Contact,
  Filter
} from 'lucide-react';

export type CallRoutingSubView = 
  | 'routing-config'
  | 'chat-routing-config'
  | 'chat-routing-input'
  | 'social-media-channels'
  | 'auto-messages-config'
  | 'skill-management'
  | 'skill-group'
  | 'special-numbers'
  | 'realtime-monitor'
  | 'performance-report';

interface SidebarProps {
  currentView: CallRoutingSubView;
  onSelectView: (view: CallRoutingSubView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentView, onSelectView, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [openSections, setOpenSections] = useState({
    baseData: false,
    qualityControl: true,
    general: true,
    distribution: true,
    callRouting: true,
    admin: false,
    routingSubmenu: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isRoutingGroupActive = currentView === 'routing-config' || currentView === 'chat-routing-config' || currentView === 'chat-routing-input' || currentView === 'auto-messages-config';

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col h-screen select-none transition-all duration-300 ease-in-out z-40 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Exact UniSpace Logo SVG with cyan/orange swooshes */}
            <div className="w-8 h-8 flex-shrink-0 relative flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                {/* Cyan / Blue wave */}
                <path 
                  d="M6 22C6 14.5 11.5 8 19 8C22.5 8 25.5 9.5 27.5 12" 
                  stroke="#0284c7" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M10 24C10 18.5 14 13.5 19.5 13.5C22.2 13.5 24.5 14.8 26 16.8" 
                  stroke="#38bdf8" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />
                {/* Orange wave */}
                <path 
                  d="M14 26C14 22 17 18.5 21 18.5C23.5 18.5 25.5 19.8 26.8 21.8" 
                  stroke="#f97316" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M6 26H30" 
                  stroke="#f25621" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
            <div className="flex items-baseline font-bold tracking-tight">
              <span className="text-slate-800 text-lg tracking-tight font-sans">UniSpace</span>
              <span className="text-[#f25621] text-lg font-sans">-CX</span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-full flex justify-center py-1">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path d="M6 22C6 14.5 11.5 8 19 8C22.5 8 25.5 9.5 27.5 12" stroke="#0284c7" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M10 24C10 18.5 14 13.5 19.5 13.5C22.2 13.5 24.5 14.8 26 16.8" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M14 26C14 22 17 18.5 21 18.5C23.5 18.5 25.5 19.8 26.8 21.8" stroke="#f97316" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M6 26H30" stroke="#f25621" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {!isCollapsed && (
          <button 
            onClick={onToggleCollapse}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Thu gọn"
          >
            <div className="flex flex-col gap-1 w-4 items-end">
              <span className="h-0.5 w-4 bg-slate-500 rounded" />
              <span className="h-0.5 w-3 bg-slate-500 rounded" />
              <span className="h-0.5 w-2 bg-slate-500 rounded" />
            </div>
          </button>
        )}
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 text-[13px] text-slate-600 space-y-1 scrollbar-thin">
        
        {/* Section: Dữ liệu cơ sở */}
        <div>
          <button
            onClick={() => toggleSection('baseData')}
            className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Dữ liệu cơ sở"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-slate-400" />
              {!isCollapsed && <span className="font-normal text-slate-700">Dữ liệu cơ sở</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.baseData ? 'rotate-180' : ''}`} />
            )}
          </button>
        </div>

        {/* Section: Kiểm soát chất lượng Agent */}
        <div className="pt-1">
          {!isCollapsed && (
            <div className="px-2 py-1.5 text-[11px] font-medium text-slate-400 tracking-wide">
              Kiểm soát chất lượng Agent
            </div>
          )}
          <div className="space-y-0.5">
            <button
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Bảng điều khiển"
            >
              <BarChart2 className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Bảng điều khiển</span>}
            </button>

            <button
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="DS Chấm điểm"
            >
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>DS Chấm điểm</span>}
            </button>

            <button
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Cấu hình tiêu chí"
            >
              <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Cấu hình tiêu chí</span>}
            </button>

            <button
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Cấu hình nhóm tiêu chí"
            >
              <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Cấu hình nhóm tiêu chí</span>}
            </button>
          </div>
        </div>

        {/* Section: Chung */}
        <div className="pt-2">
          {!isCollapsed && (
            <div className="px-2 py-1.5 text-[11px] font-medium text-slate-400 tracking-wide">
              Chung
            </div>
          )}
          <div className="space-y-0.5">
            {/* Tiếp nhận & phân phối (Main Submenu) */}
            <div>
              <button
                onClick={() => toggleSection('distribution')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer ${
                  isCollapsed ? 'justify-center' : ''
                } ${currentView === 'social-media-channels' ? 'bg-orange-50/50 text-[#f25621] font-medium' : ''}`}
                title="Tiếp nhận & phân phối"
              >
                <div className="flex items-center gap-2.5">
                  <Headphones className={`w-4 h-4 shrink-0 ${currentView === 'social-media-channels' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="font-medium">Tiếp nhận & phân phối</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown 
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      openSections.distribution ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </button>

              {/* Submenu Items under Tiếp nhận & phân phối */}
              {openSections.distribution && !isCollapsed && (
                <div className="pl-3.5 ml-3 border-l-2 border-slate-200/80 space-y-0.5 py-1 my-0.5 text-xs">
                  {/* Cấu hình phân phối */}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="truncate">Cấu hình phân phối</span>
                  </button>

                  {/* Phân phối cuộc gọi */}
                  <button
                    onClick={() => onSelectView('routing-config')}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors cursor-pointer ${
                      currentView === 'routing-config'
                        ? 'text-[#f25621] font-semibold bg-orange-50/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'routing-config' ? 'bg-[#f25621]' : 'bg-slate-300'}`}></span>
                    <span className="truncate">Phân phối cuộc gọi</span>
                  </button>

                  {/* Phân phối chat */}
                  <button
                    onClick={() => onSelectView('chat-routing-config')}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors cursor-pointer ${
                      currentView === 'chat-routing-config'
                        ? 'text-[#f25621] font-semibold bg-orange-50/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'chat-routing-config' ? 'bg-[#f25621]' : 'bg-slate-300'}`}></span>
                    <span className="truncate">Phân phối chat</span>
                  </button>

                  {/* Cấu hình Input Chat Routing */}
                  <button
                    onClick={() => onSelectView('chat-routing-input')}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors cursor-pointer ${
                      currentView === 'chat-routing-input'
                        ? 'text-[#f25621] font-semibold bg-orange-50/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="Cấu hình Input Chat Routing (Type, Value, Output)"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'chat-routing-input' ? 'bg-[#f25621]' : 'bg-slate-300'}`}></span>
                    <span className="truncate">Cấu hình Input Chat</span>
                  </button>

                  {/* Cấu hình IVR */}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="truncate">Cấu hình IVR</span>
                  </button>

                  {/* Kịch bản IVR */}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="truncate">Kịch bản IVR</span>
                  </button>

                  {/* Cấu hình thời gian làm việc */}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="truncate">Cấu hình thời gian làm việc</span>
                  </button>

                  {/* Lịch làm việc */}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="truncate">Lịch làm việc</span>
                  </button>

                  {/* TÀI KHOẢN MẠNG XÃ HỘI (THE TARGET VIEW FROM USER IMAGE 1) */}
                  <button
                    onClick={() => onSelectView('social-media-channels')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                      currentView === 'social-media-channels'
                        ? 'bg-slate-800 text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title="Cấu hình tài khoản mạng xã hội (Facebook, Zalo, SMS...)"
                  >
                    <Share2 className={`w-3.5 h-3.5 shrink-0 ${currentView === 'social-media-channels' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                    <span className="truncate font-semibold">Tài khoản mạng xã hội</span>
                  </button>

                  {/* CẤU HÌNH TIN NHẮN TỰ ĐỘNG (SLA & ĐÓNG PHIÊN) */}
                  <button
                    onClick={() => onSelectView('auto-messages-config')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                      currentView === 'auto-messages-config'
                        ? 'bg-slate-800 text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title="Cấu hình tin nhắn tự động khi quá thời gian chờ tiếp nhận và tự động đóng phiên"
                  >
                    <Clock className={`w-3.5 h-3.5 shrink-0 ${currentView === 'auto-messages-config' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                    <span className="truncate font-semibold">Tin nhắn tự động (SLA)</span>
                  </button>

                  {/* Danh bạ */}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="truncate">Danh bạ</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Chế độ làm việc"
            >
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Chế độ làm việc</span>}
            </button>

            <button
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Quản lý cuộc gọi"
            >
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Quản lý cuộc gọi</span>}
            </button>

            <button
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Báo cáo workmode"
            >
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Báo cáo workmode</span>}
            </button>
          </div>
        </div>

        {/* Section: Call Routing (Primary Module) */}
        <div className="pt-2">
          <button
            onClick={() => toggleSection('callRouting')}
            className={`w-full flex items-center justify-between p-2 rounded-md bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Call Routing"
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-indigo-600 shrink-0" />
              {!isCollapsed && <span className="font-medium text-indigo-900">Call Routing</span>}
            </div>
            {!isCollapsed && (
              <ChevronUp className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${!openSections.callRouting ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Submenu for Call Routing */}
          {(openSections.callRouting || isCollapsed) && (
            <div className={`mt-1 space-y-0.5 ${!isCollapsed ? 'pl-2' : ''}`}>
              
              {/* Quản lý kỹ năng */}
              <button
                onClick={() => onSelectView('skill-management')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                  currentView === 'skill-management'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title="Quản lý kỹ năng"
              >
                <FileText className={`w-4 h-4 shrink-0 ${currentView === 'skill-management' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">Quản lý kỹ năng</span>}
              </button>

              {/* Quản lý nhóm kỹ năng */}
              <button
                onClick={() => onSelectView('skill-group')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                  currentView === 'skill-group'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title="Quản lý nhóm kỹ năng"
              >
                <FileText className={`w-4 h-4 shrink-0 ${currentView === 'skill-group' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">Quản lý nhóm kỹ năng</span>}
              </button>

              {/* Cấu hình định tuyến (Gồm 2 Submenu: 1. Call Routing, 2. Chat Routing) */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    toggleSection('routingSubmenu');
                    if (!isRoutingGroupActive) {
                      onSelectView('routing-config');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    isRoutingGroupActive
                      ? 'bg-orange-50/80 text-orange-950 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title="Cấu hình định tuyến (Gồm Call Routing & Chat Routing)"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className={`w-4 h-4 shrink-0 ${isRoutingGroupActive ? 'text-[#f25621]' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate font-medium">Cấu hình định tuyến</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown 
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        openSections.routingSubmenu ? 'rotate-180 text-[#f25621]' : ''
                      }`} 
                    />
                  )}
                </button>

                {/* 2 Submenus */}
                {openSections.routingSubmenu && !isCollapsed && (
                  <div className="pl-3.5 ml-3 border-l-2 border-slate-200/80 space-y-0.5 py-0.5 my-0.5">
                    {/* Submenu 1: Call Routing */}
                    <button
                      onClick={() => onSelectView('routing-config')}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                        currentView === 'routing-config'
                          ? 'bg-orange-50 text-[#f25621] font-bold border-l-2 border-[#f25621]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title="Cấu hình định tuyến Thoại (Call Routing)"
                    >
                      <PhoneCall className={`w-3.5 h-3.5 shrink-0 ${currentView === 'routing-config' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                      <span className="truncate">Call Routing</span>
                    </button>

                    {/* Submenu 2: Chat Routing */}
                    <button
                      onClick={() => onSelectView('chat-routing-config')}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                        currentView === 'chat-routing-config'
                          ? 'bg-orange-50 text-[#f25621] font-bold border-l-2 border-[#f25621]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title="Cấu hình định tuyến Chat (Chat Routing)"
                    >
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${currentView === 'chat-routing-config' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                      <span className="truncate">Chat Routing</span>
                    </button>

                    {/* Submenu: Cấu hình Input Chat Routing */}
                    <button
                      onClick={() => onSelectView('chat-routing-input')}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                        currentView === 'chat-routing-input'
                          ? 'bg-orange-50 text-[#f25621] font-bold border-l-2 border-[#f25621]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title="Cấu hình Input Chat Routing (Type, Value, Output)"
                    >
                      <Filter className={`w-3.5 h-3.5 shrink-0 ${currentView === 'chat-routing-input' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                      <span className="truncate">Cấu hình Input Chat</span>
                    </button>

                    {/* Submenu 3: Tin nhắn tự động (SLA & Đóng phiên) */}
                    <button
                      onClick={() => onSelectView('auto-messages-config')}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                        currentView === 'auto-messages-config'
                          ? 'bg-orange-50 text-[#f25621] font-bold border-l-2 border-[#f25621]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title="Cấu hình tin nhắn tự động khi quá thời gian chờ và tự động đóng phiên"
                    >
                      <Clock className={`w-3.5 h-3.5 shrink-0 ${currentView === 'auto-messages-config' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                      <span className="truncate">Tin nhắn tự động (SLA)</span>
                    </button>
                  </div>
                )}

                {/* Collapsed view quick-icons */}
                {isCollapsed && (
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => onSelectView('routing-config')}
                      title="Call Routing"
                      className={`p-1.5 rounded ${currentView === 'routing-config' ? 'bg-orange-100 text-[#f25621]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectView('chat-routing-config')}
                      title="Chat Routing"
                      className={`p-1.5 rounded ${currentView === 'chat-routing-config' ? 'bg-orange-100 text-[#f25621]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectView('chat-routing-input')}
                      title="Cấu hình Input Chat Routing"
                      className={`p-1.5 rounded ${currentView === 'chat-routing-input' ? 'bg-orange-100 text-[#f25621]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quản lý tập số đặc biệt */}
              <button
                onClick={() => onSelectView('special-numbers')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                  currentView === 'special-numbers'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title="Quản lý tập số đặc biệt"
              >
                <FileText className={`w-4 h-4 shrink-0 ${currentView === 'special-numbers' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">Quản lý tập số đặc biệt</span>}
              </button>

              {/* Bảng điều khiển thời gian thực */}
              <button
                onClick={() => onSelectView('realtime-monitor')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                  currentView === 'realtime-monitor'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title="Bảng điều khiển thời gian thực"
              >
                <FileText className={`w-4 h-4 shrink-0 ${currentView === 'realtime-monitor' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">Bảng điều khiển thời gia...</span>}
              </button>

              {/* Báo cáo hiệu suất định tuyến */}
              <button
                onClick={() => onSelectView('performance-report')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                  currentView === 'performance-report'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title="Báo cáo hiệu suất định tuyến"
              >
                <FileText className={`w-4 h-4 shrink-0 ${currentView === 'performance-report' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">Báo cáo hiệu suất định t...</span>}
              </button>

            </div>
          )}
        </div>

        {/* Section: Quản trị */}
        <div className="pt-2">
          <button
            onClick={() => toggleSection('admin')}
            className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Quản trị"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Quản trị</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.admin ? 'rotate-180' : ''}`} />
            )}
          </button>
        </div>

      </div>

      {/* Footer System Version */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Phiên bản v2.6.4</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-200 flex justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
        </div>
      )}
    </aside>
  );
}
