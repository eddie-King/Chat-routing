'use client';

import React, { useState, useMemo } from 'react';
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

interface ChatRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ChatRoutingConfigItem) => void;
  initialData: ChatRoutingConfigItem | null;
  onNavigateToInputConfig?: () => void;
}

interface FormInnerProps {
  initialData: ChatRoutingConfigItem | null;
  onClose: () => void;
  onSave: (item: ChatRoutingConfigItem) => void;
  onNavigateToInputConfig?: () => void;
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

function ChatRoutingModalForm({ initialData, onClose, onSave, onNavigateToInputConfig }: FormInnerProps) {
  // Top Fields: Queue Name & Queue Code
  const [queueName, setQueueName] = useState(
    initialData?.queueName || initialData?.name || ''
  );
  const [queueCode, setQueueCode] = useState(
    initialData?.queueCode || ''
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
      if (matchedFilter.type === 'Nguồn') {
        const isZaloOnly = matchedFilter.values.includes('Zalo') && !matchedFilter.values.includes('Facebook');
        setInputSource(isZaloOnly ? 'Zalo' : 'Facebook');
        setInputValues(matchedFilter.values);
      } else {
        const hasZalo = matchedFilter.values.some(v => v.toLowerCase().includes('zalo') || v.toLowerCase().includes('oa'));
        setInputSource(hasZalo ? 'Zalo' : 'Facebook');
        setInputValues(matchedFilter.values);
      }
    }
  };

  // Lịch làm việc (Chung cho quy tắc định tuyến)
  const [scheduleOptions] = useState<string[]>(() => getAvailableWorkingSchedules());
  const [workingSchedule, setWorkingSchedule] = useState<string>(
    initialData?.workingSchedule || scheduleOptions[0] || 'Giờ hành chính tiêu chuẩn (T2 - T6: 08:00 - 17:30, T7 sáng)'
  );

  // VIP Routing Section
  const [isVipRouting, setIsVipRouting] = useState(initialData ? initialData.routingVIP === 'Có' : true);
  const [vipCustomerGroup, setVipCustomerGroup] = useState(initialData?.vipCustomerGroup || CHAT_VIP_GROUPS[0]);
  const [vipRoutingMethod, setVipRoutingMethod] = useState(initialData?.vipRoutingMethod || CHAT_ROUTING_METHODS[0]);
  const [vipSkillName, setVipSkillName] = useState(initialData?.vipSkillName || CHAT_SKILL_NAMES[0]);
  const [vipRecentAgent, setVipRecentAgent] = useState(initialData?.vipRecentAgent ?? true);
  const [vipRecentScope, setVipRecentScope] = useState(initialData?.vipRecentScope || CHAT_AGENT_SCOPE_OPTIONS[0]);
  const [vipRecentHours, setVipRecentHours] = useState(initialData?.vipRecentHours ?? 24);
  const [vipFallbackAction, setVipFallbackAction] = useState<string>(
    initialData?.vipFallbackAction || initialData?.fallbackAction || CHAT_FALLBACK_OPTIONS[0]
  );

  // Cấu hình Hàng đợi VIP riêng (Kích thước, Thời gian chờ, Timeout phản hồi)
  const [vipQueueSize, setVipQueueSize] = useState<number | string>(
    initialData?.vipQueueSize ?? (initialData?.queueSize ? Math.min(initialData.queueSize, 15) : 15)
  );
  const [vipQueueWaitTime, setVipQueueWaitTime] = useState<number | string>(() => {
    if (initialData?.vipQueueWaitTime !== undefined) {
      return initialData.vipQueueWaitTime > 15 ? Math.round(initialData.vipQueueWaitTime / 60) || 2 : initialData.vipQueueWaitTime;
    }
    return 2;
  });
  const [vipAgentTimeoutMin, setVipAgentTimeoutMin] = useState<number | string>(() => {
    if (initialData?.vipAgentTimeoutMin !== undefined) {
      return initialData.vipAgentTimeoutMin;
    }
    return initialData?.agentTimeoutMin ?? 2;
  });
  const [vipCustomerTimeoutSec, setVipCustomerTimeoutSec] = useState<number | string>(() => {
    if (initialData?.vipCustomerTimeoutSec !== undefined) {
      return initialData.vipCustomerTimeoutSec >= 30 ? Math.round(initialData.vipCustomerTimeoutSec / 60) || 3 : initialData.vipCustomerTimeoutSec;
    }
    return 3;
  });

  // Standard Routing Section
  const [isStdRouting, setIsStdRouting] = useState(initialData ? initialData.routingStandard === 'Có' : true);
  const [stdRoutingMethod, setStdRoutingMethod] = useState(initialData?.stdRoutingMethod || CHAT_ROUTING_METHODS[0]);
  const [stdSkillName, setStdSkillName] = useState(initialData?.stdSkillName || CHAT_SKILL_NAMES[1]);
  const [stdRecentAgent, setStdRecentAgent] = useState(initialData?.stdRecentAgent ?? false);
  const [stdRecentScope, setStdRecentScope] = useState(initialData?.stdRecentScope || CHAT_AGENT_SCOPE_OPTIONS[0]);
  const [stdRecentHours, setStdRecentHours] = useState(initialData?.stdRecentHours ?? 24);
  const [stdFallbackAction, setStdFallbackAction] = useState<string>(
    initialData?.stdFallbackAction || initialData?.fallbackAction || CHAT_FALLBACK_OPTIONS[1] || CHAT_FALLBACK_OPTIONS[0]
  );

  // Cấu hình Hàng đợi Thường riêng (Kích thước, Thời gian chờ, Timeout phản hồi)
  const [stdQueueSize, setStdQueueSize] = useState<number | string>(
    initialData?.stdQueueSize ?? initialData?.queueSize ?? 30
  );
  const [stdQueueWaitTime, setStdQueueWaitTime] = useState<number | string>(() => {
    if (initialData?.stdQueueWaitTime !== undefined) {
      return initialData.stdQueueWaitTime > 15 ? Math.round(initialData.stdQueueWaitTime / 60) || 5 : initialData.stdQueueWaitTime;
    }
    return 5;
  });
  const [stdAgentTimeoutMin, setStdAgentTimeoutMin] = useState<number | string>(() => {
    if (initialData?.stdAgentTimeoutMin !== undefined) {
      return initialData.stdAgentTimeoutMin;
    }
    return initialData?.agentTimeoutMin ?? 3;
  });
  const [stdCustomerTimeoutSec, setStdCustomerTimeoutSec] = useState<number | string>(() => {
    if (initialData?.stdCustomerTimeoutSec !== undefined) {
      return initialData.stdCustomerTimeoutSec >= 30 ? Math.round(initialData.stdCustomerTimeoutSec / 60) || 5 : initialData.stdCustomerTimeoutSec;
    }
    return 5;
  });

  // Fallback chung
  const fallbackAction = isVipRouting ? vipFallbackAction : stdFallbackAction;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueName.trim() || !queueCode.trim()) return;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const matchedFilter = availableInputFilters.find(f => f.output === inputOutput);
    let curSource = inputSource;
    let curValues = inputValues;
    if (matchedFilter) {
      if (matchedFilter.type === 'Nguồn') {
        curSource = matchedFilter.values.includes('Zalo') && !matchedFilter.values.includes('Facebook') ? 'Zalo' : 'Facebook';
        curValues = matchedFilter.values;
      } else {
        curSource = matchedFilter.values.some(v => v.toLowerCase().includes('zalo') || v.toLowerCase().includes('oa')) ? 'Zalo' : 'Facebook';
        curValues = matchedFilter.values;
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
      queueCode: queueCode.trim(),
      name: queueName.trim(),

      // Lịch làm việc chung
      workingSchedule,

      // Trường Input: Lưu giá trị outcome (ví dụ: INPUT_FB_TECH_SUPPORT)
      inputSource: curSource,
      inputValues: curValues.length > 0 ? curValues : [inputOutput],
      inputPage: firstPageName,
      inputPageId: selectedPageObj?.id || '',
      inputOutput: inputOutput.trim(),
      branch: undefined, // Bỏ trường chi nhánh

      chatSources: savedSources,
      intakeChannels: savedSources,
      channel: inputOutput.trim(),
      nluIntents: initialData?.nluIntents || [],

      // VIP Routing & Queue VIP riêng
      routingVIP: isVipRouting ? 'Có' : 'Không',
      vipCustomerGroup: isVipRouting ? vipCustomerGroup : undefined,
      vipRoutingMethod: isVipRouting ? vipRoutingMethod : undefined,
      vipSkillName: isVipRouting ? vipSkillName : undefined,
      vipRecentAgent: isVipRouting ? vipRecentAgent : false,
      vipRecentScope: isVipRouting && vipRecentAgent ? vipRecentScope : undefined,
      vipRecentHours: isVipRouting && vipRecentAgent ? Number(vipRecentHours) : undefined,
      vipFallbackAction: isVipRouting ? vipFallbackAction : undefined,
      vipQueueSize: isVipRouting ? (Number(vipQueueSize) || 15) : undefined,
      vipQueueWaitTime: isVipRouting ? (Number(vipQueueWaitTime) || 2) : undefined,
      vipAgentTimeoutMin: isVipRouting ? (Number(vipAgentTimeoutMin) || 2) : undefined,
      vipCustomerTimeoutSec: isVipRouting ? (Number(vipCustomerTimeoutSec) || 3) : undefined,

      // Standard Routing & Queue Thường riêng
      routingStandard: isStdRouting ? 'Có' : 'Không',
      stdRoutingMethod: isStdRouting ? stdRoutingMethod : undefined,
      stdSkillName: isStdRouting ? stdSkillName : undefined,
      stdRecentAgent: isStdRouting ? stdRecentAgent : false,
      stdRecentScope: isStdRouting && stdRecentAgent ? stdRecentScope : undefined,
      stdRecentHours: isStdRouting && stdRecentAgent ? Number(stdRecentHours) : undefined,
      stdFallbackAction: isStdRouting ? stdFallbackAction : undefined,
      stdQueueSize: isStdRouting ? (Number(stdQueueSize) || 30) : undefined,
      stdQueueWaitTime: isStdRouting ? (Number(stdQueueWaitTime) || 5) : undefined,
      stdAgentTimeoutMin: isStdRouting ? (Number(stdAgentTimeoutMin) || 3) : undefined,
      stdCustomerTimeoutSec: isStdRouting ? (Number(stdCustomerTimeoutSec) || 5) : undefined,

      fallbackAction: isVipRouting ? vipFallbackAction : (isStdRouting ? stdFallbackAction : CHAT_FALLBACK_OPTIONS[0]),

      // Compatibility shared fields
      queueSize: isStdRouting ? (Number(stdQueueSize) || 30) : (Number(vipQueueSize) || 15),
      queueWaitTime: isStdRouting ? (Number(stdQueueWaitTime) || 5) : (Number(vipQueueWaitTime) || 2),
      agentTimeoutMin: isStdRouting ? (Number(stdAgentTimeoutMin) || 3) : (Number(vipAgentTimeoutMin) || 2),
      customerTimeoutSec: isStdRouting ? (Number(stdCustomerTimeoutSec) || 5) : (Number(vipCustomerTimeoutSec) || 3),

      strategy: initialData?.strategy || 'Skill-based',
      skillGroup: isVipRouting ? vipSkillName : (isStdRouting ? stdSkillName : 'Mặc định'),
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
          {/* Row 1: Tên hàng đợi (Queue Name) * & Mã hàng đợi (Queue Code) * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã hàng đợi Chat (Queue Code) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={queueCode}
                onChange={(e) => setQueueCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                placeholder="VD: QUEUE_TECH_SUPPORT"
                className="w-full h-9.5 px-3 text-xs font-mono font-semibold text-[#f25621] bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Row 2: Trường Input & Lịch làm việc (để chung) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Input <span className="text-red-500">*</span>
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

          {/* Section: Routing VIP (Bao gồm Cấu hình Hàng đợi VIP riêng) */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={isVipRouting}
                onChange={setIsVipRouting}
                id="chat-routing-vip-toggle"
              />
              <label 
                htmlFor="chat-routing-vip-toggle" 
                className="text-xs font-semibold text-slate-800 cursor-pointer select-none"
              >
                Routing VIP
              </label>
            </div>

            {isVipRouting && (
              <div className="space-y-4 pl-1 border-l-2 border-[#f25621]/30 ml-4.5 py-1">
                {/* 3 Columns: Tập khách hàng VIP *, Phương thức định tuyến *, Tên kỹ năng * */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tập khách hàng VIP <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vipCustomerGroup}
                      onChange={(e) => setVipCustomerGroup(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {CHAT_VIP_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phương thức định tuyến <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vipRoutingMethod}
                      onChange={(e) => {
                        const newMethod = e.target.value;
                        setVipRoutingMethod(newMethod);
                        if (newMethod === 'Nhóm kỹ năng') {
                          if (!CHAT_SKILL_GROUPS.includes(vipSkillName)) {
                            setVipSkillName(CHAT_SKILL_GROUPS[0]);
                          }
                        } else {
                          if (!CHAT_SKILL_NAMES.includes(vipSkillName)) {
                            setVipSkillName(CHAT_SKILL_NAMES[0]);
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
                      {vipRoutingMethod === 'Nhóm kỹ năng' ? 'Tên nhóm kỹ năng' : 'Tên kỹ năng'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vipSkillName}
                      onChange={(e) => setVipSkillName(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {(vipRoutingMethod === 'Nhóm kỹ năng' ? CHAT_SKILL_GROUPS : CHAT_SKILL_NAMES).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-toggle: Agent gần nhất (Sticky Agent) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      checked={vipRecentAgent}
                      onChange={setVipRecentAgent}
                      id="chat-vip-recent-agent-toggle"
                    />
                    <label 
                      htmlFor="chat-vip-recent-agent-toggle" 
                      className="text-xs font-medium text-slate-700 cursor-pointer select-none"
                    >
                      Agent gần nhất (Sticky Agent VIP)
                    </label>
                  </div>

                  {vipRecentAgent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phạm vi <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={vipRecentScope}
                          onChange={(e) => setVipRecentScope(e.target.value)}
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
                            value={vipRecentHours}
                            onChange={(e) => setVipRecentHours(Number(e.target.value))}
                            className="w-20 h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors text-center"
                          />
                          <span className="text-xs text-slate-600">giờ gần nhất</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cấu hình hàng đợi VIP riêng */}
                <div className="pt-3 border-t border-orange-100 space-y-3">
                  <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <span>Cấu hình hàng đợi VIP</span>
                    <span className="text-[10px] font-medium text-[#f25621] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">Dành riêng luồng VIP</span>
                  </h4>

                  <div className="space-y-3">
                    {/* Kích thước hàng đợi VIP * */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-52">
                        Kích thước hàng đợi VIP <span className="text-red-500">*</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={vipQueueSize}
                          onChange={(e) => setVipQueueSize(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                          required
                        />
                        <span className="text-xs text-slate-600">phiên chat</span>
                      </div>
                    </div>

                    {/* Thời gian chờ hàng đợi VIP * */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-52">
                        Thời gian chờ hàng đợi VIP <span className="text-red-500">*</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={vipQueueWaitTime}
                          onChange={(e) => setVipQueueWaitTime(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                          required
                        />
                        <span className="text-xs text-slate-600">phút</span>
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
                          value={vipAgentTimeoutMin}
                          onChange={(e) => setVipAgentTimeoutMin(e.target.value)}
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
                          value={vipCustomerTimeoutSec}
                          onChange={(e) => setVipCustomerTimeoutSec(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                        />
                        <span className="text-xs text-slate-600">phút</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hành động (Fallback) VIP riêng */}
                <div className="pt-3 border-t border-orange-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hành động (Fallback) VIP <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={vipFallbackAction}
                    onChange={(e) => setVipFallbackAction(e.target.value)}
                    className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                  >
                    {CHAT_FALLBACK_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

              </div>
            )}
          </div>

          {/* Section: Routing thường (Bao gồm Cấu hình Hàng đợi Thường riêng) */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={isStdRouting}
                onChange={setIsStdRouting}
                id="chat-routing-std-toggle"
              />
              <label 
                htmlFor="chat-routing-std-toggle" 
                className="text-xs font-semibold text-slate-800 cursor-pointer select-none"
              >
                Routing thường
              </label>
            </div>

            {isStdRouting && (
              <div className="space-y-4 pl-1 border-l-2 border-slate-300/40 ml-4.5 py-1">
                {/* 2 Columns: Phương thức định tuyến *, Tên kỹ năng * */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phương thức định tuyến <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={stdRoutingMethod}
                      onChange={(e) => {
                        const newMethod = e.target.value;
                        setStdRoutingMethod(newMethod);
                        if (newMethod === 'Nhóm kỹ năng') {
                          if (!CHAT_SKILL_GROUPS.includes(stdSkillName)) {
                            setStdSkillName(CHAT_SKILL_GROUPS[0]);
                          }
                        } else {
                          if (!CHAT_SKILL_NAMES.includes(stdSkillName)) {
                            setStdSkillName(CHAT_SKILL_NAMES[0]);
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
                      {stdRoutingMethod === 'Nhóm kỹ năng' ? 'Tên nhóm kỹ năng' : 'Tên kỹ năng'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={stdSkillName}
                      onChange={(e) => setStdSkillName(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {(stdRoutingMethod === 'Nhóm kỹ năng' ? CHAT_SKILL_GROUPS : CHAT_SKILL_NAMES).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-toggle: Agent gần nhất */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      checked={stdRecentAgent}
                      onChange={setStdRecentAgent}
                      id="chat-std-recent-agent-toggle"
                    />
                    <label 
                      htmlFor="chat-std-recent-agent-toggle" 
                      className="text-xs font-medium text-slate-700 cursor-pointer select-none"
                    >
                      Agent gần nhất (Sticky Agent)
                    </label>
                  </div>

                  {stdRecentAgent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phạm vi <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={stdRecentScope}
                          onChange={(e) => setStdRecentScope(e.target.value)}
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
                            value={stdRecentHours}
                            onChange={(e) => setStdRecentHours(Number(e.target.value))}
                            className="w-20 h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors text-center"
                          />
                          <span className="text-xs text-slate-600">giờ gần nhất</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cấu hình hàng đợi Thường riêng */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Cấu hình hàng đợi thường</span>
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Dành cho luồng thông thường</span>
                  </h4>

                  <div className="space-y-3">
                    {/* Kích thước hàng đợi thường * */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-52">
                        Kích thước hàng đợi <span className="text-red-500">*</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={stdQueueSize}
                          onChange={(e) => setStdQueueSize(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                          required
                        />
                        <span className="text-xs text-slate-600">phiên chat</span>
                      </div>
                    </div>

                    {/* Thời gian chờ hàng đợi thường * */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-700 w-52">
                        Thời gian chờ hàng đợi <span className="text-red-500">*</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={stdQueueWaitTime}
                          onChange={(e) => setStdQueueWaitTime(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                          required
                        />
                        <span className="text-xs text-slate-600">phút</span>
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
                          value={stdAgentTimeoutMin}
                          onChange={(e) => setStdAgentTimeoutMin(e.target.value)}
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
                          value={stdCustomerTimeoutSec}
                          onChange={(e) => setStdCustomerTimeoutSec(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                        />
                        <span className="text-xs text-slate-600">phút</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hành động (Fallback) Thường riêng */}
                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hành động (Fallback) Thường <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stdFallbackAction}
                    onChange={(e) => setStdFallbackAction(e.target.value)}
                    className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                  >
                    {CHAT_FALLBACK_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

              </div>
            )}
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

export function ChatRoutingModal({ isOpen, onClose, onSave, initialData, onNavigateToInputConfig }: ChatRoutingModalProps) {
  if (!isOpen) return null;
  return (
    <ChatRoutingModalForm 
      key={initialData?.id || 'new'} 
      initialData={initialData} 
      onClose={onClose} 
      onSave={onSave} 
      onNavigateToInputConfig={onNavigateToInputConfig}
    />
  );
}

