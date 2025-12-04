'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function DashboardContent() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    if (!usuario) return;

    // Redirigir según rol
    if (isSuperAdmin) {
      router.push('/complejos');
    } else if (usuario.complejoId) {
      router.push(`/complejo/${usuario.complejoId}`);
    } else {
      // Si es dueño/empleado sin complejo asignado (caso raro)
      console.error('Usuario sin complejo asignado');
    }
  }, [usuario, isSuperAdmin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}