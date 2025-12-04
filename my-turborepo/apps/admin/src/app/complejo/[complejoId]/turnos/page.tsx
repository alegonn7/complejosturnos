'use client';

import { use, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTurnos } from '@/hooks/useTurnos';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { TurnosTable } from '@/components/tables/TurnosTable';

function TurnosContent({ params }: { params: Promise<{ complejoId: string }> }) {
  const { complejoId } = use(params);
  const { turnos, isLoading, confirmarTurno, marcarAusente, bloquearTurno, cancelarTurno } = useTurnos(complejoId);

  const [modalConfirmar, setModalConfirmar] = useState<string | null>(null);
  const [modalAusente, setModalAusente] = useState<string | null>(null);
  const [modalBloquear, setModalBloquear] = useState<string | null>(null);
  const [modalCancelar, setModalCancelar] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleConfirmar = async () => {
    if (!modalConfirmar) return;
    try {
      await confirmarTurno.mutateAsync(modalConfirmar);
      setModalConfirmar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al confirmar turno');
    }
  };

  const handleAusente = async () => {
    if (!modalAusente) return;
    try {
      await marcarAusente.mutateAsync(modalAusente);
      setModalAusente(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al marcar ausente');
    }
  };

  const handleBloquear = async () => {
    if (!modalBloquear) return;
    try {
      await bloquearTurno.mutateAsync(modalBloquear);
      setModalBloquear(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al bloquear turno');
    }
  };

  const handleCancelar = async () => {
    if (!modalCancelar) return;
    try {
      await cancelarTurno.mutateAsync(modalCancelar);
      setModalCancelar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cancelar turno');
    }
  };

  const getTurno = (id: string) => turnos?.find(t => t.id === id);

  return (
    <DashboardLayout
      title="Gestión de Turnos"
      subtitle="Administra los turnos del complejo"
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
            <h2 className="text-lg font-semibold">Turnos</h2>
            <Button variant="primary" size="sm">
              + Reservar Turno
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : !turnos || turnos.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No hay turnos"
              description="Genera turnos automáticamente desde Configuración de Canchas"
            />
          ) : (
            <TurnosTable
              turnos={turnos}
              onConfirmar={(id) => setModalConfirmar(id)}
              onMarcarAusente={(id) => setModalAusente(id)}
              onBloquear={(id) => setModalBloquear(id)}
              onCancelar={(id) => setModalCancelar(id)}
              isLoading={confirmarTurno.isPending || marcarAusente.isPending || bloquearTurno.isPending || cancelarTurno.isPending}
            />
          )}
        </CardBody>
      </Card>

      {/* Modal Confirmar */}
      <Modal
        isOpen={!!modalConfirmar}
        onClose={() => setModalConfirmar(null)}
        title="Confirmar Turno"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalConfirmar(null)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleConfirmar} isLoading={confirmarTurno.isPending}>
              Confirmar
            </Button>
          </>
        }
      >
        <Alert variant="info">
          ¿Confirmar este turno manualmente? El turno pasará a estado CONFIRMADO.
        </Alert>
      </Modal>

      {/* Modal Ausente */}
      <Modal
        isOpen={!!modalAusente}
        onClose={() => setModalAusente(null)}
        title="Marcar como Ausente"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAusente(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleAusente} isLoading={marcarAusente.isPending}>
              Marcar Ausente
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          ¿El cliente no se presentó? Esto marcará el turno como AUSENTE.
        </Alert>
      </Modal>

      {/* Modal Bloquear */}
      <Modal
        isOpen={!!modalBloquear}
        onClose={() => setModalBloquear(null)}
        title="Bloquear Turno"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalBloquear(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleBloquear} isLoading={bloquearTurno.isPending}>
              Bloquear
            </Button>
          </>
        }
      >
        <Alert variant="info">
          Este turno quedará bloqueado y no estará disponible para reservar.
        </Alert>
      </Modal>

      {/* Modal Cancelar */}
      <Modal
        isOpen={!!modalCancelar}
        onClose={() => setModalCancelar(null)}
        title="Cancelar Turno"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalCancelar(null)}>
              No, volver
            </Button>
            <Button variant="danger" onClick={handleCancelar} isLoading={cancelarTurno.isPending}>
              Sí, cancelar
            </Button>
          </>
        }
      >
        <Alert variant="error">
          ¿Estás seguro de cancelar este turno? Esta acción no se puede deshacer.
        </Alert>
      </Modal>
    </DashboardLayout>
  );
}

export default function TurnosPage({ params }: { params: Promise<{ complejoId: string }> }) {
  return (
    <ProtectedRoute>
      <TurnosContent params={params} />
    </ProtectedRoute>
  );
}