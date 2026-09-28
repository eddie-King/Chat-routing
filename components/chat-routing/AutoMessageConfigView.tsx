import React, { useState } from 'react';
import { 
  Clock, 
  MessageSquare, 
  Check, 
  RotateCcw, 
  PhoneCall, 
  Share2, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  Bot
} from 'lucide-react';
import { 
  AutoMessageConfig, 
  INITIAL_AUTO_MESSAGE_CONFIG, 
  AVAILABLE_VARIABLES_WAIT_SLA, 
  AVAILABLE_VARIABLES_INACTIVITY,
  AVAILABLE_VARIABLES_OVERLOAD
} from '@/lib/auto-message-data';

interface AutoMessageConfigViewProps {
  onSwitchToCallRouting?: () => void;
  onSwitchToChatRouting?: () => void;
  onSwitchToSocialMedia?: () => void;
}

export function AutoMessageConfigView({
  onSwitchToCallRouting,
  onSwitchToChatRouting,
  onSwitchToSocialMedia
}: AutoMessageConfigViewProps) {
  const [config, setConfig] = useState<AutoMessageConfig>(INITIAL_AUTO_MESSAGE_CONFIG);
  const [activeTab, setActiveTab] = useState<'WAIT_SLA' | 'QUEUE_OVERLOAD' | 'INACTIVITY_CLOSE'>('WAIT_SLA');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulator Preview State
  const [simMode, setSimMode] = useState<'wait_standard' | 'wait_vip' | 'overload' | 'inactivity'>('wait_standard');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    setConfig(prev => ({
      ...prev,
      updatedAt: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }));
    showToast('Đã lưu cấu hình tin nhắn tự động thành công!');
  };

  const handleResetDefaults = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình về mặc định ban đầu?')) {
      setConfig(INITIAL_AUTO_MESSAGE_CONFIG);
      showToast('Đã khôi phục cấu hình về mặc định ban đầu');
    }
  };

  // Helper to insert variables into textareas
  const insertVariable = (
    field: 'standardMessage' | 'vipMessage' | 'queueOverloadMessage' | 'inactivityMessage',
    variable: string
  ) => {
    if (field === 'standardMessage' || field === 'vipMessage') {
      setConfig(prev => ({
        ...prev,
        waitTimeSla: {
          ...prev.waitTimeSla,
          [field]: prev.waitTimeSla[field] + ' ' + variable
        }
      }));
    } else if (field === 'queueOverloadMessage') {
      setConfig(prev => ({
        ...prev,
        queueOverload: {
          ...prev.queueOverload,
          message: prev.queueOverload.message + ' ' + variable
        }
      }));
    } else if (field === 'inactivityMessage') {
      setConfig(prev => ({
        ...prev,
        inactivityClose: {
          ...prev.inactivityClose,
          message: prev.inactivityClose.message + ' ' + variable
        }
      }));
    }
    showToast(`Đã thêm biến ${variable}`);
  };

  const toggleChannel = (section: 'waitTimeSla' | 'queueOverload' | 'inactivityClose', channelName: string) => {
    setConfig(prev => {
      const currentList = prev[section].channels;
      const nextList = currentList.includes(channelName)
        ? currentList.filter(c => c !== channelName)
        : [...currentList, channelName];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          channels: nextList
        }
      };
    });
  };

  // Replace variables for preview
  const getRenderedPreviewText = (template: string, isVip: boolean = false) => {
    let result = template;
    result = result.replace(/{TEN_KHACH_HANG}/g, isVip ? 'Nguyễn Anh Tuấn (VIP)' : 'Nguyễn Văn An');
    result = result.replace(/{THOI_GIAN_CHO}/g, `${isVip ? config.waitTimeSla.vipWaitMinutes : config.waitTimeSla.standardWaitMinutes} phút`);
    result = result.replace(/{TEN_HANG_DOI}/g, 'Hỗ trợ Kỹ thuật & CSKH');
    result = result.replace(/{THOI_GIAN_KHONG_TUONG_TAC}/g, `${config.inactivityClose.inactivityMinutes}`);
    result = result.replace(/{TEN_AGENT}/g, 'Trần Minh Tâm (CSKH)');
    result = result.replace(/{SO_LUONG_DANG_CHO}/g, '24');
    result = result.replace(/{THOI_GIAN_DU_KIEN}/g, '15');
    result = result.replace(/{HOTLINE}/g, '1900 6868');
    return result;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-150">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Submenu Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:px-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Tiếp nhận & phân phối /</span>
          <span className="font-semibold text-slate-700">Cấu hình tin nhắn tự động</span>
        </div>

        {/* Submenu Switcher Buttons */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
          {onSwitchToCallRouting && (
            <button
              onClick={onSwitchToCallRouting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
              <span>Call Routing</span>
            </button>
          )}

          {onSwitchToChatRouting && (
            <button
              onClick={onSwitchToChatRouting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Chat Routing</span>
            </button>
          )}

          {onSwitchToSocialMedia && (
            <button
              onClick={onSwitchToSocialMedia}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Kênh Mạng Xã Hội</span>
            </button>
          )}

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#f25621] bg-white shadow-2xs transition-colors cursor-default"
          >
            <Clock className="w-3.5 h-3.5 text-[#f25621]" />
            <span>Tin nhắn tự động</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#f25621]" />
            <span>Cấu hình Tin Nhắn Tự Động</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập tin nhắn tự động khi quá thời gian chờ tiếp nhận (Thường / VIP), khi hàng đợi quá tải và khi xác nhận đóng phiên chat.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Khôi phục mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#f25621] hover:bg-[#e04510] text-white text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left (7 cols) + Live Simulator Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Configuration Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Navigation Tabs between Case 1, Case 2 and Case 3 */}
          <div className="bg-white rounded-lg border border-slate-200 p-1 grid grid-cols-3 gap-1">
            
            {/* Tab 1: Quá thời gian chờ tiếp nhận */}
            <button
              onClick={() => {
                setActiveTab('WAIT_SLA');
                setSimMode('wait_standard');
              }}
              className={`py-2 px-3 rounded text-xs font-medium transition-all text-center cursor-pointer ${
                activeTab === 'WAIT_SLA'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              1. Chờ tiếp nhận (SLA)
            </button>

            {/* Tab 2: Quá tải hàng đợi */}
            <button
              onClick={() => {
                setActiveTab('QUEUE_OVERLOAD');
                setSimMode('overload');
              }}
              className={`py-2 px-3 rounded text-xs font-medium transition-all text-center cursor-pointer ${
                activeTab === 'QUEUE_OVERLOAD'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              2. Quá tải hàng đợi
            </button>

            {/* Tab 3: Tự động xác nhận & Đóng phiên */}
            <button
              onClick={() => {
                setActiveTab('INACTIVITY_CLOSE');
                setSimMode('inactivity');
              }}
              className={`py-2 px-3 rounded text-xs font-medium transition-all text-center cursor-pointer ${
                activeTab === 'INACTIVITY_CLOSE'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              3. Đóng phiên chat ({config.inactivityClose.inactivityMinutes}p)
            </button>
          </div>

          {/* TAB 1: Quá thời gian chờ tiếp nhận (Có Khách Thường & Khách VIP, giao diện tối giản chuẩn mực) */}
          {activeTab === 'WAIT_SLA' && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              
              {/* Header + Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Tin nhắn tự động khi quá thời gian chờ tiếp nhận
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tự động gửi tin nhắn khi khách nhắn vào hàng đợi mà chưa có agent nhận phiên.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">
                    {config.waitTimeSla.enabled ? 'Đang bật' : 'Đang tắt'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={config.waitTimeSla.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        waitTimeSla: { ...prev.waitTimeSla, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#f25621]"></div>
                  </label>
                </div>
              </div>

              {/* 1. KHỐI KHÁCH HÀNG THÔNG THƯỜNG (Tối giản) */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Khách hàng thông thường
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Thời gian chờ tối đa:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={config.waitTimeSla.standardWaitMinutes}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          waitTimeSla: { ...prev.waitTimeSla, standardWaitMinutes: Math.max(1, parseInt(e.target.value) || 1) }
                        }))}
                        className="w-16 h-8 px-2 text-center rounded border border-slate-300 bg-white font-bold text-xs text-[#f25621] outline-hidden focus:border-[#f25621]"
                      />
                      <span className="text-xs text-slate-500">phút</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 ml-1">
                      {[5, 10, 15].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            waitTimeSla: { ...prev.waitTimeSla, standardWaitMinutes: m }
                          }))}
                          className={`px-2 py-0.5 rounded text-xs border cursor-pointer ${
                            config.waitTimeSla.standardWaitMinutes === m 
                              ? 'bg-slate-200 border-slate-400 font-semibold text-slate-800' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {m}p
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nội dung tin nhắn tự động gửi cho khách thường:
                  </label>
                  <textarea
                    rows={3}
                    value={config.waitTimeSla.standardMessage}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      waitTimeSla: { ...prev.waitTimeSla, standardMessage: e.target.value }
                    }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 bg-white transition-all outline-hidden leading-relaxed"
                  />
                  
                  {/* Variable Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-400">Chèn biến:</span>
                    {AVAILABLE_VARIABLES_WAIT_SLA.map(v => (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => insertVariable('standardMessage', v.code)}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[11px] text-slate-700 font-mono transition-colors cursor-pointer"
                        title={v.label}
                      >
                        {v.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. KHỐI KHÁCH HÀNG VIP (Tối giản y hệt khách thường, không highlight, không icon vương miện) */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Khách hàng VIP
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Thời gian chờ tối đa:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={config.waitTimeSla.vipWaitMinutes}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          waitTimeSla: { ...prev.waitTimeSla, vipWaitMinutes: Math.max(1, parseInt(e.target.value) || 1) }
                        }))}
                        className="w-16 h-8 px-2 text-center rounded border border-slate-300 bg-white font-bold text-xs text-[#f25621] outline-hidden focus:border-[#f25621]"
                      />
                      <span className="text-xs text-slate-500">phút</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 ml-1">
                      {[1, 3, 5].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            waitTimeSla: { ...prev.waitTimeSla, vipWaitMinutes: m }
                          }))}
                          className={`px-2 py-0.5 rounded text-xs border cursor-pointer ${
                            config.waitTimeSla.vipWaitMinutes === m 
                              ? 'bg-slate-200 border-slate-400 font-semibold text-slate-800' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {m}p
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nội dung tin nhắn tự động gửi cho khách VIP:
                  </label>
                  <textarea
                    rows={3}
                    value={config.waitTimeSla.vipMessage}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      waitTimeSla: { ...prev.waitTimeSla, vipMessage: e.target.value }
                    }))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 bg-white transition-all outline-hidden leading-relaxed"
                  />
                  
                  {/* Variable Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-400">Chèn biến:</span>
                    {AVAILABLE_VARIABLES_WAIT_SLA.map(v => (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => insertVariable('vipMessage', v.code)}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[11px] text-slate-700 font-mono transition-colors cursor-pointer"
                        title={v.label}
                      >
                        {v.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kênh áp dụng */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Áp dụng cho các kênh tiếp nhận chat:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Facebook', 'Zalo OA', 'Website LiveChat', 'ZBS', 'SMS'].map(channel => {
                    const isChecked = config.waitTimeSla.channels.includes(channel);
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel('waitTimeSla', channel)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-[#f25621]' : 'bg-slate-300'}`} />
                        <span>{channel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Quá tải hàng đợi */}
          {activeTab === 'QUEUE_OVERLOAD' && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              
              {/* Header + Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Tin nhắn tự động khi Hàng đợi quá tải
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tự động thông báo khi số lượng khách chờ tiếp nhận vượt quá ngưỡng quy định.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">
                    {config.queueOverload.enabled ? 'Đang bật' : 'Đang tắt'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={config.queueOverload.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        queueOverload: { ...prev.queueOverload, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#f25621]"></div>
                  </label>
                </div>
              </div>

              {/* Textarea Mẫu tin nhắn */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung tin nhắn thông báo khi quá tải:
                </label>
                <textarea
                  rows={3}
                  value={config.queueOverload.message}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    queueOverload: { ...prev.queueOverload, message: e.target.value }
                  }))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 bg-white transition-all outline-hidden leading-relaxed"
                />

                {/* Variables */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400">Chèn biến:</span>
                  {AVAILABLE_VARIABLES_OVERLOAD.map(v => (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => insertVariable('queueOverloadMessage', v.code)}
                      className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[11px] text-slate-700 font-mono transition-colors cursor-pointer"
                      title={v.label}
                    >
                      {v.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kênh áp dụng */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Áp dụng cho các kênh tiếp nhận chat:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Facebook', 'Zalo OA', 'Website LiveChat', 'ZBS', 'SMS'].map(channel => {
                    const isChecked = config.queueOverload.channels.includes(channel);
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel('queueOverload', channel)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-[#f25621]' : 'bg-slate-300'}`} />
                        <span>{channel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Đóng phiên không tương tác */}
          {activeTab === 'INACTIVITY_CLOSE' && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              
              {/* Header + Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Tin nhắn tự động xác nhận đóng phiên chat
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tự động nhắn ra thông báo đóng phiên khi quá thời gian không nhận được tin nhắn từ khách hàng.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">
                    {config.inactivityClose.enabled ? 'Đang bật' : 'Đang tắt'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={config.inactivityClose.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        inactivityClose: { ...prev.inactivityClose, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#f25621]"></div>
                  </label>
                </div>
              </div>

              {/* Input Thời gian không tương tác */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
                <label className="text-xs font-semibold text-slate-700">
                  Thời gian không tương tác tính từ tin nhắn cuối cùng:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={config.inactivityClose.inactivityMinutes}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      inactivityClose: { ...prev.inactivityClose, inactivityMinutes: Math.max(1, parseInt(e.target.value) || 1) }
                    }))}
                    className="w-16 h-8 px-2 text-center rounded border border-slate-300 bg-white font-bold text-xs text-[#f25621] outline-hidden focus:border-[#f25621]"
                  />
                  <span className="text-xs text-slate-500">phút</span>
                  <div className="flex items-center gap-1 ml-1">
                    {[5, 10, 15, 30].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          inactivityClose: { ...prev.inactivityClose, inactivityMinutes: m }
                        }))}
                        className={`px-2 py-1 rounded text-xs border cursor-pointer ${
                          config.inactivityClose.inactivityMinutes === m 
                            ? 'bg-slate-100 border-slate-400 font-semibold text-slate-800' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m}p
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Textarea Mẫu tin nhắn */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung tin nhắn xác nhận đóng phiên:
                </label>
                <textarea
                  rows={3}
                  value={config.inactivityClose.message}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    inactivityClose: { ...prev.inactivityClose, message: e.target.value }
                  }))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 bg-white transition-all outline-hidden leading-relaxed"
                />

                {/* Variables */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400">Chèn biến:</span>
                  {AVAILABLE_VARIABLES_INACTIVITY.map(v => (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => insertVariable('inactivityMessage', v.code)}
                      className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[11px] text-slate-700 font-mono transition-colors cursor-pointer"
                      title={v.label}
                    >
                      {v.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kênh áp dụng */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Áp dụng cho các kênh tiếp nhận chat:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Facebook', 'Zalo OA', 'Website LiveChat', 'ZBS'].map(channel => {
                    const isChecked = config.inactivityClose.channels.includes(channel);
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel('inactivityClose', channel)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-[#f25621]' : 'bg-slate-300'}`} />
                        <span>{channel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Live Chat Simulator Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 flex flex-col h-full sticky top-4">
            
            {/* Header Simulator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Mô phỏng Giao diện Khách hàng
                </span>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setSimMode('wait_standard');
                    setActiveTab('WAIT_SLA');
                  }}
                  className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                    simMode === 'wait_standard' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Khách thường
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimMode('wait_vip');
                    setActiveTab('WAIT_SLA');
                  }}
                  className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                    simMode === 'wait_vip' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Khách VIP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimMode('overload');
                    setActiveTab('QUEUE_OVERLOAD');
                  }}
                  className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                    simMode === 'overload' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Quá tải
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimMode('inactivity');
                    setActiveTab('INACTIVITY_CLOSE');
                  }}
                  className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                    simMode === 'inactivity' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Đóng phiên
                </button>
              </div>
            </div>

            {/* Chat Device Container */}
            <div className="mt-3 flex-1 flex flex-col bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shadow-inner min-h-[460px]">
              
              {/* Fake Chat Window Header */}
              <div className="bg-slate-800 text-white px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#f25621] flex items-center justify-center text-[10px] font-bold">
                    CX
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-none">Hỗ trợ Trực tuyến UniSpace</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      Hệ thống tự động sẵn sàng
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-300 bg-slate-700 px-2 py-0.5 rounded">
                  {simMode === 'wait_standard' && 'Chờ tiếp nhận (Thường)'}
                  {simMode === 'wait_vip' && 'Chờ tiếp nhận (VIP)'}
                  {simMode === 'overload' && 'Quá tải hàng đợi'}
                  {simMode === 'inactivity' && 'Đóng phiên chat'}
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
                
                {/* 1. Tin nhắn của khách gửi vào */}
                <div className="flex justify-end">
                  <div className="bg-[#f25621] text-white p-2.5 rounded-xl rounded-tr-xs max-w-[85%] shadow-xs">
                    <p>
                      {simMode === 'overload' 
                        ? 'Tôi cần kiểm tra sự cố đường truyền mạng ngay lập tức ạ!' 
                        : 'Chào tổng đài, tôi cần hỗ trợ kiểm tra tình trạng gói dịch vụ.'}
                    </p>
                    <span className="text-[9px] text-orange-200 block text-right mt-1">14:00 • Đã gửi</span>
                  </div>
                </div>

                {/* CASE 1A: Wait SLA Standard */}
                {simMode === 'wait_standard' && (
                  <>
                    <div className="flex items-center justify-center my-2">
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                        Đã chờ {config.waitTimeSla.standardWaitMinutes} phút chưa có Agent tiếp nhận
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1.5 max-w-[88%]">
                        <div className="p-3 rounded-xl rounded-tl-xs shadow-xs text-xs leading-relaxed bg-white border border-slate-200 text-slate-800">
                          <p>{getRenderedPreviewText(config.waitTimeSla.standardMessage, false)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* CASE 1B: Wait SLA VIP */}
                {simMode === 'wait_vip' && (
                  <>
                    <div className="flex items-center justify-center my-2">
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                        Đã chờ {config.waitTimeSla.vipWaitMinutes} phút chưa có Agent tiếp nhận (VIP)
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1.5 max-w-[88%]">
                        <div className="p-3 rounded-xl rounded-tl-xs shadow-xs text-xs leading-relaxed bg-white border border-slate-200 text-slate-800">
                          <p>{getRenderedPreviewText(config.waitTimeSla.vipMessage, true)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* CASE 2: Queue Overload */}
                {simMode === 'overload' && (
                  <>
                    <div className="flex items-center justify-center my-2">
                      <span className="bg-slate-200 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                        Hàng đợi đang trong tình trạng quá tải
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1.5 max-w-[88%]">
                        <div className="p-3 rounded-xl rounded-tl-xs shadow-xs text-xs leading-relaxed bg-white border border-slate-200 text-slate-800">
                          <p>{getRenderedPreviewText(config.queueOverload.message)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* CASE 3: Inactivity Auto-Close */}
                {simMode === 'inactivity' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 text-[10px]">
                        CS
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl rounded-tl-xs max-w-[85%] text-xs shadow-xs">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Tư vấn viên Tâm • 14:15</span>
                        <p>Dạ vâng, em đã kiểm tra thông tin hợp đồng cho bạn rồi ạ. Bạn có cần hỗ trợ thêm thông tin gì không?</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center my-2">
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                        Khách không phản hồi sau {config.inactivityClose.inactivityMinutes} phút
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1.5 max-w-[88%]">
                        <div className="p-3 rounded-xl rounded-tl-xs shadow-xs text-xs leading-relaxed bg-white border border-slate-200 text-slate-800">
                          <p>{getRenderedPreviewText(config.inactivityClose.message)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Chat Device Bottom Bar */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span>Khung soạn thảo tin nhắn...</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">Mô phỏng</span>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
