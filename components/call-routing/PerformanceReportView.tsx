'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Filter, ArrowUpRight } from 'lucide-react';

export function PerformanceReportView() {
  const [reportRange, setReportRange] = useState('7 ngày qua');

  const routingStats = [
    { ext: '9000 - IVR_Intro', totalCalls: 12480, routedSuccess: 11950, fallbackRate: '4.2%', avgWaitSec: 12, vipShare: '18%' },
    { ext: '9001 - IVR_Sales', totalCalls: 8650, routedSuccess: 8320, fallbackRate: '3.8%', avgWaitSec: 15, vipShare: '24%' },
    { ext: '9002 - IVR_Support', totalCalls: 14200, routedSuccess: 13180, fallbackRate: '7.1%', avgWaitSec: 28, vipShare: '9%' },
    { ext: '9003 - VIP_Direct', totalCalls: 1980, routedSuccess: 1965, fallbackRate: '0.7%', avgWaitSec: 6, vipShare: '100%' },
    { ext: '9004 - AfterHours_Router', totalCalls: 3120, routedSuccess: 2890, fallbackRate: '7.3%', avgWaitSec: 42, vipShare: '5%' },
    { ext: '9005 - CSKH_Hotline_247', totalCalls: 5400, routedSuccess: 5210, fallbackRate: '3.5%', avgWaitSec: 14, vipShare: '30%' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#f25621] uppercase tracking-wide">
              BÁO CÁO HIỆU SUẤT ĐỊNH TUYẾN (ROUTING PERFORMANCE REPORT)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích tỷ lệ phân bổ thành công, tần suất kích hoạt Fallback và thời gian chờ theo từng đầu số Ext
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              className="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 cursor-pointer"
            >
              <option value="Hôm nay">Hôm nay</option>
              <option value="7 ngày qua">7 ngày qua</option>
              <option value="Tháng này">Tháng này</option>
              <option value="Quý này">Quý này</option>
            </select>

            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Summary High-Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4">
            <span className="text-xs text-emerald-800 font-medium">Tỷ lệ định tuyến thành công</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">95.4%</p>
            <span className="text-[11px] text-emerald-600">Đạt mục tiêu vận hành (&gt;95%)</span>
          </div>

          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
            <span className="text-xs text-blue-800 font-medium">Tổng lượng cuộc gọi qua Call Routing</span>
            <p className="text-2xl font-bold text-blue-700 mt-1">45,830</p>
            <span className="text-[11px] text-blue-600">Trung bình ~6,500 cuộc/ngày</span>
          </div>

          <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
            <span className="text-xs text-orange-800 font-medium">Tỷ lệ kích hoạt Fallback Ext</span>
            <p className="text-2xl font-bold text-orange-600 mt-1">4.6%</p>
            <span className="text-[11px] text-orange-600">Giảm 1.2% so với tuần trước</span>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4">Đầu số Ext định tuyến</th>
                <th className="py-3 px-4">Tổng cuộc gọi</th>
                <th className="py-3 px-4">Định tuyến thành công</th>
                <th className="py-3 px-4">Tỷ lệ Fallback</th>
                <th className="py-3 px-4">Thời gian chờ TB</th>
                <th className="py-3 px-4">Tỷ trọng cuộc gọi VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {routingStats.map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 text-slate-600">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{st.ext}</td>
                  <td className="py-2.5 px-4 font-mono font-medium">{st.totalCalls.toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-700 font-medium">{st.routedSuccess.toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-mono text-orange-600 font-medium">{st.fallbackRate}</td>
                  <td className="py-2.5 px-4 font-mono">{st.avgWaitSec} giây</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {st.vipShare}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
