import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Share2, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { 
  SocialAccountItem, 
  SocialChannel, 
  SOCIAL_SERVICES, 
  SOCIAL_BRANCH_DEPARTMENTS 
} from '@/lib/social-media-data';

interface SocialAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: SocialAccountItem) => void;
  initialData?: SocialAccountItem | null;
  defaultChannel?: SocialChannel;
}

interface SocialAccountModalFormProps {
  onClose: () => void;
  onSave: (account: SocialAccountItem) => void;
  initialData?: SocialAccountItem | null;
  defaultChannel?: SocialChannel;
}

function SocialAccountModalForm({
  onClose,
  onSave,
  initialData,
  defaultChannel = 'Facebook'
}: SocialAccountModalFormProps) {
  const isEditing = !!initialData;

  const [channel, setChannel] = useState<SocialChannel>(initialData?.channel || defaultChannel);
  const [pageId, setPageId] = useState(initialData?.pageId || '');
  const [pageName, setPageName] = useState(initialData?.pageName || '');
  const [appSecret, setAppSecret] = useState(initialData?.appSecret || '');
  const [appId, setAppId] = useState(initialData?.appId || '');
  const [token, setToken] = useState(initialData?.token || '');
  const [service, setService] = useState<string>(initialData?.service || SOCIAL_SERVICES[0]);
  const [branchDepartment, setBranchDepartment] = useState<string>(initialData?.branchDepartment || SOCIAL_BRANCH_DEPARTMENTS[0]);
  const [chatbotIntegrated, setChatbotIntegrated] = useState(initialData?.chatbotIntegrated || false);
  const [status, setStatus] = useState<'Hoạt động' | 'Tạm dừng'>(initialData?.status || 'Hoạt động');

  const [showSecret, setShowSecret] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!pageId.trim()) newErrors.pageId = 'Vui lòng nhập ID Trang / Tài khoản';
    if (!pageName.trim()) newErrors.pageName = 'Vui lòng nhập Tên Fanpage / Tài khoản';
    if (!appSecret.trim()) newErrors.appSecret = 'Vui lòng nhập Khóa bí mật (App Secret)';
    if (!appId.trim()) newErrors.appId = 'Vui lòng nhập Khóa ứng dụng (Application ID)';
    if (!service) newErrors.service = 'Vui lòng chọn Dịch vụ tiếp nhận';
    if (!branchDepartment) newErrors.branchDepartment = 'Vui lòng chọn Chi nhánh phòng ban';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accountToSave: SocialAccountItem = {
      id: initialData ? initialData.id : `soc-${Date.now()}`,
      channel,
      pageId: pageId.trim(),
      pageName: pageName.trim(),
      appSecret: appSecret.trim(),
      appId: appId.trim(),
      token: token.trim() || `token_${Date.now().toString(36)}_live_sync`,
      service,
      branchDepartment,
      connectedDate: initialData ? initialData.connectedDate : new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      chatbotIntegrated,
      status
    };

    onSave(accountToSave);
    onClose();
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f25621] flex items-center justify-center font-bold">
            <Share2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isEditing ? `Chỉnh sửa cấu hình ${channel}` : `Thêm mới ${channel}`}
            </h2>
            <p className="text-xs text-slate-500">
              Cấu hình tài khoản mạng xã hội kết nối hệ thống định tuyến
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
        
        {/* Row 1: Kênh mạng xã hội & ID Trang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kênh mạng xã hội <span className="text-rose-500">*</span>
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as SocialChannel)}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 bg-white transition-all outline-hidden cursor-pointer"
            >
              <option value="Facebook">Facebook (Fanpage Messenger)</option>
              <option value="Zalo OA">Zalo OA (Official Account)</option>
              <option value="ZBS">ZBS (Zalo Business Solution)</option>
              <option value="SMS">SMS Brandname Gateway</option>
              <option value="Chatbot">Chatbot (AI Engine / Webhook)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ID Trang / Tài khoản (Page ID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: 350408238159135"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              className={`w-full h-9.5 px-3 rounded-lg border ${
                errors.pageId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
              } focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 transition-all outline-hidden font-mono`}
            />
            {errors.pageId && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.pageId}</p>
            )}
          </div>
        </div>

        {/* Row 2: Tên Fanpage / Tài khoản & Khóa ứng dụng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên Fanpage / Tài khoản <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: UCX Customer Support"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className={`w-full h-9.5 px-3 rounded-lg border ${
                errors.pageName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
              } focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 transition-all outline-hidden font-medium`}
            />
            {errors.pageName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.pageName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Khóa ứng dụng (Application ID) <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">App ID</span>
            </label>
            <input
              type="text"
              placeholder="VD: 493321482970834"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className={`w-full h-9.5 px-3 rounded-lg border ${
                errors.appId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
              } focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 transition-all outline-hidden font-mono`}
            />
            {errors.appId && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.appId}</p>
            )}
          </div>
        </div>

        {/* Row 3: Mã bảo mật ứng dụng & Mã truy cập trang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Mã bảo mật ứng dụng (App Secret) <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">Khóa bí mật</span>
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                placeholder="Nhập Secret Key"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className={`w-full h-9.5 pl-3 pr-8 rounded-lg border ${
                  errors.appSecret ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                } focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 transition-all outline-hidden font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.appSecret && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.appSecret}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Mã truy cập trang (Access Token)</span>
              <span className="text-[10px] text-slate-400 font-normal">Token xác thực</span>
            </label>
            <input
              type="text"
              placeholder="Nhập Access Token..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 transition-all outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Row 4: Dịch vụ tiếp nhận & Chi nhánh phòng ban (Đồng bộ chuẩn theo hệ thống, không highlight riêng biệt) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dịch vụ tiếp nhận <span className="text-rose-500">*</span>
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={`w-full h-9.5 px-3 rounded-lg border ${
                errors.service ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
              } focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 bg-white transition-all outline-hidden cursor-pointer`}
            >
              {SOCIAL_SERVICES.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.service}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chi nhánh phòng ban <span className="text-rose-500">*</span>
            </label>
            <select
              value={branchDepartment}
              onChange={(e) => setBranchDepartment(e.target.value)}
              className={`w-full h-9.5 px-3 rounded-lg border ${
                errors.branchDepartment ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
              } focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 bg-white transition-all outline-hidden cursor-pointer`}
            >
              {SOCIAL_BRANCH_DEPARTMENTS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {errors.branchDepartment && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.branchDepartment}</p>
            )}
          </div>
        </div>

        {/* Row 5: Trạng thái kết nối & Tích hợp Chatbot (2 công tắc chuẩn, đồng bộ) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trạng thái kết nối
            </label>
            <div className="flex items-center justify-between h-9.5 px-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-xs text-slate-700 font-medium">
                {status === 'Hoạt động' ? 'Đang hoạt động (Kích hoạt)' : 'Tạm dừng tiếp nhận'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={status === 'Hoạt động'}
                  onChange={(e) => setStatus(e.target.checked ? 'Hoạt động' : 'Tạm dừng')}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tích hợp Chatbot tự động
            </label>
            <div className="flex items-center justify-between h-9.5 px-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-xs text-slate-700 font-medium">
                {chatbotIntegrated ? 'Đang bật chatbot tự động' : 'Tắt chatbot'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={chatbotIntegrated}
                  onChange={(e) => setChatbotIntegrated(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#f25621]"></div>
              </label>
            </div>
          </div>
        </div>

      </form>

      {/* Modal Footer */}
      <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg bg-[#f25621] hover:bg-[#e04510] text-white text-xs font-medium transition-all shadow-xs hover:shadow flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Lưu cấu hình</span>
        </button>
      </div>
    </div>
  );
}

export function SocialAccountModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultChannel = 'Facebook'
}: SocialAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <SocialAccountModalForm
        key={initialData ? initialData.id : `new-${defaultChannel}`}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        defaultChannel={defaultChannel}
      />
    </div>
  );
}
