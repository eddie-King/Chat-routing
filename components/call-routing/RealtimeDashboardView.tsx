'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  PhoneCall, 
  Clock, 
  Users, 
  ArrowUpRight, 
  PhoneForwarded, 
  AlertCircle,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export function RealtimeDashboardView() {
  const [liveCalls, setLiveCalls] = useState([
    { id: 'CALL-1029', caller: '0909***456', ext: '9000 - IVR_Intro', queueTime: '00:14', status: 'Đang định tuyến', agent: 'Đang tìm Agent phù hợp...', priority: 'VIP' },
    { id: 'CALL-1030', caller: '0988***112', ext: '9001 - IVR_Sales', queueTime: '00:32', status: 'Đổ chuông', agent: 'Nguyễn Văn An (Ext 201)', priority: 'Thường' },
    { id: 'CALL-1031', caller: '0912***889', ext: '9003 - VIP_Direct', queueTime: '00:06', status: 'Đang kết nối', agent: 'Trần Thị Mai (Ext 205)', priority: 'VIP' },
    { id: 'CALL-1032', caller: '0977***654', ext: '9002 - IVR_Support', queueTime: '01:05', status: 'Chờ Fallback', agent: 'Chuyển sang 1300 - Support_Queue', priority: 'Thường' },
  ]);

  const [metrics, setMetrics] = useState({
    activeCalls: 18,
    waitingInQueue: 4,
    avgWaitSeconds: 14,
    agentsOnline: 42,
    agentsBusy: 31,
    fallbackTriggeredToday: 12
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#f25621] uppercase tracking-wide">
                BẢNG ĐIỀU KHIỂN THỜI GIAN THỰC (REAL-TIME ROUTING MONITOR)
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live 1s
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Giám sát trạng thái hàng đợi cuộc gọi, tải kênh định tuyến và phân bổ nhân sự trực tiếp
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1.5 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cập nhật</span>
            </button>
          </div>
        </div>

        {/* Live Metrics 4-grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Cuộc gọi đang phục vụ</span>
              <PhoneCall className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">{metrics.activeCalls}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">↑ 8% so với giờ trước</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Cuộc gọi chờ định tuyến</span>
              <Activity className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-2">{metrics.waitingInQueue}</p>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">Trong ngưỡng an toàn (&lt;10)</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Thời gian chờ TB (AWT)</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">{metrics.avgWaitSeconds}s</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">SLA đạt 96.4%</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Agent Sẵn sàng / Bận</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">
              <span className="text-emerald-600">{metrics.agentsOnline - metrics.agentsBusy}</span> / <span className="text-slate-400">{metrics.agentsOnline}</span>
            </p>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">{metrics.agentsBusy} đang đàm thoại</span>
          </div>
        </div>

        {/* Live Calls Table */}
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5">
            Danh sách Cuộc gọi Đang Xử lý qua Kênh Định Tuyến
          </h2>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2.5 px-4">Mã cuộc gọi</th>
                  <th className="py-2.5 px-4">Số người gọi</th>
                  <th className="py-2.5 px-4">Kênh Ext định tuyến</th>
                  <th className="py-2.5 px-4">Thời gian chờ</th>
                  <th className="py-2.5 px-4">Ưu tiên</th>
                  <th className="py-2.5 px-4">Trạng thái định tuyến</th>
                  <th className="py-2.5 px-4">Tổng đài viên gán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {liveCalls.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 text-slate-600">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">{c.id}</td>
                    <td className="py-2.5 px-4 font-mono">{c.caller}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{c.ext}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-orange-600">{c.queueTime}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.priority === 'VIP' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">{c.agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
