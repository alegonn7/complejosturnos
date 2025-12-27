'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEstadisticas } from '@/hooks/useEstadisticas';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatTime } from '@/lib/utils';
import { TURNO_COLORS, TURNO_LABELS } from '@/lib/constants';

function DashboardContent({ params }: { params: { complejoId: string } }) {
  const { complejoId } = params;
  const { dashboard, isLoading } = useEstadisticas(complejoId);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" complejoId={complejoId}>
        <div className="py-12">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard) {
    return (
      <DashboardLayout title="Dashboard" complejoId={complejoId}>
        <div className="text-center py-12">
          <p className="text-primary-600">No hay datos disponibles</p>
        </div>
      </DashboardLayout>
    );
  }

  const { resumenHoy, proximosTurnos, pagosPendientes, turnosFijosActivos, alertas, tendenciaSemanal } = dashboard;

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Resumen del ${resumenHoy.fecha}`}
      complejoId={complejoId}
    >
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600">Turnos Hoy</p>
                <p className="text-3xl font-bold text-primary-900 mt-1">
                  {resumenHoy.turnosConfirmados}/{resumenHoy.totalTurnos}
                </p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600">Ingresos Hoy</p>
                <p className="text-3xl font-bold text-primary-900 mt-1">
                  {formatPrice(resumenHoy.ingresosDia)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600">Ocupación</p>
                <p className="text-3xl font-bold text-primary-900 mt-1">
                  {resumenHoy.ocupacion.toFixed(1)}%
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-primary-900 mt-1">
                  {pagosPendientes}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        {alertas && alertas.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">⚠️ Alertas Importantes</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {alertas.map((alerta, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${alerta.prioridad === 'ALTA'
                        ? 'bg-red-50 border-red-200'
                        : alerta.prioridad === 'MEDIA'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                  >
                    <p className="text-sm font-medium">{alerta.mensaje}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Próximos turnos */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">📍 Próximos Turnos</h3>
          </CardHeader>
          <CardBody>
            {!proximosTurnos || proximosTurnos.length === 0 ? (
              <p className="text-sm text-primary-600 text-center py-4">
                No hay turnos próximos
              </p>
            ) : (
              <div className="space-y-3">
                {proximosTurnos.map((turno) => (
                  <div
                    key={turno.id}
                    className="flex items-center justify-between p-3 bg-primary-50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {turno.cancha?.nombre || 'Cancha'}
                      </p>
                      <p className="text-xs text-primary-600">
                        {turno.nombreCliente} {turno.apellidoCliente}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatTime(turno.fecha)}
                      </p>
                      <Badge variant={TURNO_COLORS[turno.estado]}>
                        {TURNO_LABELS[turno.estado]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Tendencia semanal */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">📈 Tendencia Semanal</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-600">Turnos</span>
                  <span className={`text-sm font-semibold ${tendenciaSemanal.variacion.turnos.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {tendenciaSemanal.variacion.turnos}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary-600">
                  <span>Esta semana: {tendenciaSemanal.semanaActual.turnos}</span>
                  <span>•</span>
                  <span>Anterior: {tendenciaSemanal.semanaAnterior.turnos}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-600">Ingresos</span>
                  <span className={`text-sm font-semibold ${tendenciaSemanal.variacion.ingresos.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {tendenciaSemanal.variacion.ingresos}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary-600">
                  <span>Esta semana: {formatPrice(tendenciaSemanal.semanaActual.ingresos)}</span>
                  <span>•</span>
                  <span>Anterior: {formatPrice(tendenciaSemanal.semanaAnterior.ingresos)}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Info adicional */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">ℹ️ Información</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-600">Turnos Fijos Activos</span>
                <span className="text-lg font-semibold">{turnosFijosActivos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-600">Tasa de Ocupación Promedio</span>
                <span className="text-lg font-semibold">{resumenHoy.ocupacion.toFixed(1)}%</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage({ params }: { params: { complejoId: string } }) {
  return (
    <ProtectedRoute>
      <DashboardContent params={params} />
    </ProtectedRoute>
  );
}