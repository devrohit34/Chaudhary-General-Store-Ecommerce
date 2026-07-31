import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '@/lib/cart-context';
import { ConditionalLayout } from '@/components/conditional-layout';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chaudhary General Store | चौधरी जेनरल स्टोर',
  description: 'Your trusted neighborhood kirana store in Bhagwanpur, Bihar. Fresh groceries and daily essentials. Owner: Kundan Kumar Chaudhary.',
  keywords: 'kirana store, grocery, online grocery, Bihar, Bhagwanpur, delivery, fresh, dairy, snacks, Chaudhary General Store',
  openGraph: {
    title: 'Chaudhary General Store | चौधरी जेनरल स्टोर',
    description: 'Fresh groceries and daily essentials. Owner: Kundan Kumar Chaudhary, Bhagwanpur, Bihar.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster position="top-center" richColors />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
