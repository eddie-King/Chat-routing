'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { 
  RoutingConfigItem, 
  EXTENSION_OPTIONS, 
  FALLBACK_OPTIONS, 
  VIP_CUSTOMER_GROUPS,
  ROUTING_METHODS,
  SKILL_NAMES,
  AGENT_SCOPE_OPTIONS,
  AVAILABLE_AGENTS 
} from '@/lib/routing-data';

interface RoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: RoutingConfigItem) => void;
  initialData: RoutingConfigItem | null;
}

interface FormInnerProps {
  initialData: RoutingConfigItem | null;
  onClose: () => void;
  onSave: (item: RoutingConfigItem) => void;
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
        checked ? 'bg-blue-600' : 'bg-slate-500'
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

function RoutingModalForm({ initialData, onClose, onSave }: FormInnerProps) {
  // Top Field
  const [extNumber, setExtNumber] = useState(initialData?.extNumber || '9006 - IVR_WaitRouteAgent-CS');
  
  // VIP Routing Section
  const [isVipRouting, setIsVipRouting] = useState(initialData ? initialData.routingVIP === 'Có' : true);
  const [vipCustomerGroup, setVipCustomerGroup] = useState(initialData?.vipCustomerGroup || VIP_CUSTOMER_GROUPS[0]);
  const [vipRoutingMethod, setVipRoutingMethod] = useState(initialData?.vipRoutingMethod || ROUTING_METHODS[0]);
  const [vipSkillName, setVipSkillName] = useState(initialData?.vipSkillName || SKILL_NAMES[0]);
  const [vipRecentAgent, setVipRecentAgent] = useState(initialData?.vipRecentAgent ?? true);
  const [vipRecentScope, setVipRecentScope] = useState(initialData?.vipRecentScope || AGENT_SCOPE_OPTIONS[0]);
  const [vipRecentHours, setVipRecentHours] = useState(initialData?.vipRecentHours ?? 1);

  // Standard Routing Section
  const [isStdRouting, setIsStdRouting] = useState(initialData ? initialData.routingStandard === 'Có' : true);
  const [stdRoutingMethod, setStdRoutingMethod] = useState(initialData?.stdRoutingMethod || ROUTING_METHODS[0]);
  const [stdSkillName, setStdSkillName] = useState(initialData?.stdSkillName || SKILL_NAMES[1]);
  const [stdRecentAgent, setStdRecentAgent] = useState(initialData?.stdRecentAgent ?? false);
  const [stdRecentScope, setStdRecentScope] = useState(initialData?.stdRecentScope || AGENT_SCOPE_OPTIONS[0]);
  const [stdRecentHours, setStdRecentHours] = useState(initialData?.stdRecentHours ?? 1);

  // Fallback
  const [fallbackExt, setFallbackExt] = useState(initialData?.fallbackExt || FALLBACK_OPTIONS[0]);

  // Queue Configuration
  const [queueSize, setQueueSize] = useState<number | string>(initialData?.queueSize ?? 10);
  const [queueWaitTime, setQueueWaitTime] = useState<number | string>(initialData?.queueWaitTime ?? 30);
  const [ringTime, setRingTime] = useState<number | string>(initialData?.ringTime ?? 20);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    initialData?.assignedAgents || [AVAILABLE_AGENTS[0], AVAILABLE_AGENTS[1], AVAILABLE_AGENTS[3]]
  );

  const toggleAgent = (agent: string) => {
    if (selectedAgents.includes(agent)) {
      setSelectedAgents(selectedAgents.filter(a => a !== agent));
    } else {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extNumber) return;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const savedItem: RoutingConfigItem = {
      id: initialData ? initialData.id : `cfg-${Date.now()}`,
      extNumber,
      name: initialData?.name || `Định tuyến cuộc gọi - ${extNumber.split(' - ')[1] || extNumber}`,
      routingVIP: isVipRouting ? 'Có' : 'Không',
      vipCustomerGroup: isVipRouting ? vipCustomerGroup : undefined,
      vipRoutingMethod: isVipRouting ? vipRoutingMethod : undefined,
      vipSkillName: isVipRouting ? vipSkillName : undefined,
      vipRecentAgent: isVipRouting ? vipRecentAgent : false,
      vipRecentScope: isVipRouting && vipRecentAgent ? vipRecentScope : undefined,
      vipRecentHours: isVipRouting && vipRecentAgent ? Number(vipRecentHours) : undefined,

      routingStandard: isStdRouting ? 'Có' : 'Không',
      stdRoutingMethod: isStdRouting ? stdRoutingMethod : undefined,
      stdSkillName: isStdRouting ? stdSkillName : undefined,
      stdRecentAgent: isStdRouting ? stdRecentAgent : false,
      stdRecentScope: isStdRouting && stdRecentAgent ? stdRecentScope : undefined,
      stdRecentHours: isStdRouting && stdRecentAgent ? Number(stdRecentHours) : undefined,

      fallbackExt,
      queueSize: Number(queueSize) || 10,
      queueWaitTime: Number(queueWaitTime) || 30,
      ringTime: Number(ringTime) || 20,
      assignedAgents: selectedAgents,
      createdAt: initialData ? initialData.createdAt : formattedDate,
      strategy: initialData?.strategy || 'Skill-based',
      skillGroup: isVipRouting ? vipSkillName : (isStdRouting ? stdSkillName : 'Mặc định'),
      maxWaitTime: Number(queueWaitTime) || 30,
      status: initialData?.status || 'Hoạt động',
      description: initialData?.description || 'Cấu hình định tuyến cuộc gọi phân bổ theo luồng VIP và Thường',
      note: initialData?.note || ''
    };

    onSave(savedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header - Solid Orange with Title and Close Icon */}
        <div className="bg-[#f25621] px-6 py-3.5 flex items-center justify-between text-white select-none">
          <h2 className="text-base font-bold tracking-tight">Cấu hình định tuyến</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Top Field: Đầu số Ext * */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Đầu số Ext <span className="text-red-500">*</span>
            </label>
            <select
              value={extNumber}
              onChange={(e) => setExtNumber(e.target.value)}
              className="w-full h-9.5 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
              required
            >
              {EXTENSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Section: Routing VIP */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={isVipRouting}
                onChange={setIsVipRouting}
                id="routing-vip-toggle"
              />
              <label 
                htmlFor="routing-vip-toggle" 
                className="text-xs font-semibold text-slate-800 cursor-pointer select-none"
              >
                Routing VIP
              </label>
            </div>

            {isVipRouting && (
              <div className="space-y-4 pl-1 border-l-2 border-blue-500/20 ml-4.5 py-1">
                {/* 3 Columns: Tập khách hàng VIP *, Phương thức định tuyến *, Tên kỹ năng * */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tập khách hàng VIP <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vipCustomerGroup}
                      onChange={(e) => setVipCustomerGroup(e.target.value)}
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
                    >
                      {VIP_CUSTOMER_GROUPS.map((g) => (
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
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
                    >
                      {ROUTING_METHODS.map((m) => (
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
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
                    >
                      {SKILL_NAMES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-toggle: Agent gần nhất */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      checked={vipRecentAgent}
                      onChange={setVipRecentAgent}
                      id="vip-recent-agent-toggle"
                    />
                    <label 
                      htmlFor="vip-recent-agent-toggle" 
                      className="text-xs font-medium text-slate-700 cursor-pointer select-none"
                    >
                      Agent gần nhất
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
                          className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
                        >
                          {AGENT_SCOPE_OPTIONS.map((sc) => (
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
                            className="w-20 h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-center"
                          />
                          <span className="text-xs text-slate-600">giờ gần nhất</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Routing thường */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={isStdRouting}
                onChange={setIsStdRouting}
                id="routing-std-toggle"
              />
              <label 
                htmlFor="routing-std-toggle" 
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
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
                    >
                      {ROUTING_METHODS.map((m) => (
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
                      className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
                    >
                      {SKILL_NAMES.map((s) => (
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
                      id="std-recent-agent-toggle"
                    />
                    <label 
                      htmlFor="std-recent-agent-toggle" 
                      className="text-xs font-medium text-slate-700 cursor-pointer select-none"
                    >
                      Agent gần nhất
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
                          className="w-full h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
                        >
                          {AGENT_SCOPE_OPTIONS.map((sc) => (
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
                            className="w-20 h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-center"
                          />
                          <span className="text-xs text-slate-600">giờ gần nhất</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Field: Đầu số Ext (Fallback) * */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Đầu số Ext (Fallback) <span className="text-red-500">*</span>
            </label>
            <select
              value={fallbackExt}
              onChange={(e) => setFallbackExt(e.target.value)}
              className="w-full h-9.5 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
            >
              {FALLBACK_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Section: Cấu hình hàng đợi */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-3">
              Cấu hình hàng đợi
            </h3>

            <div className="space-y-3">
              {/* Kích thước hàng đợi * */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 w-44">
                  Kích thước hàng đợi <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={queueSize}
                    onChange={(e) => setQueueSize(e.target.value)}
                    className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                  <span className="text-xs text-slate-600">cuộc gọi</span>
                </div>
              </div>

              {/* Thời gian chờ hàng đợi * */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 w-44">
                  Thời gian chờ hàng đợi <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={queueWaitTime}
                    onChange={(e) => setQueueWaitTime(e.target.value)}
                    className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                  <span className="text-xs text-slate-600">giây</span>
                </div>
              </div>

              {/* Thời gian đổ chuông */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 w-44">
                  Thời gian đổ chuông
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={ringTime}
                    onChange={(e) => setRingTime(e.target.value)}
                    className="w-20 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-xs text-slate-600">giây</span>
                </div>
              </div>

              {/* Agent * */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
                <span className="text-xs font-medium text-slate-700 w-44 pt-1">
                  Agent <span className="text-red-500">*</span>
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded min-h-12 max-h-28 overflow-y-auto">
                    {AVAILABLE_AGENTS.map((agent) => {
                      const isSelected = selectedAgents.includes(agent);
                      return (
                        <button
                          key={agent}
                          type="button"
                          onClick={() => toggleAgent(agent)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-medium shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{agent}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Đã chọn {selectedAgents.length} tư vấn viên phụ trách đổ chuông
                  </p>
                </div>
              </div>
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

export function RoutingModal({ isOpen, onClose, onSave, initialData }: RoutingModalProps) {
  if (!isOpen) return null;
  return <RoutingModalForm key={initialData?.id || 'new'} initialData={initialData} onClose={onClose} onSave={onSave} />;
}
