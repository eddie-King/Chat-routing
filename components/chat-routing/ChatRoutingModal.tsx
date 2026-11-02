'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, MessageSquare, ChevronDown } from 'lucide-react';
import { 
  ChatRoutingConfigItem, 
  ChatRoutingInputFilterItem,
  INITIAL_CHAT_INPUT_FILTERS,
  CHAT_SOURCES,
  CHAT_PAGES_BY_SOURCE,
  CHAT_OUTPUT_OPTIONS,
  CHAT_FALLBACK_OPTIONS, 
  CHAT_VIP_GROUPS,
  CHAT_ROUTING_METHODS,
  CHAT_SKILL_NAMES,
  CHAT_SKILL_GROUPS,
  CHAT_AGENT_SCOPE_OPTIONS
} from '@/lib/chat-routing-data';
import { getAvailableWorkingSchedules } from '@/lib/working-hours-data';
import { getVipCustomerGroups, subscribeCustomerSegments } from '@/lib/customer-segment-data';

interface ChatRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ChatRoutingConfigItem) => void;
  initialData: ChatRoutingConfigItem | null;
  onNavigateToInputConfig?: () => void;
  onNavigateToCustomerSegments?: () => void;
}

interface FormInnerProps {
  initialData: ChatRoutingConfigItem | null;
  onClose: () => void;
  onSave: (item: ChatRoutingConfigItem) => void;
  onNavigateToInputConfig?: () => void;
  onNavigateToCustomerSegments?: () => void;
}

function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
        checked ? 'bg-[#f25621]' : 'bg-slate-500'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function ChatRoutingModalForm({ initialData, onClose, onSave, onNavigateToInputConfig, onNavigateToCustomerSegments }: FormInnerProps) {
  // Top Field: Queue Name
  const [queueName, setQueueName] = useState(
    initialData?.queueName || initialData?.name || ''
  );

  // Lấy danh sách các Output điều kiện từ Cấu hình Input (đồng bộ với localStorage nếu có)
  const [availableInputFilters] = useState<ChatRoutingInputFilterItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unispace_chat_input_conditions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CHAT_INPUT_FILTERS;
  });

  // Danh sách các outcome (data từ Cấu hình Input) để chọn cho trường Input
  const initialInputOutput = initialData?.inputOutput;
  const outcomeOptions = useMemo(() => {
    const list: string[] = [];
    availableInputFilters.forEach(f => {
      if (f.output && !list.includes(f.output)) {
        list.push(f.output);
      }
    });
    if (initialInputOutput && !list.includes(initialInputOutput)) {
      list.unshift(initialInputOutput);
    }
    if (list.length === 0) {
      list.push('INPUT_FB_TECH_SUPPORT', 'INPUT_ZALO_VIP_DESK', 'INPUT_FB_SALES_ADVISORY');
    }
    return list;
  }, [availableInputFilters, initialInputOutput]);

  // Giá trị của trường Input chỉ cần chọn 1 trong list data từ outcome ví dụ: INPUT_FB_TECH_SUPPORT
  const [inputOutput, setInputOutput] = useState<string>(
    initialData?.inputOutput || outcomeOptions[0] || 'INPUT_FB_TECH_SUPPORT'
  );

  const [inputSource, setInputSource] = useState<'Facebook' | 'Zalo'>(() => {
    if (initialData?.inputSource === 'Zalo') return 'Zalo';
    return 'Facebook';
  });

  const [inputValues, setInputValues] = useState<string[]>(() => {
    if (initialData?.inputValues && initialData.inputValues.length > 0) {
      return initialData.inputValues;
    }
    return [];
  });

  const handleOutcomeChange = (newOutcome: string) => {
    setInputOutput(newOutcome);
    const matchedFilter = availableInputFilters.find(f => f.output === newOutcome);
    if (matchedFilter) {
      const filterValues = matchedFilter.values || matchedFilter.criteria?.map(c => c.value) || [];
      if (matchedFilter.type === 'Nguồn') {
        const isZaloOnly = filterValues.includes('Zalo') && !filterValues.includes('Facebook');
        setInputSource(isZaloOnly ? 'Zalo' : 'Facebook');
        setInputValues(filterValues);
      } else {
        const hasZalo = filterValues.some(v => v.toLowerCase().includes('zalo') || v.toLowerCase().includes('oa'));
        setInputSource(hasZalo ? 'Zalo' : 'Facebook');
        setInputValues(filterValues);
      }
    }
  };

  // Lịch làm việc (Chung cho quy tắc định tuyến)
  // Lịch làm việc (Chung cho quy tắc định tuyến)
  const [scheduleOptions] = useState<string[]>(() => getAvailableWorkingSchedules());
  const [workingSchedule, setWorkingSchedule] = useState<string>(
    initialData?.workingSchedule || scheduleOptions[0] || 'Giờ hành chính tiêu chuẩn (T2 - T6: 08:00 - 17:30, T7 sáng)'
  );

  // Cấu hình định tuyến chung (Kỹ năng, Nhóm kỹ năng)
  const [routingMethod, setRoutingMethod] = useState(
    initialData?.vipRoutingMethod || initialData?.stdRoutingMethod || CHAT_ROUTING_METHODS[0]
  );
  const [skillName, setSkillName] = useState(
    initialData?.skillGroup || initialData?.vipSkillName || initialData?.stdSkillName || CHAT_SKILL_NAMES[0]
  );

  // Agent gần nhất (Sticky Agent)
  const [recentAgent, setRecentAgent] = useState(
    initialData?.vipRecentAgent ?? initialData?.stdRecentAgent ?? false
  );
  const [recentScope, setRecentScope] = useState(
    initialData?.vipRecentScope || initialData?.stdRecentScope || CHAT_AGENT_SCOPE_OPTIONS[0]
  );
  const [recentHours, setRecentHours] = useState(
    initialData?.vipRecentHours ?? initialData?.stdRecentHours ?? 24
  );

  // Cấu hình hàng đợi chung
  const [queueWaitTime, setQueueWaitTime] = useState<number | string>(() => {
    if (initialData?.queueWaitTime !== undefined) {
      return initialData.queueWaitTime > 15 ? Math.round(initialData.queueWaitTime / 60) || 2 : initialData.queueWaitTime;
    }
    if (initialData?.vipQueueWaitTime !== undefined) {
      return initialData.vipQueueWaitTime > 15 ? Math.round(initialData.vipQueueWaitTime / 60) || 2 : initialData.vipQueueWaitTime;
    }
    if (initialData?.stdQueueWaitTime !== undefined) {
      return initialData.stdQueueWaitTime > 15 ? Math.round(initialData.stdQueueWaitTime / 60) || 2 : initialData.stdQueueWaitTime;
    }
    return 2;
  });

  const [queueSize, setQueueSize] = useState<number | string>(
    initialData?.queueSize ?? initialData?.stdQueueSize ?? initialData?.vipQueueSize ?? 25
  );

  const [agentTimeoutMin, setAgentTimeoutMin] = useState<number | string>(() => {
    return initialData?.agentTimeoutMin ?? initialData?.stdAgentTimeoutMin ?? initialData?.vipAgentTimeoutMin ?? 2;
  });

  const [customerTimeoutSec, setCustomerTimeoutSec] = useState<number | string>(() => {
    const rawVal = initialData?.customerTimeoutSec ?? initialData?.stdCustomerTimeoutSec ?? initialData?.vipCustomerTimeoutSec;
    if (rawVal !== undefined) {
      return rawVal >= 30 ? Math.round(rawVal / 60) || 3 : rawVal;
    }
    return 3;
  });

  // Hành động Fallback
  const [fallbackAction, setFallbackAction] = useState<string>(
    initialData?.fallbackAction || initialData?.vipFallbackAction || initialData?.stdFallbackAction || CHAT_FALLBACK_OPTIONS[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueName.trim()) return;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const matchedFilter = availableInputFilters.find(f => f.output === inputOutput);
    let curSource = inputSource;
    let curValues = inputValues;
    if (matchedFilter) {
      const filterValues = matchedFilter.values || matchedFilter.criteria?.map(c => c.value) || [];
      if (matchedFilter.type === 'Nguồn') {
        curSource = filterValues.includes('Zalo') && !filterValues.includes('Facebook') ? 'Zalo' : 'Facebook';
        curValues = filterValues;
      } else {
        curSource = filterValues.some(v => v.toLowerCase().includes('zalo') || v.toLowerCase().includes('oa')) ? 'Zalo' : 'Facebook';
        curValues = filterValues;
      }
    }

    const savedSources = [curSource];
    const firstPageName = curValues[0] || inputOutput;
    const selectedPageObj = (CHAT_PAGES_BY_SOURCE[curSource] || []).find(p => p.name === firstPageName);
    const pagesSummary = curValues.length > 1 
      ? `${curValues[0]} (+${curValues.length - 1})` 
      : (curValues[0] || inputOutput);

    const savedItem: ChatRoutingConfigItem = {
      id: initialData ? initialData.id : `chat-cfg-${Date.now()}`,
      queueName: queueName.trim(),
      queueCode: initialData?.queueCode || ('QUEUE_' + queueName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 30)),
      name: queueName.trim(),

      // Lịch làm việc chung
      workingSchedule,

      // Trường Luật định tuyến: Lưu giá trị outcome (ví dụ: INPUT_FB_TECH_SUPPORT)
      inputSource: curSource,
      inputValues: curValues.length > 0 ? curValues : [inputOutput],
      inputPage: firstPageName,
      inputPageId: selectedPageObj?.id || '',
      inputOutput: inputOutput.trim(),
      branch: undefined,

      chatSources: savedSources,
      intakeChannels: savedSources,
      channel: inputOutput.trim(),
      nluIntents: initialData?.nluIntents || [],

      // Cấu hình phân phối & hàng đợi chung
      routingVIP: 'Có',
      vipRoutingMethod: routingMethod,
      vipSkillName: skillName,
      vipRecentAgent: recentAgent,
      vipRecentScope: recentAgent ? recentScope : undefined,
      vipRecentHours: recentAgent ? Number(recentHours) : undefined,
      vipFallbackAction: fallbackAction,
      vipQueueSize: Number(queueSize) || 25,
      vipQueueWaitTime: Number(queueWaitTime) || 2,
      vipAgentTimeoutMin: Number(agentTimeoutMin) || 2,
      vipCustomerTimeoutSec: Number(customerTimeoutSec) || 3,

      routingStandard: 'Có',
      stdRoutingMethod: routingMethod,
      stdSkillName: skillName,
      stdRecentAgent: recentAgent,
      stdRecentScope: recentAgent ? recentScope : undefined,
      stdRecentHours: recentAgent ? Number(recentHours) : undefined,
      stdFallbackAction: fallbackAction,
      stdQueueSize: Number(queueSize) || 25,
      stdQueueWaitTime: Number(queueWaitTime) || 2,
      stdAgentTimeoutMin: Number(agentTimeoutMin) || 2,
      stdCustomerTimeoutSec: Number(customerTimeoutSec) || 3,

      fallbackAction: fallbackAction,

      // Compatibility shared fields
      queueSize: Number(queueSize) || 25,
      queueWaitTime: Number(queueWaitTime) || 2,
      agentTimeoutMin: Number(agentTimeoutMin) || 2,
      customerTimeoutSec: Number(customerTimeoutSec) || 3,

      strategy: 'Skill-based',
      skillGroup: skillName,
      slaFirstResponseSec: initialData?.slaFirstResponseSec || 30,
      autoGreeting: initialData?.autoGreeting ?? true,
      status: initialData?.status || 'Hoạt động',
      createdAt: initialData ? initialData.createdAt : formattedDate,
      description: initialData?.description || `Định tuyến ${inputSource} (${pagesSummary}) -> ${inputOutput}`,
      note: initialData?.note || ''
    };

    onSave(savedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header - Solid Orange with Title and Close Icon */}
        <div className="bg-[#f25621] px-6 py-3.5 flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white/90" />
            <h2 className="text-base font-bold tracking-tight">Cấu hình định tuyến Chat</h2>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Tên hàng đợi (Queue Name) * */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên hàng đợi Chat (Queue Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={queueName}
              onChange={(e) => setQueueName(e.target.value)}
              placeholder="VD: Hàng đợi Hỗ trợ Kỹ thuật & Báo sự cố"
              className="w-full h-9.5 px-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors"
              required
            />
          </div>

          {/* Row 2: Trường Luật định tuyến & Lịch làm việc (để chung) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Luật định tuyến <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={inputOutput}
                  onChange={(e) => handleOutcomeChange(e.target.value)}
                  className="w-full h-9.5 px-3 pr-8 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer appearance-none font-mono"
                  required
                >
                  {outcomeOptions.map((outcome) => (
                    <option key={outcome} value={outcome}>
                      {outcome}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lịch làm việc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={workingSchedule}
                  onChange={(e) => setWorkingSchedule(e.target.value)}
                  className="w-full h-9.5 px-3 pr-8 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer appearance-none"
                  required
                >
                  {scheduleOptions.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Thời gian chờ hàng đợi (hàng ngang) */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Thời gian chờ hàng đợi <span className="text-red-500">*</span>:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={queueWaitTime}
                onChange={(e) => setQueueWaitTime(e.target.value)}
                className="w-20 h-9 px-3 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors"
                required
              />
              <span className="text-xs text-slate-600">phút</span>
            </div>
          </div>

          {/* Cấu hình phân phối & Hàng đợi tiếp nhận chung */}
          <div className="space-y-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Cấu hình phân phối & Hàng đợi tiếp nhận
              </h3>
            </div>

            {/* 2 Columns: Phương thức định tuyến *, Tên kỹ năng * */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phương thức định tuyến <span className="text-red-500">*</span>
                </label>
                <select
                  value={routingMethod}
                  onChange={(e) => {
                    const newMethod = e.target.value;
                    setRoutingMethod(newMethod);
                    if (newMethod === 'Nhóm kỹ năng') {
                      if (!CHAT_SKILL_GROUPS.includes(skillName)) {
                        setSkillName(CHAT_SKILL_GROUPS[0]);
                      }
                    } else {
                      if (!CHAT_SKILL_NAMES.includes(skillName)) {
                        setSkillName(CHAT_SKILL_NAMES[0]);
                      }
                    }
                  }}
                  className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                >
                  {CHAT_ROUTING_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {routingMethod === 'Nhóm kỹ năng' ? 'Tên nhóm kỹ năng' : 'Tên kỹ năng'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                >
                  {(routingMethod === 'Nhóm kỹ năng' ? CHAT_SKILL_GROUPS : CHAT_SKILL_NAMES).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-toggle: Agent gần nhất (Sticky Agent) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={recentAgent}
                  onChange={setRecentAgent}
                  id="chat-recent-agent-toggle"
                />
                <label 
                  htmlFor="chat-recent-agent-toggle" 
                  className="text-xs font-medium text-slate-700 cursor-pointer select-none"
                >
                  Agent gần nhất (Sticky Agent)
                </label>
              </div>

              {recentAgent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-[#f25621]/30 ml-2 py-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phạm vi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={recentScope}
                      onChange={(e) => setRecentScope(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {CHAT_AGENT_SCOPE_OPTIONS.map((sc) => (
                        <option key={sc} value={sc}>{sc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Trong vòng <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={recentHours}
                        onChange={(e) => setRecentHours(Number(e.target.value))}
                        className="w-20 h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors text-center"
                      />
                      <span className="text-xs text-slate-600">giờ gần nhất</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cấu hình hàng đợi */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                Thông số hàng đợi
              </h4>

              <div className="space-y-3">
                {/* Kích thước hàng đợi * */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-700 w-52">
                    Kích thước hàng đợi <span className="text-red-500">*</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={queueSize}
                      onChange={(e) => setQueueSize(e.target.value)}
                      className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                      required
                    />
                    <span className="text-xs text-slate-600">phiên chat</span>
                  </div>
                </div>

                {/* Thời gian chờ Agent phản hồi */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-700 w-52">
                    Thời gian chờ Agent phản hồi
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={agentTimeoutMin}
                      onChange={(e) => setAgentTimeoutMin(e.target.value)}
                      className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                    />
                    <span className="text-xs text-slate-600">phút</span>
                  </div>
                </div>

                {/* Thời gian chờ khách phản hồi */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-700 w-52">
                    Thời gian chờ khách phản hồi
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customerTimeoutSec}
                      onChange={(e) => setCustomerTimeoutSec(e.target.value)}
                      className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                    />
                    <span className="text-xs text-slate-600">phút</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hành động (Fallback) */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hành động (Fallback) <span className="text-red-500">*</span>
              </label>
              <select
                value={fallbackAction}
                onChange={(e) => setFallbackAction(e.target.value)}
                className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
              >
                {CHAT_FALLBACK_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs font-medium text-white bg-[#f25621] hover:bg-[#e04a18] rounded transition-colors cursor-pointer shadow-xs"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ChatRoutingModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  onNavigateToInputConfig,
  onNavigateToCustomerSegments 
}: ChatRoutingModalProps) {
  if (!isOpen) return null;
  return (
    <ChatRoutingModalForm 
      key={initialData?.id || 'new'} 
      initialData={initialData} 
      onClose={onClose} 
      onSave={onSave} 
      onNavigateToInputConfig={onNavigateToInputConfig}
      onNavigateToCustomerSegments={onNavigateToCustomerSegments}
    />
  );
}

