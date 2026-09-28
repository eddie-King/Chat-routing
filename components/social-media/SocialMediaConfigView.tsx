import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Pencil, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  Share2,
  Building2,
  GitFork,
  Bot,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  SocialAccountItem, 
  SocialChannel, 
  INITIAL_SOCIAL_ACCOUNTS,
  SOCIAL_SERVICES,
  SOCIAL_BRANCH_DEPARTMENTS
} from '@/lib/social-media-data';
import { SocialAccountModal } from './SocialAccountModal';

interface SocialMediaConfigViewProps {
  onNavigateToChatRouting?: () => void;
  onNavigateToAutoMessages?: () => void;
}

export function SocialMediaConfigView({ 
  onNavigateToChatRouting,
  onNavigateToAutoMessages 
}: SocialMediaConfigViewProps) {
  const [accounts, setAccounts] = useState<SocialAccountItem[]>(INITIAL_SOCIAL_ACCOUNTS);
  const [activeTab, setActiveTab] = useState<SocialChannel>('Facebook');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState('ALL');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterChatbot, setFilterChatbot] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccountItem | null>(null);

  // Toast / feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    showToast('Đã sao chép vào bộ nhớ tạm!');
  };

  const toggleTokenVisibility = (id: string) => {
    setRevealedTokens(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleStatus = (id: string) => {
    setAccounts(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Hoạt động' ? 'Tạm dừng' : 'Hoạt động';
        showToast(`Đã chuyển trạng thái sang "${nextStatus}"`);
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản / Fanpage "${name}"?`)) {
      setAccounts(prev => prev.filter(item => item.id !== id));
      showToast(`Đã xóa tài khoản "${name}" thành công`);
    }
  };

  const handleSaveAccount = (account: SocialAccountItem) => {
    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
      showToast(`Cập nhật tài khoản "${account.pageName}" thành công!`);
    } else {
      setAccounts(prev => [account, ...prev]);
      showToast(`Thêm mới tài khoản "${account.pageName}" thành công!`);
    }
    setEditingAccount(null);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterService('ALL');
    setFilterBranch('ALL');
    setFilterChatbot('ALL');
  };

  // Filtered list by active tab and dropdowns
  const filteredAccounts = useMemo(() => {
    return accounts.filter(item => {
      // Channel tab
      if (item.channel !== activeTab) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.pageName.toLowerCase().includes(q);
        const matchesId = item.pageId.toLowerCase().includes(q);
        const matchesService = item.service.toLowerCase().includes(q);
        const matchesBranch = item.branchDepartment.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesService && !matchesBranch) return false;
      }

      // Filter service
      if (filterService !== 'ALL' && item.service !== filterService) {
        return false;
      }

      // Filter branch
      if (filterBranch !== 'ALL' && item.branchDepartment !== filterBranch) {
        return false;
      }

      // Filter chatbot
      if (filterChatbot === 'YES' && !item.chatbotIntegrated) return false;
      if (filterChatbot === 'NO' && item.chatbotIntegrated) return false;

      return true;
    });
  }, [accounts, activeTab, searchQuery, filterService, filterBranch, filterChatbot]);

  // Counts per channel
  const channelCounts = useMemo(() => {
    const counts: Record<SocialChannel, number> = {
      'Facebook': 0,
      'Zalo OA': 0,
      'ZBS': 0,
      'SMS': 0,
      'Chatbot': 0
    };
    accounts.forEach(a => {
      if (counts[a.channel] !== undefined) {
        counts[a.channel]++;
      }
    });
    return counts;
  }, [accounts]);

  const channelTabs: { id: SocialChannel; label: string; icon: string }[] = [
    { id: 'Facebook', label: 'Facebook', icon: 'fb' },
    { id: 'Zalo OA', label: 'Zalo OA', icon: 'zalo' },
    { id: 'ZBS', label: 'ZBS', icon: 'zbs' },
    { id: 'SMS', label: 'SMS', icon: 'sms' },
    { id: 'Chatbot', label: 'Chatbot', icon: 'bot' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Tiếp nhận & phân phối</span>
            <span>/</span>
            <span className="text-[#f25621] font-medium">Tài khoản mạng xã hội</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f25621] flex items-center justify-center font-bold">
              <Share2 className="w-4.5 h-4.5" />
            </div>
            <span>Cấu hình Kênh Mạng Xã Hội</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Quản lý các tài khoản mạng xã hội (Facebook Fanpage, Zalo OA, ZBS, SMS, Chatbot). Mỗi tài khoản được liên kết với 
            <strong className="text-slate-700 font-semibold"> Dịch vụ tiếp nhận (Routing Service)</strong> và <strong className="text-slate-700 font-semibold">Chi nhánh phòng ban</strong> tương ứng để tự động phân luồng tin nhắn.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateToChatRouting && (
            <button
              onClick={onNavigateToChatRouting}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 text-slate-600 hover:text-[#f25621] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Chuyển đến cấu hình Chat Routing"
            >
              <GitFork className="w-3.5 h-3.5 text-[#f25621]" />
              <span>Cấu hình Chat Routing</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            </button>
          )}

          {onNavigateToAutoMessages && (
            <button
              onClick={onNavigateToAutoMessages}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 text-slate-600 hover:text-[#f25621] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Cấu hình tin nhắn tự động khi quá thời gian chờ và đóng phiên"
            >
              <Clock className="w-3.5 h-3.5 text-[#f25621]" />
              <span>Tin nhắn tự động SLA</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            </button>
          )}

          <button
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-[#f25621] hover:bg-[#e04510] text-white text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm tài khoản {activeTab}</span>
          </button>
        </div>
      </div>

      {/* Main Content Card: Tabs + Filters + Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Channel Tabs */}
        <div className="border-b border-slate-200 px-4 sm:px-6 bg-slate-50/50 flex flex-wrap gap-2 pt-2">
          {channelTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = channelCounts[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all relative border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#f25621] text-[#f25621]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.id === 'Facebook' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                )}
                {tab.id === 'Zalo OA' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                )}
                {tab.id === 'ZBS' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                )}
                {tab.id === 'SMS' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                )}
                {tab.id === 'Chatbot' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                )}

                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive ? 'bg-orange-100 text-[#f25621]' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, ID trang, chi nhánh..."
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-800 transition-all outline-hidden"
              />
            </div>

            {/* Filter Dịch vụ tiếp nhận */}
            <div>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-700 bg-white transition-all outline-hidden cursor-pointer"
              >
                <option value="ALL">Tất cả dịch vụ định tuyến</option>
                {SOCIAL_SERVICES.map(srv => (
                  <option key={srv} value={srv}>{srv}</option>
                ))}
              </select>
            </div>

            {/* Filter Chi nhánh phòng ban */}
            <div>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-700 bg-white transition-all outline-hidden cursor-pointer"
              >
                <option value="ALL">Tất cả chi nhánh phòng ban</option>
                {SOCIAL_BRANCH_DEPARTMENTS.map(br => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
            </div>

            {/* Filter Chatbot & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={filterChatbot}
                onChange={(e) => setFilterChatbot(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] text-xs text-slate-700 bg-white transition-all outline-hidden cursor-pointer"
              >
                <option value="ALL">Tất cả tích hợp Chatbot</option>
                <option value="YES">Đã tích hợp Chatbot (Có)</option>
                <option value="NO">Chưa tích hợp (Không)</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Làm mới bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3 w-24 text-center">Hoạt động</th>
                <th className="py-3 px-3 min-w-[140px]">ID Trang / Kênh</th>
                <th className="py-3 px-3 min-w-[200px]">Tên Fanpage / Tài khoản</th>
                <th className="py-3 px-4 min-w-[220px]">
                  <div className="flex items-center gap-1 text-[#f25621]">
                    <GitFork className="w-3 h-3" />
                    <span>Dịch vụ tiếp nhận (Routing)</span>
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[200px]">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Building2 className="w-3 h-3" />
                    <span>Chi nhánh phòng ban</span>
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[150px]">Khóa / Token</th>
                <th className="py-3 px-3 min-w-[130px]">Ngày kết nối</th>
                <th className="py-3 px-3 w-28 text-center">Chatbot</th>
                <th className="py-3 px-3 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-7 h-7 text-slate-300" />
                      <p className="text-xs font-medium text-slate-500">
                        Không tìm thấy tài khoản {activeTab} nào phù hợp với bộ lọc
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-[#f25621] hover:underline font-medium cursor-pointer"
                      >
                        Xóa bộ lọc tìm kiếm
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((item, index) => {
                  const isRevealed = !!revealedTokens[item.id];

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-amber-50/20 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Hoạt động Switch */}
                      <td className="py-3 px-3 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={item.status === 'Hoạt động'}
                            onChange={() => handleToggleStatus(item.id)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </td>

                      {/* ID Trang / Kênh */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[130px]">{item.pageId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.pageId, `id-${item.id}`)}
                            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép ID"
                          >
                            {copiedId === `id-${item.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Tên Fanpage / Tài khoản */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-orange-100 text-[#f25621] flex items-center justify-center shrink-0 font-bold text-[10px]">
                            {item.channel === 'Facebook' && 'FB'}
                            {item.channel === 'Zalo OA' && 'ZL'}
                            {item.channel === 'ZBS' && 'ZB'}
                            {item.channel === 'SMS' && 'SM'}
                            {item.channel === 'Chatbot' && 'AI'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {item.pageName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              App ID: {item.appId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dịch vụ tiếp nhận (Routing Service) */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50 text-[#f25621] border border-orange-200/80 font-medium text-[11px]">
                          <GitFork className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[200px]" title={item.service}>
                            {item.service}
                          </span>
                        </div>
                      </td>

                      {/* Chi nhánh phòng ban */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]" title={item.branchDepartment}>
                            {item.branchDepartment}
                          </span>
                        </div>
                      </td>

                      {/* Token / Secret */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                          <span className="truncate max-w-[100px]">
                            {isRevealed ? item.appSecret : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleTokenVisibility(item.id)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={isRevealed ? 'Ẩn mã' : 'Hiện mã'}
                          >
                            {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.token, `tok-${item.id}`)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Sao chép Token"
                          >
                            {copiedId === `tok-${item.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Ngày kết nối */}
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.connectedDate}
                      </td>

                      {/* Chatbot */}
                      <td className="py-3 px-3 text-center">
                        {item.chatbotIntegrated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            <Bot className="w-3 h-3 text-emerald-600" />
                            <span>Có</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                            Không
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAccount(item);
                              setIsModalOpen(true);
                            }}
                            className="w-7 h-7 rounded hover:bg-slate-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Chỉnh sửa cấu hình"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.pageName)}
                            className="w-7 h-7 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Hiển thị <span className="font-semibold text-slate-700">{filteredAccounts.length}</span> của{' '}
            <span className="font-semibold text-slate-700">{channelCounts[activeTab]}</span> tài khoản {activeTab}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">10 / trang</span>
            <div className="flex items-center gap-1">
              <button 
                disabled 
                className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-300 flex items-center justify-center disabled:opacity-50 cursor-not-allowed text-xs font-mono"
              >
                &lt;
              </button>
              <button className="w-7 h-7 rounded border border-[#f25621] bg-[#f25621] text-white flex items-center justify-center text-xs font-semibold cursor-pointer">
                1
              </button>
              <button 
                disabled 
                className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-300 flex items-center justify-center disabled:opacity-50 cursor-not-allowed text-xs font-mono"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Social Account Modal */}
      <SocialAccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        initialData={editingAccount}
        defaultChannel={activeTab}
      />

    </div>
  );
}
