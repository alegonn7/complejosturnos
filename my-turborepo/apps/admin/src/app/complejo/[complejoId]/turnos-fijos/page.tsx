'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTurnosFijos } from '@/hooks/useTurnosFijos';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatDate, getDayName } from '@/lib/utils';
import { TurnoFijo } from '@/types/api.types';

function TurnosFijosContent({ params }: { params: { complejoId: string } }) {
  const { complejoId } = params
  const { turnosFijos, isLoading, pausarTurnoFijo, reactivarTurnoFijo, cancelarTurnoFijo } = useTurnosFijos(complejoId);

  const [modalPausar, setModalPausar] = useState<TurnoFijo | null>(null);
  const [modalReactivar, setModalReactivar] = useState<TurnoFijo | null>(null);
  const [modalCancelar, setModalCancelar] = useState<TurnoFijo | null>(null);
  const [error, setError] = useState('');

  const handlePausar = async () => {
    if (!modalPausar) return;
    try {
      await pausarTurnoFijo.mutateAsync(modalPausar.id);
      setModalPausar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al pausar turno fijo');
    }
  };

  const handleReactivar = async () => {
    if (!modalReactivar) return;
    try {
      await reactivarTurnoFijo.mutateAsync(modalReactivar.id);
      setModalReactivar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reactivar turno fijo');
    }
  };

  const handleCancelar = async () => {
    if (!modalCancelar) return;
    try {
      await cancelarTurnoFijo.mutateAsync(modalCancelar.id);
      setModalCancelar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cancelar turno fijo');
    }
  };

  return (
    <DashboardLayout
      title="Turnos Fijos"
      subtitle="Gestiona los turnos recurrentes del complejo"
      complejoId={complejoId}
    >
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Turnos Fijos Activos</h2>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : !turnosFijos || turnosFijos.length === 0 ? (
            <EmptyState
              icon="🔁"
              title="No hay turnos fijos"
              description="Los clientes pueden solicitar turnos fijos desde la app pública"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Cancha</TableHead>
                  <TableHead>Día y Hora</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Requiere Seña</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFijos.map((turnoFijo) => (
                  <TableRow key={turnoFijo.id}>
                    <TableCell>
                      <div className="font-medium">
                        {turnoFijo.usuario?.nombre} {turnoFijo.usuario?.apellido}
                      </div>
                      <div className="text-xs text-primary-600">
                        {turnoFijo.usuario?.telefono}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{turnoFijo.cancha?.nombre}</div>
                      <div className="text-xs text-primary-600">
                        {turnoFijo.cancha?.deporte?.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getDayName(turnoFijo.diaSemana)} {turnoFijo.horaInicio}
                      </div>
                    </TableCell>
                    <TableCell>{turnoFijo.duracion} min</TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(turnoFijo.fechaInicio)}</div>
                      {turnoFijo.fechaFin && (
                        <div className="text-xs text-primary-600">
                          Hasta: {formatDate(turnoFijo.fechaFin)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {turnoFijo.requiereSeña ? (
                        <Badge variant="yellow">Sí</Badge>
                      ) : (
                        <Badge variant="green">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {turnoFijo.activo ? (
                        <Badge variant="green">Activo</Badge>
                      ) : (
                        <Badge variant="gray">Pausado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {turnoFijo.activo ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setModalPausar(turnoFijo)}
                          >
                            Pausar
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => setModalReactivar(turnoFijo)}
                          >
                            Reactivar
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setModalCancelar(turnoFijo)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal Pausar */}
      <Modal
        isOpen={!!modalPausar}
        onClose={() => setModalPausar(null)}
        title="Pausar Turno Fijo"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalPausar(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handlePausar} isLoading={pausarTurnoFijo.isPending}>
              Pausar
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          ¿Pausar temporalmente este turno fijo? No se generarán más turnos hasta que se reactive.
          Los turnos ya generados seguirán activos.
        </Alert>
      </Modal>

      {/* Modal Reactivar */}
      <Modal
        isOpen={!!modalReactivar}
        onClose={() => setModalReactivar(null)}
        title="Reactivar Turno Fijo"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalReactivar(null)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleReactivar} isLoading={reactivarTurnoFijo.isPending}>
              Reactivar
            </Button>
          </>
        }
      >
        <Alert variant="success">
          ¿Reactivar este turno fijo? Se volverán a generar turnos automáticamente.
        </Alert>
      </Modal>

      {/* Modal Cancelar */}
      <Modal
        isOpen={!!modalCancelar}
        onClose={() => setModalCancelar(null)}
        title="Cancelar Turno Fijo"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalCancelar(null)}>
              No, volver
            </Button>
            <Button variant="danger" onClick={handleCancelar} isLoading={cancelarTurnoFijo.isPending}>
              Sí, cancelar definitivamente
            </Button>
          </>
        }
      >
        <Alert variant="error">
          ¿Estás seguro de cancelar este turno fijo? Se eliminarán todos los turnos futuros generados.
          Esta acción no se puede deshacer.
        </Alert>
      </Modal>
    </DashboardLayout>
  );
}

export default function TurnosFijosPage({ params }: { params: { complejoId: string } }) {
  return (
    <ProtectedRoute>
      <TurnosFijosContent params={params} />
    </ProtectedRoute>
  );
}