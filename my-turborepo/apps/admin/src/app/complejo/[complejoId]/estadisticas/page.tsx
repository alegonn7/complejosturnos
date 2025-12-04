'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/lib/utils';

interface RendimientoData {
  periodoActual: {
    fechaInicio: string;
    fechaFin: string;
    turnos: {
      totales: number;
      confirmados: number;
      tasaOcupacion: number;
      tasaAusencias: number;
    };
    ingresos: {
      brutos: number;
      promedioPorTurno: number;
    };
    clientes: {
      totales: number;
      nuevos: number;
      tasaRetencion: number;
    };
    mejorCancha: { nombre: string; ocupacion: number } | null;
    peorCancha: { nombre: string; ocupacion: number } | null;
  };
  comparacion: {
    turnos: { variacion: string; diferencia: number };
    ingresos: { variacion: string; diferencia: number };
  };
  insights: string[];
}

function EstadisticasContent({ params }: { params: Promise<{ complejoId: string }> }) {
  const { complejoId } = use(params);
  const [periodo, setPeriodo] = useState<'semanal' | 'mensual' | 'anual'>('mensual');

  const { data: rendimiento, isLoading } = useQuery({
    queryKey: ['estadisticas', 'rendimiento', complejoId, periodo],
    queryFn: async () => {
      const { data } = await api.get<RendimientoData>('/estadisticas/rendimiento', {
        params: { complejoId, periodo, comparar: true },
      });
      return data;
    },
  });

  return (
    <DashboardLayout
      title="Estadísticas"
      subtitle="Análisis detallado del rendimiento"
      complejoId={complejoId}
    >
      {/* Selector de período */}
      <div className="mb-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-primary-700">Período:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriodo('semanal')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    periodo === 'semanal'
                      ? 'bg-primary-900 text-white'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setPeriodo('mensual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    periodo === 'mensual'
                      ? 'bg-primary-900 text-white'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setPeriodo('anual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    periodo === 'anual'
                      ? 'bg-primary-900 text-white'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  Anual
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner />
        </div>
      ) : !rendimiento ? (
        <Card>
          <CardBody>
            <p className="text-center text-primary-600 py-8">
              No hay datos disponibles para este período
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardBody>
                <div className="text-sm text-primary-600 mb-2">Turnos Totales</div>
                <div className="text-3xl font-bold">{rendimiento.periodoActual.turnos.totales}</div>
                <div className="text-sm mt-2">
                  <span className={rendimiento.comparacion.turnos.variacion.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {rendimiento.comparacion.turnos.variacion}
                  </span>
                  <span className="text-primary-600"> vs período anterior</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="text-sm text-primary-600 mb-2">Ocupación</div>
                <div className="text-3xl font-bold">{rendimiento.periodoActual.turnos.tasaOcupacion.toFixed(1)}%</div>
                <div className="text-sm mt-2 text-primary-600">
                  {rendimiento.periodoActual.turnos.confirmados} confirmados
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="text-sm text-primary-600 mb-2">Ingresos Brutos</div>
                <div className="text-3xl font-bold">{formatPrice(rendimiento.periodoActual.ingresos.brutos)}</div>
                <div className="text-sm mt-2">
                  <span className={rendimiento.comparacion.ingresos.variacion.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {rendimiento.comparacion.ingresos.variacion}
                  </span>
                  <span className="text-primary-600"> vs período anterior</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="text-sm text-primary-600 mb-2">Promedio por Turno</div>
                <div className="text-3xl font-bold">{formatPrice(rendimiento.periodoActual.ingresos.promedioPorTurno)}</div>
                <div className="text-sm mt-2 text-primary-600">
                  Precio medio
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Métricas secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">👥 Clientes</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-primary-600">Total</span>
                    <span className="font-semibold">{rendimiento.periodoActual.clientes.totales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-primary-600">Nuevos</span>
                    <span className="font-semibold text-green-600">{rendimiento.periodoActual.clientes.nuevos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-primary-600">Retención</span>
                    <span className="font-semibold">{rendimiento.periodoActual.clientes.tasaRetencion.toFixed(1)}%</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">🏆 Mejor Cancha</h3>
              </CardHeader>
              <CardBody>
                {rendimiento.periodoActual.mejorCancha ? (
                  <div>
                    <div className="text-lg font-bold">{rendimiento.periodoActual.mejorCancha.nombre}</div>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {rendimiento.periodoActual.mejorCancha.ocupacion.toFixed(1)}%
                    </div>
                    <div className="text-sm text-primary-600 mt-1">ocupación</div>
                  </div>
                ) : (
                  <p className="text-sm text-primary-600">Sin datos</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">⚠️ Peor Cancha</h3>
              </CardHeader>
              <CardBody>
                {rendimiento.periodoActual.peorCancha ? (
                  <div>
                    <div className="text-lg font-bold">{rendimiento.periodoActual.peorCancha.nombre}</div>
                    <div className="text-2xl font-bold text-yellow-600 mt-2">
                      {rendimiento.periodoActual.peorCancha.ocupacion.toFixed(1)}%
                    </div>
                    <div className="text-sm text-primary-600 mt-1">ocupación</div>
                  </div>
                ) : (
                  <p className="text-sm text-primary-600">Sin datos</p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Insights */}
          {rendimiento.insights && rendimiento.insights.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">💡 Insights</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {rendimiento.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary-50 rounded-md">
                      <span className="text-lg">{insight.charAt(0)}</span>
                      <p className="text-sm flex-1">{insight.substring(2)}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Tasa de ausencias */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">📉 Tasa de Ausencias</h3>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">
                  {rendimiento.periodoActual.turnos.tasaAusencias.toFixed(1)}%
                </div>
                <p className="text-sm text-primary-600 mt-2">
                  Clientes que no se presentaron
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function EstadisticasPage({ params }: { params: Promise<{ complejoId: string }> }) {
  return (
    <ProtectedRoute>
      <EstadisticasContent params={params} />
    </ProtectedRoute>
  );
}