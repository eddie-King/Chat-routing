'use client';

import React from 'react';
import { X, MessageSquare, Edit, Layers, Building2, Bot, Filter } from 'lucide-react';
import { ChatRoutingConfigItem } from '@/lib/chat-routing-data';

interface ChatRoutingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChatRoutingConfigItem | null;
  onEdit?: (item: ChatRoutingConfigItem) => void;
}

function ReadOnlyToggle({ checked }: { checked: boolean }) {
  return (
    <div
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        checked ? 'bg-[#f25621]' : 'bg-slate-400'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </div>
  );
}

export function ChatRoutingDetailModal({ isOpen, onClose, item, onEdit }: ChatRoutingDetailModalProps) {
  if (!isOpen || !item) return null;

  const isVipOn = item.routingVIP === 'Có';
  const isStdOn = item.routingStandard === 'Có';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header - Solid Orange with Title and Close Icon */}
        <div className="bg-[#f25621] px-6 py-3.5 flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-white/90" />
            <h2 className="text-base font-bold tracking-tight">
              Chi tiết Cấu hình Hàng đợi & Định tuyến Chat
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/85 hover:text-white hover:bg-black/10 rounded-sm p-1 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto text-xs text-slate-700">
          
          {/* Top Fields: Tên hàng đợi Chat & Mã hàng đợi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên hàng đợi Chat (Queue Name)
              </label>
              <div className="w-full min-h-9.5 px-3 py-2 flex items-center text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded">
                {item.queueName || item.name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã hàng đợi Chat (Queue Code)
              </label>
              <div className="w-full h-9.5 px-3 flex items-center text-xs font-mono font-bold text-[#f25621] bg-orange-50/50 border border-orange-200 rounded">
                {item.queueCode}
              </div>
            </div>
          </div>

          {/* Trường Input & Lịch làm việc (để chung) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Input
              </label>
              <div className="w-full h-9.5 px-3 flex items-center text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded">
                {item.inputOutput || 'INPUT_FB_TECH_SUPPORT'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lịch làm việc
              </label>
              <div className="w-full h-9.5 px-3 flex items-center text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded">
                {item.workingSchedule || 'Giờ hành chính tiêu chuẩn (T2 - T6: 08:00 - 17:30, T7 sáng)'}
              </div>
            </div>
          </div>

          {/* Section: Routing VIP */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <ReadOnlyToggle checked={isVipOn} />
              <span className="text-xs font-semibold text-slate-800">
                Routing VIP
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isVipOn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isVipOn ? 'Đang kích hoạt' : 'Không sử dụng'}
              </span>
            </div>

            {isVipOn && (
              <div className="space-y-4 pl-1 border-l-2 border-[#f25621]/30 ml-4.5 py-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tập khách hàng VIP
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                      {item.vipCustomerGroup || 'Chưa thiết lập'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phương thức định tuyến
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                      {item.vipRoutingMethod || 'Chưa thiết lập'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {item.vipRoutingMethod === 'Nhóm kỹ năng' ? 'Tên nhóm kỹ năng' : 'Tên kỹ năng'}
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                      {item.vipSkillName || 'Chưa thiết lập'}
                    </div>
                  </div>
                </div>

                {/* Sub-toggle: Agent gần nhất (Sticky Agent) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <ReadOnlyToggle checked={Boolean(item.vipRecentAgent)} />
                    <span className="text-xs font-medium text-slate-700">
                      Agent gần nhất (Sticky Agent VIP)
                    </span>
                  </div>

                  {item.vipRecentAgent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phạm vi
                        </label>
                        <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                          {item.vipRecentScope || 'Tất cả'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Trong vòng
                        </label>
                        <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                          {item.vipRecentHours ?? 24} giờ gần nhất
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cấu hình hàng đợi VIP riêng */}
                <div className="pt-3 border-t border-orange-100 space-y-3">
                  <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <span>Cấu hình hàng đợi VIP</span>
                    <span className="text-[10px] font-medium text-[#f25621] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">Luồng ưu tiên</span>
                  </h4>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Kích thước hàng đợi VIP:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {item.vipQueueSize ?? item.queueSize ?? 15} phiên chat
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Thời gian chờ hàng đợi VIP:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {(item.vipQueueWaitTime && item.vipQueueWaitTime > 15 ? Math.round(item.vipQueueWaitTime / 60) : item.vipQueueWaitTime) ?? 2} phút
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Thời gian chờ Agent phản hồi:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {item.vipAgentTimeoutMin ?? item.agentTimeoutMin ?? 2} phút
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Thời gian chờ khách phản hồi:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {(item.vipCustomerTimeoutSec && item.vipCustomerTimeoutSec >= 30 ? Math.round(item.vipCustomerTimeoutSec / 60) : item.vipCustomerTimeoutSec) ?? 3} phút
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hành động (Fallback) VIP */}
                <div className="pt-3 border-t border-orange-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hành động (Fallback) VIP
                  </label>
                  <div className="w-full h-9 px-3 flex items-center text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded">
                    <Bot className="w-3.5 h-3.5 text-[#f25621] mr-2" />
                    {item.vipFallbackAction || item.fallbackAction || 'AI Bot Assistant (UniBot AI)'}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Section: Routing thường */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <ReadOnlyToggle checked={isStdOn} />
              <span className="text-xs font-semibold text-slate-800">
                Routing thường
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isStdOn ? 'bg-orange-100 text-[#f25621]' : 'bg-slate-100 text-slate-600'
              }`}>
                {isStdOn ? 'Đang kích hoạt' : 'Không sử dụng'}
              </span>
            </div>

            {isStdOn && (
              <div className="space-y-4 pl-1 border-l-2 border-slate-200 ml-4.5 py-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phương thức định tuyến
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                      {item.stdRoutingMethod || 'Chưa thiết lập'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {item.stdRoutingMethod === 'Nhóm kỹ năng' ? 'Tên nhóm kỹ năng' : 'Tên kỹ năng'}
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                      {item.stdSkillName || 'Chưa thiết lập'}
                    </div>
                  </div>
                </div>

                {/* Sub-toggle: Agent gần nhất */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <ReadOnlyToggle checked={Boolean(item.stdRecentAgent)} />
                    <span className="text-xs font-medium text-slate-700">
                      Agent gần nhất (Sticky Agent)
                    </span>
                  </div>

                  {item.stdRecentAgent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phạm vi
                        </label>
                        <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                          {item.stdRecentScope || 'Tất cả'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Trong vòng
                        </label>
                        <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded">
                          {item.stdRecentHours ?? 24} giờ gần nhất
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cấu hình hàng đợi Thường riêng */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Cấu hình hàng đợi thường</span>
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Luồng chuẩn</span>
                  </h4>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Kích thước hàng đợi thường:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {item.stdQueueSize ?? item.queueSize ?? 30} phiên chat
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Thời gian chờ hàng đợi thường:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {(item.stdQueueWaitTime && item.stdQueueWaitTime > 15 ? Math.round(item.stdQueueWaitTime / 60) : item.stdQueueWaitTime) ?? 5} phút
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Thời gian chờ Agent phản hồi:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {item.stdAgentTimeoutMin ?? item.agentTimeoutMin ?? 3} phút
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-56">
                        Thời gian chờ khách phản hồi:
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                        {(item.stdCustomerTimeoutSec && item.stdCustomerTimeoutSec >= 30 ? Math.round(item.stdCustomerTimeoutSec / 60) : item.stdCustomerTimeoutSec) ?? 5} phút
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hành động (Fallback) Thường */}
                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hành động (Fallback) Thường
                  </label>
                  <div className="w-full h-9 px-3 flex items-center text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded">
                    <Bot className="w-3.5 h-3.5 text-[#f25621] mr-2" />
                    {item.stdFallbackAction || item.fallbackAction || 'Chuyển Ticket Offline (Form liên hệ)'}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Metadata Bar */}
          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div>Ngày khởi tạo: <span className="font-medium text-slate-700">{item.createdAt}</span></div>
            <div>Trạng thái: <span className="font-semibold text-emerald-600">{item.status}</span></div>
          </div>

          {/* Footer Bar */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              Đóng
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#f25621] hover:bg-[#e04a18] rounded transition-colors cursor-pointer shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Chỉnh sửa cấu hình</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
