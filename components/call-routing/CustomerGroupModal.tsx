'use client';

import React, { useState } from 'react';
import { X, PhoneCall, MessageSquare } from 'lucide-react';
import { CustomerGroupItem } from '@/lib/customer-group-data';

interface CustomerGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: CustomerGroupItem) => void;
  initialData?: CustomerGroupItem | null;
}

interface InnerProps {
  onClose: () => void;
  onSave: (group: CustomerGroupItem) => void;
  initialData?: CustomerGroupItem | null;
}

function CustomerGroupModalInner({ onClose, onSave, initialData }: InnerProps) {
  const [groupName, setGroupName] = useState(() => initialData?.groupName || '');
  const [channel, setChannel] = useState<'Call' | 'Chat'>(() => initialData?.channel || 'Call');
  const [groupCode, setGroupCode] = useState(() => {
    if (initialData?.groupCode) return initialData.groupCode;
    const now = new Date();
    const codeSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    return `V_${codeSuffix}`;
  });
  const [description, setDescription] = useState(() => initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupCode.trim()) return;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const saved: CustomerGroupItem = {
      id: initialData ? initialData.id : `grp-${Date.now()}`,
      groupCode: groupCode.trim(),
      groupName: groupName.trim(),
      channel: channel,
      description: description.trim(),
      createdAt: initialData ? initialData.createdAt : formattedDate,
      updatedAt: initialData ? formattedDate : '',
      customerIds: initialData ? initialData.customerIds : [],
      externalMembers: initialData?.externalMembers || []
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      <div className="bg-white rounded border border-slate-300 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {initialData ? 'Chỉnh sửa tập khách hàng VIP' : 'Thêm mới tập khách hàng VIP'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mã tập khách hàng VIP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="VD: V_20260921105024"
              className="w-full h-9 px-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên tập khách hàng VIP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="VD: Kenk chat, VIP Diamond..."
              className="w-full h-9 px-3 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none"
              required
            />
          </div>

          {/* Kênh áp dụng: Kênh Call / Kênh Chat */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Kênh áp dụng <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <label 
                className={`flex items-center gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  channel === 'Call' 
                    ? 'border-[#f25621] bg-orange-50/50 text-[#f25621] font-medium' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="channelSelection"
                  value="Call"
                  checked={channel === 'Call'}
                  onChange={() => setChannel('Call')}
                  className="w-4 h-4 text-[#f25621] focus:ring-[#f25621] border-slate-300 cursor-pointer"
                />
                <PhoneCall className={`w-3.5 h-3.5 ${channel === 'Call' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                <span>Kênh Call</span>
              </label>

              <label 
                className={`flex items-center gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  channel === 'Chat' 
                    ? 'border-[#f25621] bg-orange-50/50 text-[#f25621] font-medium' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="channelSelection"
                  value="Chat"
                  checked={channel === 'Chat'}
                  onChange={() => setChannel('Chat')}
                  className="w-4 h-4 text-[#f25621] focus:ring-[#f25621] border-slate-300 cursor-pointer"
                />
                <MessageSquare className={`w-3.5 h-3.5 ${channel === 'Chat' ? 'text-[#f25621]' : 'text-slate-400'}`} />
                <span>Kênh Chat</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {channel === 'Call'
                ? 'Tập này áp dụng cho luồng thoại; cho phép import Số điện thoại ngoài hệ thống.'
                : 'Tập này áp dụng cho luồng Chat; cho phép import UserID Zalo & Facebook ngoài hệ thống.'}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả / Ghi chú
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2.5}
              placeholder="Nhập mô tả tập khách hàng (không bắt buộc)..."
              className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:border-[#f25621] focus:ring-1 focus:ring-[#f25621] outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#f25621] hover:bg-[#e04815] text-white rounded text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              {initialData ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CustomerGroupModal({ isOpen, onClose, onSave, initialData }: CustomerGroupModalProps) {
  if (!isOpen) return null;

  return (
    <CustomerGroupModalInner
      key={initialData ? initialData.id : 'new'}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    />
  );
}
