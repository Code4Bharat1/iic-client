import AppShell from '@/components/shell/AppShell';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AuthenticatedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}
