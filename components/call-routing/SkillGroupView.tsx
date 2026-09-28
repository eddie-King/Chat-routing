'use client';

import React, { useState } from 'react';
import { Plus, Users, Layers, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { SKILL_GROUPS } from '@/lib/routing-data';

export function SkillGroupView() {
  const [groups, setGroups] = useState([
    {
      id: 'grp-1',
      name: 'Nhóm Điều hướng IVR Cấp 1',
      agentTotal: 25,
      routingExtCount: 2,
      skillsIncluded: ['Chăm sóc khách hàng Tiếng Việt (Level 2+)', 'Kỹ năng Phục vụ Khách hàng VIP'],
      priority: 'Ưu tiên Cao',
      strategy: 'Least Busy'
    },
    {
      id: 'grp-2',
      name: 'Nhóm Kinh doanh Telesales',
      agentTotal: 30,
      routingExtCount: 1,
      skillsIncluded: ['Tư vấn Bán hàng & Chốt hợp đồng (Level 3+)', 'Tiếng Anh Giao tiếp Chuyên sâu'],
      priority: 'Tiêu chuẩn',
      strategy: 'Round Robin'
    },
    {
      id: 'grp-3',
      name: 'Nhóm Chăm sóc Khách hàng Đặc quyền (VIP)',
      agentTotal: 12,
      routingExtCount: 2,
      skillsIncluded: ['Kỹ năng Phục vụ Khách hàng VIP (Level 4+)', 'CSKH Đa kênh'],
      priority: 'Ưu tiên Tuyệt đối',
      strategy: 'Skill Best Match'
    },
    {
      id: 'grp-4',
      name: 'Nhóm CSKH Tier-2 (Kỹ thuật)',
      agentTotal: 16,
      routingExtCount: 1,
      skillsIncluded: ['Hỗ trợ Kỹ thuật Cấp 1', 'Hỗ trợ Kỹ thuật Cấp 2 (Mạng/Hạ tầng)'],
      priority: 'Tiêu chuẩn',
      strategy: 'Longest Idle'
    }
  ]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#f25621] uppercase tracking-wide">
              QUẢN LÝ NHÓM KỸ NĂNG (SKILL GROUPS)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổ hợp các kỹ năng thành nhóm tổng đài viên để liên kết trực tiếp với Cấu hình Định tuyến (Routing Ext)
            </p>
          </div>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer self-start sm:self-auto">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo nhóm kỹ năng mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(grp => (
            <div key={grp.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{grp.name}</h3>
                    <span className="text-[11px] text-slate-500">Mã nhóm: {grp.id}</span>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                  {grp.priority}
                </span>
              </div>

              <div className="mt-3.5 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Tổng số Agent trong nhóm:</span>
                  <span className="font-semibold text-slate-800">{grp.agentTotal} Agents</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Thuật toán phân bổ:</span>
                  <span className="font-medium text-indigo-700">{grp.strategy}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-1.5">Kỹ năng thành phần:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {grp.skillsIncluded.map((sk, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
