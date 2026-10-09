'use client';

import React from 'react';
import { X, Edit, PhoneCall, CheckCircle2, AlertCircle } from 'lucide-react';
import { RoutingConfigItem } from '@/lib/routing-data';

interface RoutingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RoutingConfigItem | null;
  onEdit: (item: RoutingConfigItem) => void;
}

function ReadOnlyToggle({ checked }: { checked: boolean }) {
  return (
    <div
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        checked ? 'bg-blue-600' : 'bg-slate-500'
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

export function RoutingDetailModal({ isOpen, onClose, data, onEdit }: RoutingDetailModalProps) {
  if (!isOpen || !data) return null;

  const isVipOn = data.routingVIP === 'Có';
  const isStdOn = data.routingStandard === 'Có';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header - Solid Orange with Title and Close Icon */}
        <div className="bg-[#f25621] px-6 py-3.5 flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-5 h-5 text-white/90" />
            <h2 className="text-base font-bold tracking-tight">
              Cấu hình định tuyến (Chi tiết)
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
          
          {/* Top Fields: Đầu số Ext & Lịch làm việc (để chung) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Đầu số Ext <span className="text-red-500">*</span>
              </label>
              <div className="w-full h-9.5 px-3 flex items-center text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded select-all">
                {data.extNumber}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lịch làm việc <span className="text-red-500">*</span>
              </label>
              <div className="w-full h-9.5 px-3 flex items-center text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded">
                {data.workingSchedule || 'Giờ hành chính tiêu chuẩn (T2 - T6: 08:00 - 17:30, T7 sáng)'}
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
                isVipOn ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isVipOn ? 'Đang kích hoạt' : 'Không sử dụng'}
              </span>
            </div>

            {isVipOn && (
              <div className="space-y-4 pl-1 border-l-2 border-blue-500/20 ml-4.5 py-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tập khách hàng VIP <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded">
                      {data.vipCustomerGroup || 'Tất cả khách hàng VIP'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phương thức định tuyến <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded">
                      {data.vipRoutingMethod || 'Kỹ năng'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {data.vipRoutingMethod === 'Nhóm kỹ năng' ? 'Tên nhóm kỹ năng' : 'Tên kỹ năng'} <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded">
                      {data.vipSkillName || data.skillGroup || 'CSKH VIP Priority'}
                    </div>
                  </div>
                </div>

                {/* Sub-toggle: Agent gần nhất */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <ReadOnlyToggle checked={Boolean(data.vipRecentAgent)} />
                    <span className="text-xs font-medium text-slate-700">
                      Agent gần nhất
                    </span>
                  </div>

                  {Boolean(data.vipRecentAgent) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phạm vi <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded">
                          {data.vipRecentScope || 'Tất cả'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Trong vòng <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="w-16 h-9 flex items-center justify-center text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded">
                            {data.vipRecentHours ?? 1}
                          </span>
                          <span className="text-xs text-slate-600">giờ gần nhất</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Đầu số Ext (Fallback) VIP */}
                <div className="pt-2 border-t border-blue-500/10">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Đầu số Ext (Fallback) VIP <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full h-9 px-3 flex items-center text-xs font-medium text-red-600 bg-red-50/50 border border-red-200 rounded">
                    {data.vipFallbackExt || data.fallbackExt || '1500 - VIP_Desk'}
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
                isStdOn ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isStdOn ? 'Đang kích hoạt' : 'Không sử dụng'}
              </span>
            </div>

            {isStdOn && (
              <div className="space-y-4 pl-1 border-l-2 border-slate-300/40 ml-4.5 py-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phương thức định tuyến <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded">
                      {data.stdRoutingMethod || 'Kỹ năng'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {data.stdRoutingMethod === 'Nhóm kỹ năng' ? 'Tên nhóm kỹ năng' : 'Tên kỹ năng'} <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded">
                      {data.stdSkillName || data.skillGroup || 'Chăm sóc khách hàng Tiếng Việt'}
                    </div>
                  </div>
                </div>

                {/* Sub-toggle: Agent gần nhất */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <ReadOnlyToggle checked={Boolean(data.stdRecentAgent)} />
                    <span className="text-xs font-medium text-slate-700">
                      Agent gần nhất
                    </span>
                  </div>

                  {Boolean(data.stdRecentAgent) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phạm vi <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full h-9 px-3 flex items-center text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded">
                          {data.stdRecentScope || 'Tất cả'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Trong vòng <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="w-16 h-9 flex items-center justify-center text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded">
                            {data.stdRecentHours ?? 1}
                          </span>
                          <span className="text-xs text-slate-600">giờ gần nhất</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Đầu số Ext (Fallback) Thường */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Đầu số Ext (Fallback) Thường <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full h-9 px-3 flex items-center text-xs font-medium text-red-600 bg-red-50/50 border border-red-200 rounded">
                    {data.stdFallbackExt || data.fallbackExt || '1100 - ACD-1100'}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Section: Cấu hình hàng đợi */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-3">
              Cấu hình hàng đợi
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 w-44">
                  Kích thước hàng đợi <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-20 h-8 flex items-center justify-center text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded">
                    {data.queueSize ?? 10}
                  </span>
                  <span className="text-xs text-slate-600">cuộc gọi</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 w-44">
                  Thời gian chờ hàng đợi <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-20 h-8 flex items-center justify-center text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded">
                    {data.queueWaitTime ?? data.maxWaitTime ?? 30}
                  </span>
                  <span className="text-xs text-slate-600">giây</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 w-44">
                  Thời gian đổ chuông
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-20 h-8 flex items-center justify-center text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded">
                    {data.ringTime ?? 20}
                  </span>
                  <span className="text-xs text-slate-600">giây</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
                <span className="text-xs font-medium text-slate-700 w-44 pt-1">
                  Agent <span className="text-red-500">*</span>
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded">
                    {data.assignedAgents && data.assignedAgents.length > 0 ? (
                      data.assignedAgents.map((agent) => (
                        <span
                          key={agent}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                        >
                          {agent}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Đang phân bổ theo kỹ năng: {data.skillGroup || 'Mặc định'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(data);
              }}
              className="inline-flex items-center gap-1.5 px-4.5 py-1.5 text-xs font-medium text-white bg-[#f25621] hover:bg-[#e04a18] rounded transition-colors cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Chỉnh sửa cấu hình này</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
