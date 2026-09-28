'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, CallRoutingSubView } from '@/components/layout/Sidebar';
import { RoutingConfigView } from '@/components/call-routing/RoutingConfigView';
import { ChatRoutingConfigView } from '@/components/chat-routing/ChatRoutingConfigView';
import { SkillManagementView } from '@/components/call-routing/SkillManagementView';
import { SkillGroupView } from '@/components/call-routing/SkillGroupView';
import { SpecialNumberView } from '@/components/call-routing/SpecialNumberView';
import { RealtimeDashboardView } from '@/components/call-routing/RealtimeDashboardView';
import { PerformanceReportView } from '@/components/call-routing/PerformanceReportView';
import { SocialMediaConfigView } from '@/components/social-media/SocialMediaConfigView';
import { AutoMessageConfigView } from '@/components/chat-routing/AutoMessageConfigView';

const VIEW_TITLES: Record<CallRoutingSubView, string> = {
  'routing-config': 'Cấu hình định tuyến Thoại (Call Routing)',
  'chat-routing-config': 'Cấu hình định tuyến Chat (Chat Routing)',
  'social-media-channels': 'Cấu hình Kênh Mạng Xã Hội',
  'auto-messages-config': 'Cấu hình Tin nhắn Tự động (SLA Chờ & Đóng phiên)',
  'skill-management': 'Quản lý kỹ năng',
  'skill-group': 'Quản lý nhóm kỹ năng',
  'special-numbers': 'Quản lý tập số đặc biệt',
  'realtime-monitor': 'Bảng điều khiển thời gian thực',
  'performance-report': 'Báo cáo hiệu suất định tuyến',
};

export default function Home() {
  const [currentView, setCurrentView] = useState<CallRoutingSubView>('routing-config');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <Header
          currentBreadcrumb={VIEW_TITLES[currentView]}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-[#f4f6f9]/60">
          {currentView === 'routing-config' && (
            <RoutingConfigView onSwitchToChatRouting={() => setCurrentView('chat-routing-config')} />
          )}
          {currentView === 'chat-routing-config' && (
            <ChatRoutingConfigView 
              onSwitchToCallRouting={() => setCurrentView('routing-config')} 
              onSwitchToSocialMedia={() => setCurrentView('social-media-channels')}
              onSwitchToAutoMessages={() => setCurrentView('auto-messages-config')}
            />
          )}
          {currentView === 'social-media-channels' && (
            <SocialMediaConfigView 
              onNavigateToChatRouting={() => setCurrentView('chat-routing-config')} 
              onNavigateToAutoMessages={() => setCurrentView('auto-messages-config')}
            />
          )}
          {currentView === 'auto-messages-config' && (
            <AutoMessageConfigView 
              onSwitchToCallRouting={() => setCurrentView('routing-config')} 
              onSwitchToChatRouting={() => setCurrentView('chat-routing-config')}
              onSwitchToSocialMedia={() => setCurrentView('social-media-channels')}
            />
          )}
          {currentView === 'skill-management' && <SkillManagementView />}
          {currentView === 'skill-group' && <SkillGroupView />}
          {currentView === 'special-numbers' && <SpecialNumberView />}
          {currentView === 'realtime-monitor' && <RealtimeDashboardView />}
          {currentView === 'performance-report' && <PerformanceReportView />}
        </main>
      </div>
    </div>
  );
}
