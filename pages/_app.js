import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import AppShell from '@/components/shell/AppShell';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isLogin = router.pathname === '/login';

  return (
    <div className={`${inter.variable} font-sans`}>
      <AuthProvider>
        <ToastProvider>
          {isLogin ? (
            <Component {...pageProps} />
          ) : (
            <AppShell>
              <Component {...pageProps} />
            </AppShell>
          )}
        </ToastProvider>
      </AuthProvider>
    </div>
  );
}
