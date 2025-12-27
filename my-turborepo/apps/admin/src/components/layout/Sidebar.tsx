'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { usePermissions } from '@/hooks/usePermissions';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[];
}

export function Sidebar({ complejoId }: { complejoId?: string }) {
  const pathname = usePathname();
  const { isSuperAdmin, canManageEmpleados } = usePermissions();

  // Items de navegación para SUPERADMIN
  const superAdminItems: NavItem[] = [
    { name: 'Complejos', href: '/complejos', icon: '🏢' },
  ];

  // Items de navegación para complejo
  const complejoItems: NavItem[] = [
    { name: 'Dashboard', href: `/complejo/${complejoId}`, icon: '📊' },
    { name: 'Turnos', href: `/complejo/${complejoId}/turnos`, icon: '📅' },
    { name: 'Pagos', href: `/complejo/${complejoId}/pagos`, icon: '💰' },
    { name: 'Canchas', href: `/complejo/${complejoId}/canchas`, icon: '⚽' },
    { name: 'Deportes', href: `/complejo/${complejoId}/deportes`, icon: '🏃' },
    {
      name: 'Empleados',
      href: `/complejo/${complejoId}/empleados`,
      icon: '👥',
      roles: ['SUPERADMIN', 'DUENO'],
    },
    { name: 'Turnos Fijos', href: `/complejo/${complejoId}/turnos-fijos`, icon: '🔁' },
    { name: 'Estadísticas', href: `/complejo/${complejoId}/estadisticas`, icon: '📈' },
    { name: 'Configuración', href: `/complejo/${complejoId}/configuracion`, icon: '⚙️' },
      {
    name: 'Personalización',
    href: `/complejo/${complejoId}/personalizacion`,
    icon: '🎨',
    roles: ['DUENO'], // Solo dueños y superadmin
  }
  ];

  const items = isSuperAdmin && !complejoId ? superAdminItems : complejoItems;

  // Filtrar items según permisos
  const filteredItems = items.filter((item) => {
    if (!item.roles) return true;
    if (isSuperAdmin) return true;
    if (item.roles.includes('DUENO') && canManageEmpleados) return true;
    return false;
  });

  return (
    <aside className="sidebar">
      <div className="px-6 py-4 border-b border-primary-800">
        <h1 className="text-xl font-bold text-white">Sistema Turnos</h1>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'sidebar-item',
                isActive && 'sidebar-item-active'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botón volver a complejos (solo para SUPERADMIN cuando está en un complejo) */}
      {isSuperAdmin && complejoId && (
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/complejos"
            className="flex items-center gap-2 px-4 py-3 rounded-md bg-primary-800 hover:bg-primary-700 transition-colors text-sm"
          >
            <span>←</span>
            <span>Volver a Complejos</span>
          </Link>
        </div>
      )}
    </aside>
  );
}