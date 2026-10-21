'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-700">
      <h2 className="text-xl font-bold">Đã xảy ra lỗi</h2>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-[#f25621] text-white rounded text-sm hover:bg-[#d94816]"
      >
        Thử lại
      </button>
    </div>
  );
}
