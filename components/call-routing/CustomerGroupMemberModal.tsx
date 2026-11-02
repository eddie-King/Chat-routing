'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  PhoneCall, 
  MessageSquare, 
  Trash2, 
  AlertCircle,
  Plus,
  ChevronDown,
  Search
} from 'lucide-react';
import { 
  CustomerGroupItem, 
  ExternalMemberItem 
} from '@/lib/customer-group-data';

interface CustomerGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: CustomerGroupItem | null;
  onSaveMembers: (groupId: string, customerIds: string[], externalMembers?: ExternalMemberItem[]) => void;
  allCustomers?: any[];
}

interface InnerProps {
  onClose: () => void;
  group: CustomerGroupItem;
  onSaveMembers: (groupId: string, customerIds: string[], externalMembers?: ExternalMemberItem[]) => void;
}

function CustomerGroupMemberModalInner({
  onClose,
  group,
  onSaveMembers
}: InnerProps) {
  // Danh sách các số điện thoại / senderId trong tập (từ file import và nhập thủ công)
  const [externalMembers, setExternalMembers] = useState<ExternalMemberItem[]>(
    () => group.externalMembers || []
  );

  // Ô nhập thủ công
  const [manualPhone, setManualPhone] = useState('');
  const [manualSenderId, setManualSenderId] = useState('');

  // Tìm kiếm nhanh trong danh sách
  const [searchQuery, setSearchQuery] = useState('');

  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const isCallChannel = group.channel === 'Call';

  // Phân trang
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Lọc danh sách theo ô tìm kiếm
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return externalMembers;
    const q = searchQuery.toLowerCase().trim();
    return externalMembers.filter(m => {
      const matchTime = m.importedAt?.toLowerCase().includes(q);
      const matchPlatform = m.platform?.toLowerCase().includes(q);
      if (isCallChannel) {
        return m.phone?.toLowerCase().includes(q) || matchTime;
      }
      return m.userId?.toLowerCase().includes(q) || matchTime || matchPlatform;
    });
  }, [externalMembers, searchQuery, isCallChannel]);

  // Tính toán phân trang
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Xóa 1 bản ghi
  const handleRemoveMember = (id: string) => {
    setExternalMembers(prev => prev.filter(item => item.id !== id));
  };

  // Xóa tất cả
  const handleClearAll = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ danh sách ${isCallChannel ? 'số điện thoại' : 'senderId'} trong tập này?`)) {
      setExternalMembers([]);
      setImportFeedback(`Đã xóa toàn bộ ${isCallChannel ? 'số điện thoại' : 'senderId'}.`);
    }
  };

  // Thêm thủ công trực tiếp từng bản ghi
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (isCallChannel) {
      const phone = manualPhone.trim().replace(/[\s\.\-_]/g, '');
      if (!phone || phone.length < 8) {
        setImportFeedback('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8-11 chữ số).');
        return;
      }
      if (externalMembers.some(m => m.phone === phone)) {
        setImportFeedback(`Số điện thoại ${phone} đã tồn tại trong danh sách.`);
        return;
      }

      setExternalMembers(prev => [
        {
          id: `manual-phone-${Date.now()}`,
          type: 'phone',
          phone,
          importedAt: formattedDate
        },
        ...prev
      ]);
      setManualPhone('');
      setImportFeedback(`Đã thêm số điện thoại ${phone} vào danh sách.`);
    } else {
      // Kênh Chat: chỉ cần nhập senderId
      const userId = manualSenderId.trim();
      if (!userId || userId.length < 2) {
        setImportFeedback('Vui lòng nhập senderId hợp lệ.');
        return;
      }
      if (externalMembers.some(m => m.userId?.toLowerCase() === userId.toLowerCase())) {
        setImportFeedback(`senderId "${userId}" đã tồn tại trong danh sách.`);
        return;
      }

      setExternalMembers(prev => [
        {
          id: `manual-sender-${Date.now()}`,
          type: 'chat_user',
          userId,
          importedAt: formattedDate
        },
        ...prev
      ]);
      setManualSenderId('');
      setImportFeedback(`Đã thêm senderId "${userId}" vào danh sách.`);
    }
  };

  const handleSave = () => {
    onSaveMembers(group.id, [], externalMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 flex flex-col h-[85vh]">
        
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white select-none">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <span>CẤU HÌNH DANH SÁCH {isCallChannel ? 'SỐ ĐIỆN THOẠI' : 'SENDERID'} TRONG TẬP:</span>
              <span className="text-[#f25621] uppercase font-bold">{group.groupName}</span>
              <span className="text-slate-400 font-mono text-xs">({group.groupCode})</span>
            </h2>

            {/* Badge kênh áp dụng */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
              isCallChannel 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isCallChannel ? <PhoneCall className="w-3 h-3 text-blue-600" /> : <MessageSquare className="w-3 h-3 text-emerald-600" />}
              <span>{isCallChannel ? 'Kênh Call' : 'Kênh Chat'}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message banner */}
        {importFeedback && (
          <div className="bg-blue-50 border-b border-blue-200 text-blue-800 px-5 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{importFeedback}</span>
            </div>
            <button
              onClick={() => setImportFeedback(null)}
              className="text-blue-500 hover:text-blue-700 font-bold ml-2 text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* NỘI DUNG CHÍNH: IMPORT THỦ CÔNG & DANH SÁCH TẤT CẢ SENDERID / SỐ ĐIỆN THOẠI */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 bg-white text-xs">
          
          {/* Form nhập tay trực tiếp */}
          <form onSubmit={handleAddManualItem} className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              {isCallChannel ? <PhoneCall className="w-4 h-4 text-blue-600" /> : <MessageSquare className="w-4 h-4 text-emerald-600" />}
              <span>
                {isCallChannel 
                  ? 'Nhập thủ công Số điện thoại cho tập' 
                  : 'Nhập thủ công senderId cho tập'}
              </span>
            </div>

            {isCallChannel ? (
              /* Kênh Call: Chỉ cần nhập Số điện thoại */
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="VD: 0903123456"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none font-mono"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full h-8 flex items-center justify-center gap-1.5 px-3 bg-[#f25621] hover:bg-[#d94816] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm số</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Kênh Chat: Chỉ cần nhập senderId */
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    senderId <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualSenderId}
                    onChange={(e) => setManualSenderId(e.target.value)}
                    placeholder="VD: zalo_88991203 hoặc fb_1000928374619..."
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none font-mono"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full h-8 flex items-center justify-center gap-1.5 px-3 bg-[#f25621] hover:bg-[#d94816] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm senderId</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Bảng danh sách tất cả các senderId / số điện thoại */}
          <div className="space-y-2.5 pt-1 flex-1 flex flex-col min-h-[220px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-semibold text-slate-800 text-xs">
                  {isCallChannel 
                    ? `Danh sách tất cả các số điện thoại (${externalMembers.length} bản ghi):` 
                    : `Danh sách tất cả các senderId (${externalMembers.length} bản ghi):`}
                </div>
                {searchQuery.trim() && (
                  <span className="text-[11px] font-medium text-[#f25621] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                    Tìm thấy {filteredMembers.length} / {externalMembers.length} kết quả
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {/* Ô tìm kiếm nhanh - luôn luôn hiển thị */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={`Tìm kiếm ${isCallChannel ? 'số điện thoại' : 'senderId'}, thời gian...`}
                    className="h-8 pl-8 pr-7 text-xs bg-white border border-slate-300 rounded focus:border-[#f25621] outline-none font-mono w-56 sm:w-64 placeholder:font-sans placeholder:text-slate-400 transition-colors shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {externalMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline cursor-pointer font-medium whitespace-nowrap ml-1"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded overflow-hidden flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eef3f7] border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">STT</th>
                    {isCallChannel ? (
                      <th className="py-2 px-3 min-w-[200px]">Số điện thoại</th>
                    ) : (
                      <th className="py-2 px-3 min-w-[220px]">senderId</th>
                    )}
                    <th className="py-2 px-3 w-40">Thời gian import</th>
                    <th className="py-2 px-3 w-16 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedMembers.length > 0 ? (
                    paginatedMembers.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-500">
                          {startIndex + idx + 1}
                        </td>
                        {isCallChannel ? (
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">
                            {item.phone}
                          </td>
                        ) : (
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">
                            {item.userId}
                          </td>
                        )}
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {item.importedAt}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(item.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        {searchQuery ? (
                          <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                            <Search className="w-5 h-5 text-slate-300" />
                            <p className="text-xs text-slate-600">
                              Không tìm thấy kết quả phù hợp với từ khóa <span className="font-semibold text-slate-800">&quot;{searchQuery}&quot;</span>.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setCurrentPage(1);
                              }}
                              className="text-xs text-[#f25621] hover:underline font-medium cursor-pointer mt-1"
                            >
                              Xóa bộ lọc tìm kiếm
                            </button>
                          </div>
                        ) : (
                          `Chưa có ${isCallChannel ? 'số điện thoại' : 'senderId'} nào trong tập này.`
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PHẦN CHÂN BẢNG: PAGINATION */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2 bg-white border-t border-slate-200 text-xs text-slate-600 select-none">
                {/* Vế trái: Dropdown chọn số mục & text hiển thị dải dữ liệu */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-700">Hiển thị</span>
                  <div className="relative inline-flex items-center">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="appearance-none bg-white border border-slate-300 rounded px-2.5 py-1 pr-6 text-xs text-slate-700 outline-none hover:border-slate-400 focus:border-[#f25621] cursor-pointer shadow-2xs"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 pointer-events-none" />
                  </div>
                  <span className="text-slate-700">mục</span>

                  <span className="text-slate-500 ml-3 sm:ml-5">
                    {totalItems === 0
                      ? 'Hiển thị từ 0 đến 0 trong 0 mục'
                      : `Hiển thị từ ${startIndex + 1} đến ${endIndex} trong ${totalItems} mục`}
                  </span>
                </div>

                {/* Vế phải: Nút điều hướng các trang */}
                <div className="flex items-center gap-4 text-xs font-normal">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage <= 1}
                    className={`transition-colors ${
                      currentPage <= 1
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    Trang đầu
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className={`transition-colors ${
                      currentPage <= 1
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    Trang trước
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className={`transition-colors ${
                      currentPage >= totalPages
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    Trang kế
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    className={`transition-colors ${
                      currentPage >= totalPages
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    Trang cuối
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span>Tổng số {isCallChannel ? 'số điện thoại' : 'senderId'}:</span>
            <span className="font-bold text-[#f25621] text-sm">{externalMembers.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white rounded text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              Lưu danh sách
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function CustomerGroupMemberModal({
  isOpen,
  onClose,
  group,
  onSaveMembers
}: CustomerGroupMemberModalProps) {
  if (!isOpen || !group) return null;

  return (
    <CustomerGroupMemberModalInner
      key={group.id}
      group={group}
      onClose={onClose}
      onSaveMembers={onSaveMembers}
    />
  );
}
