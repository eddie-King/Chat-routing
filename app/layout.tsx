import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'UniSpace-CX | Cấu hình định tuyến (Call Routing)',
  description: 'Hệ thống quản lý và cấu hình Call Routing tổng đài thông minh UniSpace-CX',
  openGraph: {
    title: 'UniSpace-CX | Cấu hình định tuyến (Call Routing)',
    description: 'Hệ thống quản lý và cấu hình Call Routing tổng đài thông minh UniSpace-CX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniSpace-CX | Cấu hình định tuyến (Call Routing)',
    description: 'Hệ thống quản lý và cấu hình Call Routing tổng đài thông minh UniSpace-CX',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
