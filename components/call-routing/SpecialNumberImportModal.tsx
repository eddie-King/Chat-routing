'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, ArrowUpDown } from 'lucide-react';
import { CustomerGroupItem, ExternalMemberItem } from '@/lib/customer-group-data';

interface SpecialNumberImportModalProps {
  isOpen: boolean;
  group: CustomerGroupItem | null;
  onClose: () => void;
  onImport: (groupId: string, newMembers: ExternalMemberItem[]) => void;
}

interface InvalidRow {
  identifier: string;
  errorReason: string;
}

export default function SpecialNumberImportModal({
  isOpen,
  group,
  onClose,
  onImport
}: SpecialNumberImportModalProps) {
  if (!isOpen || !group) return null;

  return (
    <SpecialNumberImportModalInner
      key={group.id}
      group={group}
      onClose={onClose}
      onImport={onImport}
    />
  );
}

function SpecialNumberImportModalInner({
  group,
  onClose,
  onImport
}: {
  group: CustomerGroupItem;
  onClose: () => void;
  onImport: (groupId: string, newMembers: ExternalMemberItem[]) => void;
}) {
  const isCall = group.channel === 'Call';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('No file chosen');
  const [totalUploaded, setTotalUploaded] = useState<number>(0);
  const [validItems, setValidItems] = useState<ExternalMemberItem[]>([]);
  const [invalidList, setInvalidList] = useState<InvalidRow[]>([]);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'id' | 'reason'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Tải file mẫu
  const handleDownloadTemplate = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    let defaultFilename = '';

    if (isCall) {
      csvContent += 'Số điện thoại\n0903123456\n0988776655\n0912345678\n0977112233\n0933445566';
      defaultFilename = `Mau_Import_So_Chu_Goi_${group.groupCode}.csv`;
    } else {
      csvContent += 'senderId\nuser_1001\nuser_200234\nuser_1003\n88997766\nuser_882910';
      defaultFilename = `Mau_Import_senderId_${group.groupCode}.csv`;
    }

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setHasProcessed(false);
      setValidItems([]);
      setInvalidList([]);
      setTotalUploaded(0);
    } else {
      setSelectedFile(null);
      setFileName('No file chosen');
    }
  };

  // Xử lý nút "Tải lên" -> Đọc và phân tích file
  const handleProcessUpload = () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file để tải lên.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        alert('File không có nội dung.');
        return;
      }

      const rawLines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (rawLines.length === 0) {
        alert('File không có dòng dữ liệu nào.');
        return;
      }

      // Kiểm tra dòng đầu tiên có phải header không
      const firstLineLower = rawLines[0].toLowerCase();
      const startIndex = (firstLineLower.includes('số điện thoại') || firstLineLower.includes('phone') || firstLineLower.includes('senderid') || firstLineLower.includes('id')) ? 1 : 0;
      const dataLines = rawLines.slice(startIndex);

      const total = dataLines.length;
      setTotalUploaded(total);

      const valids: ExternalMemberItem[] = [];
      const invalids: InvalidRow[] = [];
      const seenInFile = new Set<string>();

      // Danh sách số/senderId đã có trong tập
      const existingMembers = new Set(
        (group.externalMembers || []).map(m => (isCall ? m.phone : m.userId)?.trim().toLowerCase())
      );

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      dataLines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        const rawId = parts[0] || '';

        if (!rawId) {
          invalids.push({
            identifier: `(Dòng ${index + 1}) Trống`,
            errorReason: isCall ? 'Số điện thoại không được để trống' : 'senderId không được để trống'
          });
          return;
        }

        const normalizedId = rawId.trim();
        const key = normalizedId.toLowerCase();

        // Kiểm tra trùng lặp trong file
        if (seenInFile.has(key)) {
          invalids.push({
            identifier: normalizedId,
            errorReason: isCall ? 'Trùng lặp số điện thoại trong file' : 'Trùng lặp senderId trong file'
          });
          return;
        }
        seenInFile.add(key);

        // Kiểm tra đã tồn tại trong tập chưa
        if (existingMembers.has(key)) {
          invalids.push({
            identifier: normalizedId,
            errorReason: 'Đã tồn tại trong tập khách hàng này'
          });
          return;
        }

        if (isCall) {
          // Validate số điện thoại (chỉ chứa số, độ dài 9 - 11 chữ số, bắt đầu bằng 0 hoặc 84)
          const cleanPhone = normalizedId.replace(/[\s\.\-_]/g, '');
          const isPhonePattern = /^(0|84|\+84)[1-9][0-9]{7,9}$/.test(cleanPhone);

          if (!isPhonePattern) {
            invalids.push({
              identifier: normalizedId,
              errorReason: 'Số điện thoại không đúng định dạng (cần 9-11 chữ số hợp lệ)'
            });
            return;
          }

          valids.push({
            id: `call-imp-${Date.now()}-${index}`,
            type: 'phone',
            phone: cleanPhone,
            note: 'Import từ file',
            importedAt: formattedDate
          });
        } else {
          // Kênh Chat: chỉ cần senderId (bỏ Ghi chú và Nền tảng)
          if (normalizedId.length < 2) {
            invalids.push({
              identifier: normalizedId,
              errorReason: 'senderId không hợp lệ'
            });
            return;
          }

          valids.push({
            id: `chat-imp-${Date.now()}-${index}`,
            type: 'chat_user',
            userId: normalizedId,
            importedAt: formattedDate
          });
        }
      });

      setValidItems(valids);
      setInvalidList(invalids);
      setHasProcessed(true);
    };

    reader.readAsText(selectedFile);
  };

  // Nút "Import dữ liệu" -> Ghi nhận các bản ghi hợp lệ vào tập
  const handleCommitImport = () => {
    if (!hasProcessed || validItems.length === 0) {
      alert('Không có bản ghi hợp lệ nào để import. Vui lòng bấm [Tải lên] để kiểm tra file trước.');
      return;
    }

    onImport(group.id, validItems);
    onClose();
  };

  // Xuất file lỗi
  const handleExportErrors = () => {
    if (invalidList.length === 0) {
      alert('Không có lỗi nào để xuất file.');
      return;
    }

    const header = isCall ? 'Số điện thoại,Nội dung lỗi\n' : 'senderId,Nội dung lỗi\n';
    const rows = invalidList.map(item => `"${item.identifier.replace(/"/g, '""')}","${item.errorReason.replace(/"/g, '""')}"`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + header + rows;

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Danh_sach_loi_import_${group.groupCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sắp xếp danh sách lỗi
  const sortedInvalidList = [...invalidList].sort((a, b) => {
    const valA = sortField === 'id' ? a.identifier : a.errorReason;
    const valB = sortField === 'id' ? b.identifier : b.errorReason;
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const toggleSort = (field: 'id' | 'reason') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* HEADER: Nền cam #f25621, chữ trắng, dấu X góc phải */}
        <div className="bg-[#f25621] px-5 py-3.5 flex items-center justify-between text-white select-none">
          <h2 className="text-base font-semibold tracking-wide">
            {isCall
              ? 'Import số chủ gọi cho tập khách hàng VIP'
              : 'Import senderId cho tập khách hàng VIP'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          
          {/* Dòng hướng dẫn và Link Tải file mẫu */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-normal">
              Dữ liệu chỉ được nhập nếu ở sheet đầu tiên và bắt đầu ở ô A1
            </span>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-xs text-[#f25621] hover:underline cursor-pointer font-medium"
            >
              Tải file mẫu
            </button>
          </div>

          {/* Chọn File và Các nút hành động */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                File
              </label>
              <div className="flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="special-number-file-input"
                />
                <label
                  htmlFor="special-number-file-input"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-r-0 border-slate-300 rounded-l cursor-pointer transition-colors"
                >
                  Choose File
                </label>
                <div className="px-3 py-1.5 bg-white text-xs text-slate-600 border border-slate-300 rounded-r flex-1 truncate">
                  {fileName}
                </div>
              </div>
            </div>

            {/* Cụm 2 nút Tải lên và Import dữ liệu */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleProcessUpload}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f25621] hover:bg-[#d94816] text-white text-xs font-medium rounded shadow-sm transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải lên</span>
              </button>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={!hasProcessed || validItems.length === 0}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-white text-xs font-medium rounded shadow-sm transition-colors cursor-pointer ${
                  !hasProcessed || validItems.length === 0
                    ? 'bg-[#f38865]/60 cursor-not-allowed'
                    : 'bg-[#f38865] hover:bg-[#e07552]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Import dữ liệu</span>
              </button>
            </div>
          </div>

          {/* KHỐI KẾT QUẢ UPLOAD */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#f25621] uppercase tracking-wide">
              KẾT QUẢ UPLOAD
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Tổng số tải lên:</span>
                <span className="font-semibold text-slate-900">{totalUploaded}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Tổng số hợp lệ:</span>
                <span className="font-semibold text-emerald-600">{validItems.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Tổng số lỗi:</span>
                <span className="font-semibold text-red-600">{invalidList.length}</span>
              </div>
            </div>
          </div>

          {/* KHỐI DANH SÁCH KHÔNG HỢP LỆ */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#f25621] uppercase tracking-wide">
                DANH SÁCH KHÔNG HỢP LỆ
              </h3>
              <button
                type="button"
                onClick={handleExportErrors}
                disabled={invalidList.length === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded transition-colors ${
                  invalidList.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#ea7a52] hover:bg-[#d66b44] cursor-pointer'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất file lỗi</span>
              </button>
            </div>

            {/* Bảng lỗi */}
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-medium select-none">
                    <th
                      onClick={() => toggleSort('id')}
                      className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors w-1/3"
                    >
                      <div className="flex items-center gap-1">
                        <span>{isCall ? 'Số điện thoại' : 'senderId'}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort('reason')}
                      className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nội dung lỗi</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedInvalidList.length > 0 ? (
                    sortedInvalidList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-4 text-slate-800 font-mono">
                          {item.identifier}
                        </td>
                        <td className="py-2 px-4 text-red-600">
                          {item.errorReason}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-10 text-center text-slate-400 text-xs">
                        Không có dữ liệu trong bảng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium rounded transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
