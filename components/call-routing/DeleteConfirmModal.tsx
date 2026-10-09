'use client';

import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  item?: any;
  itemLabel?: string;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Thông báo',
  message = 'Bạn có chắc chắn muốn xóa?',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy bỏ'
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-[380px] p-8 text-center animate-in zoom-in-95 duration-150 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Vòng tròn cảnh báo viền cam nhạt kèm dấu chấm than cam */}
        <div className="w-20 h-20 rounded-full border-2 border-[#fed7aa] flex items-center justify-center mx-auto mb-4 select-none">
          <svg width="20" height="42" viewBox="0 0 16 38" fill="none" className="shrink-0">
            {/* Thanh đứng chấm than bo góc */}
            <path d="M8 4V22" stroke="#f25621" strokeWidth="4.2" strokeLinecap="round" />
            {/* Chấm tròn dưới */}
            <circle cx="8" cy="32" r="2.8" fill="#f25621" />
          </svg>
        </div>

        {/* Tiêu đề Thông báo */}
        <h3 className="text-2xl font-bold text-[#0a3254] mb-2 tracking-tight">
          {title}
        </h3>

        {/* Nội dung câu hỏi xác nhận */}
        <p className="text-sm text-slate-800 mb-6 font-normal">
          {message}
        </p>

        {/* Các nút: Nút cam Đồng ý & Link xanh Hủy bỏ */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-1.5 text-sm font-medium text-white bg-[#f25621] hover:bg-[#d94412] rounded transition-colors cursor-pointer shadow-2xs"
          >
            {confirmText}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-sm font-normal text-[#0284c7] hover:text-[#0369a1] underline transition-colors cursor-pointer py-1.5"
          >
            {cancelText}
          </button>
        </div>

      </div>
    </div>
  );
}
