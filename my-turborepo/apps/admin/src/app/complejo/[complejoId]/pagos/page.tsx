'use client';

import { use, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePagos } from '@/hooks/usePagos';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatPrice, formatDateTime, getTimeAgo } from '@/lib/utils';
import { PAGO_COLORS, PAGO_LABELS, TURNO_LABELS } from '@/lib/constants';
import { Pago } from '@/types/api.types';

function PagosContent({ params }: { params: Promise<{ complejoId: string }> }) {
  const { complejoId } = use(params);
  const { pagosPendientes, isLoading, aprobarPago, rechazarPago } = usePagos(complejoId);

  const [modalAprobar, setModalAprobar] = useState<Pago | null>(null);
  const [modalRechazar, setModalRechazar] = useState<Pago | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');

  const handleAprobar = async () => {
    if (!modalAprobar) return;

    try {
      await aprobarPago.mutateAsync(modalAprobar.id);
      setModalAprobar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar pago');
    }
  };

  const handleRechazar = async () => {
    if (!modalRechazar) return;

    if (!motivoRechazo.trim()) {
      setError('Debes indicar el motivo del rechazo');
      return;
    }

    try {
      await rechazarPago.mutateAsync({
        pagoId: modalRechazar.id,
        motivo: motivoRechazo,
      });
      setModalRechazar(null);
      setMotivoRechazo('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar pago');
    }
  };

  const handleWhatsApp = (telefono: string) => {
    const numero = telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${numero}`, '_blank');
  };

  return (
    <DashboardLayout
      title="Gestión de Pagos"
      subtitle="Valida los pagos pendientes"
      complejoId={complejoId}
    >
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pagos Pendientes de Validación</h2>
            <Badge variant="yellow">
              {pagosPendientes?.length || 0} pendientes
            </Badge>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : !pagosPendientes || pagosPendientes.length === 0 ? (
            <EmptyState
              icon="✅"
              title="No hay pagos pendientes"
              description="Todos los pagos han sido validados"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagosPendientes.map((pago) => {
                  const turno = pago.turno!;
                  return (
                    <TableRow key={pago.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {turno.cancha?.nombre || 'Cancha'}
                          </div>
                          <div className="text-xs text-primary-600">
                            {formatDateTime(turno.fecha)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {turno.nombreCliente} {turno.apellidoCliente}
                          </div>
                          <button
                            onClick={() => handleWhatsApp(turno.telefonoCliente!)}
                            className="text-xs text-green-600 hover:text-green-700 hover:underline"
                          >
                            📱 {turno.telefonoCliente}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatPrice(pago.monto)}
                        </div>
                        <div className="text-xs text-primary-600">
                          de {formatPrice(turno.precioTotal)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{pago.metodo}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {pago.fechaEnvio ? getTimeAgo(pago.fechaEnvio) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PAGO_COLORS[pago.estado]}>
                          {PAGO_LABELS[pago.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => setModalAprobar(pago)}
                            disabled={aprobarPago.isPending}
                          >
                            ✓ Aprobar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setModalRechazar(pago)}
                            disabled={rechazarPago.isPending}
                          >
                            ✗ Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal Aprobar */}
      <Modal
        isOpen={!!modalAprobar}
        onClose={() => setModalAprobar(null)}
        title="Aprobar Pago"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalAprobar(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={handleAprobar}
              isLoading={aprobarPago.isPending}
            >
              Confirmar Aprobación
            </Button>
          </>
        }
      >
        {modalAprobar && (
          <div className="space-y-4">
            <Alert variant="info">
              Al aprobar este pago, el turno pasará a estado <strong>CONFIRMADO</strong>.
            </Alert>

            <div className="bg-primary-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-primary-600">Cliente:</span>
                <span className="font-medium">
                  {modalAprobar.turno?.nombreCliente} {modalAprobar.turno?.apellidoCliente}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-600">Monto:</span>
                <span className="font-semibold text-green-600">
                  {formatPrice(modalAprobar.monto)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-600">Turno:</span>
                <span className="font-medium">
                  {formatDateTime(modalAprobar.turno!.fecha)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Rechazar */}
      <Modal
        isOpen={!!modalRechazar}
        onClose={() => {
          setModalRechazar(null);
          setMotivoRechazo('');
          setError('');
        }}
        title="Rechazar Pago"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalRechazar(null);
                setMotivoRechazo('');
                setError('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRechazar}
              isLoading={rechazarPago.isPending}
            >
              Confirmar Rechazo
            </Button>
          </>
        }
      >
        {modalRechazar && (
          <div className="space-y-4">
            <Alert variant="warning">
              Al rechazar este pago, el turno volverá a estado <strong>DISPONIBLE</strong>.
            </Alert>

            <div>
              <label className="label">
                Motivo del rechazo <span className="text-red-600">*</span>
              </label>
              <textarea
                className="input"
                rows={4}
                placeholder="Ej: Comprobante ilegible, monto incorrecto, etc."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default function PagosPage({ params }: { params: Promise<{ complejoId: string }> }) {
  return (
    <ProtectedRoute>
      <PagosContent params={params} />
    </ProtectedRoute>
  );
}