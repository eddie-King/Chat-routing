'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { RoutingConfigItem } from '@/lib/routing-data';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item?: { extNumber?: string; queueCode?: string; name?: string; channel?: string } | null;
  itemLabel?: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, item, itemLabel }: DeleteConfirmModalProps) {
  if (!isOpen || (!item && !itemLabel)) return null;

  const displayLabel = itemLabel || (item?.queueCode ? `${item.channel || 'Kênh Chat'} (${item.queueCode})` : item?.extNumber || 'mục này');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800">
              Xác nhận xóa cấu hình định tuyến?
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Bạn có chắc chắn muốn xóa cấu hình <span className="font-semibold text-red-600">{displayLabel}</span> không? Hành động này sẽ dừng phân bổ theo luồng này ngay lập tức.
            </p>
          </div>
        </div>
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
