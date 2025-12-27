'use client';

import { useState } from 'react';
import { use } from 'react';
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

function TurnosContent({ params }: { params: { complejoId: string } }) {
  const { complejoId } = params

  const { 
    turnos, 
    isLoading, 
    confirmarTurno, 
    marcarAusente, 
    bloquearTurno, 
    cancelarTurno,
    generarTurnosAutomatico 
  } = useTurnos(complejoId);

  const [modalConfirmar, setModalConfirmar] = useState<string | null>(null);
  const [modalAusente, setModalAusente] = useState<string | null>(null);
  const [modalBloquear, setModalBloquear] = useState<string | null>(null);
  const [modalCancelar, setModalCancelar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroCancha, setFiltroCancha] = useState<string>('TODAS');

  const handleConfirmar = async () => {
    if (!modalConfirmar) return;
    try {
      await confirmarTurno.mutateAsync(modalConfirmar);
      setModalConfirmar(null);
      setSuccess('Turno confirmado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al confirmar turno');
    }
  };

  const handleAusente = async () => {
    if (!modalAusente) return;
    try {
      await marcarAusente.mutateAsync(modalAusente);
      setModalAusente(null);
      setSuccess('Turno marcado como ausente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al marcar ausente');
    }
  };

  const handleBloquear = async () => {
    if (!modalBloquear) return;
    try {
      await bloquearTurno.mutateAsync(modalBloquear);
      setModalBloquear(null);
      setSuccess('Turno bloqueado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al bloquear turno');
    }
  };

  const handleCancelar = async () => {
    if (!modalCancelar) return;
    try {
      await cancelarTurno.mutateAsync(modalCancelar);
      setModalCancelar(null);
      setSuccess('Turno cancelado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cancelar turno');
    }
  };

  const handleGenerarTurnos = async () => {
    try {
      setError('');
      setSuccess('');
      await generarTurnosAutomatico.mutateAsync();
      setSuccess('✅ Turnos generados correctamente. Recarga la página para verlos.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar turnos');
    }
  };

  // Obtener canchas únicas
  const canchasUnicas = turnos 
    ? Array.from(new Set(turnos.map(t => t.cancha?.nombre).filter(Boolean)))
    : [];

  // Filtrar turnos
  const turnosFiltrados = turnos?.filter(turno => {
    const matchEstado = filtroEstado === 'TODOS' || turno.estado === filtroEstado;
    const matchCancha = filtroCancha === 'TODAS' || turno.cancha?.nombre === filtroCancha;
    return matchEstado && matchCancha;
  });

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

      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold">Turnos</h2>
              {turnosFiltrados && (
                <p className="text-sm text-primary-600 mt-1">
                  Mostrando {turnosFiltrados.length} de {turnos?.length || 0} turnos
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleGenerarTurnos}
                isLoading={generarTurnosAutomatico.isPending}
              >
                🔄 Generar Turnos
              </Button>
              <Button variant="primary" size="sm">
                + Reservar Turno
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Filtros */}
          {turnos && turnos.length > 0 && (
            <div className="mb-6 flex gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="input w-48"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="SENA_ENVIADA">Seña Enviada</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="EXPIRADO">Expirado</option>
                  <option value="AUSENTE">Ausente</option>
                  <option value="BLOQUEADO">Bloqueado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Cancha
                </label>
                <select
                  value={filtroCancha}
                  onChange={(e) => setFiltroCancha(e.target.value)}
                  className="input w-48"
                >
                  <option value="TODAS">Todas las canchas</option>
                  {canchasUnicas.map(cancha => (
                    <option key={cancha} value={cancha}>
                      {cancha}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : !turnos || turnos.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No hay turnos generados"
              description="Genera turnos automáticamente haciendo clic en el botón 'Generar Turnos'"
              action={
                <Button 
                  variant="primary" 
                  onClick={handleGenerarTurnos}
                  isLoading={generarTurnosAutomatico.isPending}
                >
                  🔄 Generar Turnos Ahora
                </Button>
              }
            />
          ) : turnosFiltrados && turnosFiltrados.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No hay turnos con estos filtros"
              description="Intenta cambiar los filtros para ver más resultados"
            />
          ) : (
            <TurnosTable
              turnos={turnosFiltrados || []}
              onConfirmar={(id) => setModalConfirmar(id)}
              onMarcarAusente={(id) => setModalAusente(id)}
              onBloquear={(id) => setModalBloquear(id)}
              onCancelar={(id) => setModalCancelar(id)}
              isLoading={
                confirmarTurno.isPending || 
                marcarAusente.isPending || 
                bloquearTurno.isPending || 
                cancelarTurno.isPending
              }
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
        <div className="space-y-4">
          <Alert variant="info">
            ¿Confirmar este turno manualmente? El turno pasará a estado CONFIRMADO.
          </Alert>
          {modalConfirmar && getTurno(modalConfirmar) && (
            <div className="bg-primary-50 p-4 rounded-md">
              <p className="text-sm text-primary-700">
                <strong>Cancha:</strong> {getTurno(modalConfirmar)?.cancha?.nombre || 'N/A'}
              </p>
              <p className="text-sm text-primary-700 mt-1">
                <strong>Cliente:</strong> {getTurno(modalConfirmar)?.nombreCliente} {getTurno(modalConfirmar)?.apellidoCliente}
              </p>
              <p className="text-sm text-primary-700 mt-1">
                <strong>Fecha:</strong> {getTurno(modalConfirmar)?.fecha ? new Date(getTurno(modalConfirmar)!.fecha).toLocaleString('es-AR') : 'N/A'}
              </p>
            </div>
          )}
        </div>
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
        <div className="space-y-4">
          <Alert variant="warning">
            ¿El cliente no se presentó? Esto marcará el turno como AUSENTE.
          </Alert>
          {modalAusente && getTurno(modalAusente) && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Cliente:</strong> {getTurno(modalAusente)?.nombreCliente} {getTurno(modalAusente)?.apellidoCliente}
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                <strong>Teléfono:</strong> {getTurno(modalAusente)?.telefonoCliente}
              </p>
            </div>
          )}
        </div>
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
        <div className="space-y-4">
          <Alert variant="error">
            ¿Estás seguro de cancelar este turno? Esta acción no se puede deshacer.
          </Alert>
          {modalCancelar && getTurno(modalCancelar) && (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Turno:</strong> {getTurno(modalCancelar)?.cancha?.nombre || 'N/A'}
              </p>
              <p className="text-sm text-red-800 mt-1">
                <strong>Fecha:</strong> {getTurno(modalCancelar)?.fecha ? new Date(getTurno(modalCancelar)!.fecha).toLocaleString('es-AR') : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default function TurnosPage({ params }: { params: { complejoId: string } }) {
  return (
    <ProtectedRoute>
      <TurnosContent params={params} />
    </ProtectedRoute>
  );
}