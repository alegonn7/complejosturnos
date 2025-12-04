'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="main-header">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-primary-600 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Info del usuario */}
          <div className="text-right">
            <p className="text-sm font-medium text-primary-900">
              {usuario?.nombre} {usuario?.apellido}
            </p>
            <p className="text-xs text-primary-600">{usuario?.rol}</p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
            </span>
          </div>

          {/* Logout */}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}