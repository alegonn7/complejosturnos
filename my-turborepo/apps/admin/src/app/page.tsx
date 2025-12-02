'use client';

import { useAuthStore } from '../stores/authStore';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { usuario, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Panel de Administración</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{usuario?.nombre} {usuario?.apellido}</p>
                <p className="text-gray-500">{usuario?.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Bienvenido al Dashboard</h2>
          <p className="text-gray-600">
            Usuario autenticado correctamente con rol: <span className="font-semibold">{usuario?.rol}</span>
          </p>
        </div>
      </main>
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