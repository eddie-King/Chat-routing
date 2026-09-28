'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, MessageSquare, ChevronDown } from 'lucide-react';
import { 
  ChatRoutingConfigItem, 
  CHAT_SOURCES,
  CHAT_BRANCHES,
  CHAT_FALLBACK_OPTIONS, 
  CHAT_VIP_GROUPS,
  CHAT_ROUTING_METHODS,
  CHAT_SKILL_NAMES,
  CHAT_AGENT_SCOPE_OPTIONS
} from '@/lib/chat-routing-data';

interface ChatRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ChatRoutingConfigItem) => void;
  initialData: ChatRoutingConfigItem | null;
}

interface FormInnerProps {
  initialData: ChatRoutingConfigItem | null;
  onClose: () => void;
  onSave: (item: ChatRoutingConfigItem) => void;
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

function ChatRoutingModalForm({ initialData, onClose, onSave }: FormInnerProps) {
  // Top Fields: Queue Name & Queue Code
  const [queueName, setQueueName] = useState(
    initialData?.queueName || initialData?.name || ''
  );
  const [queueCode, setQueueCode] = useState(
    initialData?.queueCode || ''
  );

  // Chi nhánh (không bắt buộc)
  const [branch, setBranch] = useState(
    initialData?.branch || ''
  );

  // Nguồn tiếp nhận chat (Facebook, Zalo,...)
  const [selectedSources, setSelectedSources] = useState<string[]>(
    initialData?.chatSources && initialData.chatSources.length > 0 
      ? initialData.chatSources 
      : ['Facebook', 'Zalo']
  );
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // VIP Routing Section
  const [isVipRouting, setIsVipRouting] = useState(initialData ? initialData.routingVIP === 'Có' : true);
  const [vipCustomerGroup, setVipCustomerGroup] = useState(initialData?.vipCustomerGroup || CHAT_VIP_GROUPS[0]);
  const [vipRoutingMethod, setVipRoutingMethod] = useState(initialData?.vipRoutingMethod || CHAT_ROUTING_METHODS[0]);
  const [vipSkillName, setVipSkillName] = useState(initialData?.vipSkillName || CHAT_SKILL_NAMES[0]);
  const [vipRecentAgent, setVipRecentAgent] = useState(initialData?.vipRecentAgent ?? true);
  const [vipRecentScope, setVipRecentScope] = useState(initialData?.vipRecentScope || CHAT_AGENT_SCOPE_OPTIONS[0]);
  const [vipRecentHours, setVipRecentHours] = useState(initialData?.vipRecentHours ?? 24);

  // Cấu hình Hàng đợi VIP riêng (Kích thước, Thời gian chờ, Timeout phản hồi)
  const [vipQueueSize, setVipQueueSize] = useState<number | string>(
    initialData?.vipQueueSize ?? (initialData?.queueSize ? Math.min(initialData.queueSize, 15) : 15)
  );
  const [vipQueueWaitTime, setVipQueueWaitTime] = useState<number | string>(
    initialData?.vipQueueWaitTime ?? (initialData?.queueWaitTime ? Math.min(initialData.queueWaitTime, 30) : 25)
  );
  const [vipCustomerTimeoutSec, setVipCustomerTimeoutSec] = useState<number | string>(
    initialData?.vipCustomerTimeoutSec ?? initialData?.customerTimeoutSec ?? 180
  );

  // Standard Routing Section
  const [isStdRouting, setIsStdRouting] = useState(initialData ? initialData.routingStandard === 'Có' : true);
  const [stdRoutingMethod, setStdRoutingMethod] = useState(initialData?.stdRoutingMethod || CHAT_ROUTING_METHODS[0]);
  const [stdSkillName, setStdSkillName] = useState(initialData?.stdSkillName || CHAT_SKILL_NAMES[1]);
  const [stdRecentAgent, setStdRecentAgent] = useState(initialData?.stdRecentAgent ?? false);
  const [stdRecentScope, setStdRecentScope] = useState(initialData?.stdRecentScope || CHAT_AGENT_SCOPE_OPTIONS[0]);
  const [stdRecentHours, setStdRecentHours] = useState(initialData?.stdRecentHours ?? 24);

  // Cấu hình Hàng đợi Thường riêng (Kích thước, Thời gian chờ, Timeout phản hồi)
  const [stdQueueSize, setStdQueueSize] = useState<number | string>(
    initialData?.stdQueueSize ?? initialData?.queueSize ?? 30
  );
  const [stdQueueWaitTime, setStdQueueWaitTime] = useState<number | string>(
    initialData?.stdQueueWaitTime ?? initialData?.queueWaitTime ?? 45
  );
  const [stdCustomerTimeoutSec, setStdCustomerTimeoutSec] = useState<number | string>(
    initialData?.stdCustomerTimeoutSec ?? initialData?.customerTimeoutSec ?? 180
  );

  // Fallback
  const [fallbackAction, setFallbackAction] = useState(initialData?.fallbackAction || CHAT_FALLBACK_OPTIONS[0]);

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      if (selectedSources.length === 1) return; // Giữ ít nhất 1 nguồn tiếp nhận
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleToggleAll = () => {
    if (selectedSources.length === CHAT_SOURCES.length) {
      setSelectedSources(['Facebook', 'Zalo']);
    } else {
      setSelectedSources([...CHAT_SOURCES]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueName.trim() || !queueCode.trim()) return;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const savedSources = selectedSources.length > 0 ? selectedSources : ['Facebook', 'Zalo'];

    const savedItem: ChatRoutingConfigItem = {
      id: initialData ? initialData.id : `chat-cfg-${Date.now()}`,
      queueName: queueName.trim(),
      queueCode: queueCode.trim(),
      name: queueName.trim(),
      chatSources: savedSources,
      branch: branch.trim() || undefined,
      intakeChannels: savedSources,
      channel: savedSources.join(', '),
      nluIntents: [],

      // VIP Routing & Queue VIP riêng
      routingVIP: isVipRouting ? 'Có' : 'Không',
      vipCustomerGroup: isVipRouting ? vipCustomerGroup : undefined,
      vipRoutingMethod: isVipRouting ? vipRoutingMethod : undefined,
      vipSkillName: isVipRouting ? vipSkillName : undefined,
      vipRecentAgent: isVipRouting ? vipRecentAgent : false,
      vipRecentScope: isVipRouting && vipRecentAgent ? vipRecentScope : undefined,
      vipRecentHours: isVipRouting && vipRecentAgent ? Number(vipRecentHours) : undefined,
      vipQueueSize: isVipRouting ? (Number(vipQueueSize) || 15) : undefined,
      vipQueueWaitTime: isVipRouting ? (Number(vipQueueWaitTime) || 25) : undefined,
      vipCustomerTimeoutSec: isVipRouting ? (Number(vipCustomerTimeoutSec) || 180) : undefined,

      // Standard Routing & Queue Thường riêng
      routingStandard: isStdRouting ? 'Có' : 'Không',
      stdRoutingMethod: isStdRouting ? stdRoutingMethod : undefined,
      stdSkillName: isStdRouting ? stdSkillName : undefined,
      stdRecentAgent: isStdRouting ? stdRecentAgent : false,
      stdRecentScope: isStdRouting && stdRecentAgent ? stdRecentScope : undefined,
      stdRecentHours: isStdRouting && stdRecentAgent ? Number(stdRecentHours) : undefined,
      stdQueueSize: isStdRouting ? (Number(stdQueueSize) || 30) : undefined,
      stdQueueWaitTime: isStdRouting ? (Number(stdQueueWaitTime) || 45) : undefined,
      stdCustomerTimeoutSec: isStdRouting ? (Number(stdCustomerTimeoutSec) || 180) : undefined,

      fallbackAction,

      // Compatibility shared fields
      queueSize: isStdRouting ? (Number(stdQueueSize) || 30) : (Number(vipQueueSize) || 15),
      queueWaitTime: isStdRouting ? (Number(stdQueueWaitTime) || 45) : (Number(vipQueueWaitTime) || 25),
      customerTimeoutSec: isStdRouting ? (Number(stdCustomerTimeoutSec) || 180) : (Number(vipCustomerTimeoutSec) || 180),

      strategy: initialData?.strategy || 'Skill-based',
      skillGroup: isVipRouting ? vipSkillName : (isStdRouting ? stdSkillName : 'Mặc định'),
      slaFirstResponseSec: initialData?.slaFirstResponseSec || 30,
      autoGreeting: initialData?.autoGreeting ?? true,
      status: initialData?.status || 'Hoạt động',
      createdAt: initialData ? initialData.createdAt : formattedDate,
      description: initialData?.description || `Định tuyến phiên chat từ ${savedSources.join(', ')} vào ${queueName}`,
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

          {/* Row 2: Nguồn tiếp nhận chat * & Chi nhánh (Không bắt buộc) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nguồn tiếp nhận chat */}
            <div className="relative" ref={sourceDropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nguồn tiếp nhận chat <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                className="w-full h-9.5 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <span className="truncate pr-2">
                  {selectedSources.length === 0
                    ? '-- Chọn nguồn tiếp nhận --'
                    : selectedSources.length === CHAT_SOURCES.length
                    ? 'Tất cả nguồn (Đa kênh)'
                    : selectedSources.join(', ')}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isSourceDropdownOpen ? 'rotate-180 text-[#f25621]' : ''}`} />
              </button>

              {/* Dropdown popup */}
              {isSourceDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg py-1 max-h-56 overflow-y-auto animate-in fade-in-50 duration-100">
                  <div 
                    onClick={handleToggleAll}
                    className="px-3 py-2 hover:bg-orange-50/60 flex items-center justify-between cursor-pointer border-b border-slate-100 text-xs font-medium text-[#f25621]"
                  >
                    <span className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        checked={selectedSources.length === CHAT_SOURCES.length}
                        onChange={handleToggleAll}
                        className="rounded text-[#f25621] focus:ring-[#f25621] cursor-pointer"
                      />
                      <span>Tất cả nguồn (Đa kênh)</span>
                    </span>
                    {selectedSources.length === CHAT_SOURCES.length && (
                      <Check className="w-3.5 h-3.5 text-[#f25621]" />
                    )}
                  </div>
                  {CHAT_SOURCES.map((source) => {
                    const isChecked = selectedSources.includes(source);
                    return (
                      <div
                        key={source}
                        onClick={() => toggleSource(source)}
                        className="px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer text-xs text-slate-700"
                      >
                        <span className="flex items-center gap-2 select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSource(source)}
                            className="rounded text-[#f25621] focus:ring-[#f25621] cursor-pointer"
                          />
                          <span>{source}</span>
                        </span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#f25621]" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chi nhánh (không bắt buộc) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chi nhánh <span className="text-xs font-normal text-slate-500">(Không bắt buộc)</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full h-9.5 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
              >
                <option value="">-- Tất cả chi nhánh / Toàn quốc --</option>
                {CHAT_BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
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
                      onChange={(e) => setVipRoutingMethod(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {CHAT_ROUTING_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tên kỹ năng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vipSkillName}
                      onChange={(e) => setVipSkillName(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {CHAT_SKILL_NAMES.map((s) => (
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
                          min="5"
                          max="600"
                          value={vipQueueWaitTime}
                          onChange={(e) => setVipQueueWaitTime(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                          required
                        />
                        <span className="text-xs text-slate-600">giây</span>
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
                          min="30"
                          max="1800"
                          value={vipCustomerTimeoutSec}
                          onChange={(e) => setVipCustomerTimeoutSec(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                        />
                        <span className="text-xs text-slate-600">giây</span>
                      </div>
                    </div>
                  </div>
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
                      onChange={(e) => setStdRoutingMethod(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {CHAT_ROUTING_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tên kỹ năng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={stdSkillName}
                      onChange={(e) => setStdSkillName(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
                    >
                      {CHAT_SKILL_NAMES.map((s) => (
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
                          min="5"
                          max="600"
                          value={stdQueueWaitTime}
                          onChange={(e) => setStdQueueWaitTime(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                          required
                        />
                        <span className="text-xs text-slate-600">giây</span>
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
                          min="30"
                          max="1800"
                          value={stdCustomerTimeoutSec}
                          onChange={(e) => setStdCustomerTimeoutSec(e.target.value)}
                          className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
                        />
                        <span className="text-xs text-slate-600">giây</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Field: Hành động (Fallback) * */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hành động (Fallback) <span className="text-red-500">*</span>
            </label>
            <select
              value={fallbackAction}
              onChange={(e) => setFallbackAction(e.target.value)}
              className="w-full h-9.5 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none transition-colors cursor-pointer"
            >
              {CHAT_FALLBACK_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
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

export function ChatRoutingModal({ isOpen, onClose, onSave, initialData }: ChatRoutingModalProps) {
  if (!isOpen) return null;
  return <ChatRoutingModalForm key={initialData?.id || 'new'} initialData={initialData} onClose={onClose} onSave={onSave} />;
}

