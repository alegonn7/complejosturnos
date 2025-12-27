'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCanchas } from '@/hooks/useCanchas';
import { useDeportes } from '@/hooks/useDeportes';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatPrice } from '@/lib/utils';
import { CANCHA_COLORS, CANCHA_LABELS } from '@/lib/constants';
import { Cancha} from '@/types/api.types';
import { EstadoCancha } from '@/types/enums';

function CanchasContent({ params }: { params: { complejoId: string } }) {
  const { complejoId } = params
  const { canchas, isLoading, crearCancha, editarCancha, cambiarEstado, eliminarCancha } = useCanchas(complejoId);
  const { deportes } = useDeportes(complejoId);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<Cancha | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Cancha | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    deporteId: '',
    precioBase: '',
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      deporteId: '',
      precioBase: '',
    });
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearCancha.mutateAsync({
        ...formData,
        complejoId,
        estado: EstadoCancha.HABILITADA,
      });
      setModalCrear(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear cancha');
    }
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditar) return;
    try {
      await editarCancha.mutateAsync({
        id: modalEditar.id,
        ...formData,
      });
      setModalEditar(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al editar cancha');
    }
  };

  const handleCambiarEstado = async (id: string, estado: EstadoCancha) => {
    try {
      await cambiarEstado.mutateAsync({ id, estado });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await eliminarCancha.mutateAsync(modalEliminar.id);
      setModalEliminar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar cancha');
    }
  };

  const openModalEditar = (cancha: Cancha) => {
    setFormData({
      nombre: cancha.nombre,
      descripcion: cancha.descripcion || '',
      deporteId: cancha.deporteId,
      precioBase: cancha.precioBase,
    });
    setModalEditar(cancha);
  };

  return (
    <DashboardLayout
      title="Gestión de Canchas"
      subtitle="Administra las canchas del complejo"
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
            <h2 className="text-lg font-semibold">Canchas</h2>
            <Button variant="primary" size="sm" onClick={() => setModalCrear(true)}>
              + Nueva Cancha
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : !canchas || canchas.length === 0 ? (
            <EmptyState
              icon="⚽"
              title="No hay canchas"
              description="Crea la primera cancha para comenzar a gestionar turnos"
              action={
                <Button variant="primary" onClick={() => setModalCrear(true)}>
                  + Nueva Cancha
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Deporte</TableHead>
                  <TableHead>Precio Base</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {canchas.map((cancha) => (
                  <TableRow key={cancha.id}>
                    <TableCell>
                      <div className="font-medium">{cancha.nombre}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cancha.deporte?.nombre || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{formatPrice(cancha.precioBase)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={CANCHA_COLORS[cancha.estado]}>
                        {CANCHA_LABELS[cancha.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-primary-600 max-w-xs truncate">
                        {cancha.descripcion || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {cancha.estado === EstadoCancha.HABILITADA ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCambiarEstado(cancha.id, EstadoCancha.DESHABILITADA)}
                          >
                            Deshabilitar
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCambiarEstado(cancha.id, EstadoCancha.HABILITADA)}
                          >
                            Habilitar
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModalEditar(cancha)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setModalEliminar(cancha)}
                        >
                          Eliminar
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

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalCrear || !!modalEditar}
        onClose={() => {
          setModalCrear(false);
          setModalEditar(null);
          resetForm();
          setError('');
        }}
        title={modalEditar ? 'Editar Cancha' : 'Nueva Cancha'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalCrear(false);
                setModalEditar(null);
                resetForm();
                setError('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={modalEditar ? handleEditar : handleCrear}
              isLoading={crearCancha.isPending || editarCancha.isPending}
            >
              {modalEditar ? 'Guardar Cambios' : 'Crear Cancha'}
            </Button>
          </>
        }
      >
        <form onSubmit={modalEditar ? handleEditar : handleCrear} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Cancha 1"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Deporte *</label>
            <select
              className="input"
              value={formData.deporteId}
              onChange={(e) => setFormData({ ...formData, deporteId: e.target.value })}
              required
            >
              <option value="">Selecciona un deporte</option>
              {deportes?.map((deporte) => (
                <option key={deporte.id} value={deporte.id}>
                  {deporte.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Precio Base *</label>
            <input
              type="number"
              className="input"
              placeholder="3000"
              step="0.01"
              value={formData.precioBase}
              onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Descripción opcional de la cancha"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        title="Eliminar Cancha"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleEliminar} isLoading={eliminarCancha.isPending}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <Alert variant="error">
          ¿Estás seguro de eliminar la cancha <strong>{modalEliminar?.nombre}</strong>?
          Esta acción no se puede deshacer.
        </Alert>
      </Modal>
    </DashboardLayout>
  );
}

export default function CanchasPage({ params }: { params: { complejoId: string } }) {
  return (
    <ProtectedRoute>
      <CanchasContent params={params} />
    </ProtectedRoute>
  );
}