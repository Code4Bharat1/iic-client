import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import AppShell from '@/components/shell/AppShell';
import '@/styles/globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600'],
  style: ['normal', 'italic'],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isLogin = router.pathname === '/login';

  return (
    <div className={`${sans.variable} ${display.variable} font-sans`}>
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
