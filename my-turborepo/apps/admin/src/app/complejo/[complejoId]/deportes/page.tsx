'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDeportes } from '@/hooks/useDeportes';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Deporte } from '@/types/api.types';

function DeportesContent({ params }: { params: { complejoId: string } }) {
  const { complejoId } = params;
  const { deportes, isLoading, crearDeporte, editarDeporte, eliminarDeporte } = useDeportes(complejoId);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<Deporte | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Deporte | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    icono: '',
  });

  const resetForm = () => {
    setFormData({ nombre: '', icono: '' });
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearDeporte.mutateAsync({
        ...formData,
        complejoId,
      });
      setModalCrear(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear deporte');
    }
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditar) return;
    try {
      await editarDeporte.mutateAsync({
        id: modalEditar.id,
        ...formData,
      });
      setModalEditar(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al editar deporte');
    }
  };

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await eliminarDeporte.mutateAsync(modalEliminar.id);
      setModalEliminar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar deporte');
    }
  };

  const openModalEditar = (deporte: Deporte) => {
    setFormData({
      nombre: deporte.nombre,
      icono: deporte.icono || '',
    });
    setModalEditar(deporte);
  };

  return (
    <DashboardLayout
      title="Gestión de Deportes"
      subtitle="Administra los deportes disponibles en el complejo"
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
            <h2 className="text-lg font-semibold">Deportes</h2>
            <Button variant="primary" size="sm" onClick={() => setModalCrear(true)}>
              + Nuevo Deporte
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : !deportes || deportes.length === 0 ? (
            <EmptyState
              icon="🏃"
              title="No hay deportes"
              description="Crea el primer deporte para poder agregar canchas"
              action={
                <Button variant="primary" onClick={() => setModalCrear(true)}>
                  + Nuevo Deporte
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icono</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deportes.map((deporte) => (
                  <TableRow key={deporte.id}>
                    <TableCell>
                      <div className="text-2xl">{deporte.icono || '🏃'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{deporte.nombre}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModalEditar(deporte)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setModalEliminar(deporte)}
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
        title={modalEditar ? 'Editar Deporte' : 'Nuevo Deporte'}
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
              isLoading={crearDeporte.isPending || editarDeporte.isPending}
            >
              {modalEditar ? 'Guardar Cambios' : 'Crear Deporte'}
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
              placeholder="Ej: Fútbol 5"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Icono (emoji)</label>
            <input
              type="text"
              className="input"
              placeholder="⚽"
              maxLength={2}
              value={formData.icono}
              onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
            />
            <p className="text-xs text-primary-600 mt-1">
              Usa un emoji para representar el deporte
            </p>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        title="Eliminar Deporte"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleEliminar} isLoading={eliminarDeporte.isPending}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <Alert variant="error">
          ¿Estás seguro de eliminar el deporte <strong>{modalEliminar?.nombre}</strong>?
          No podrás eliminarlo si tiene canchas asociadas.
        </Alert>
      </Modal>
    </DashboardLayout>
  );
}

export default function DeportesPage({ params }: { params:{ complejoId: string } }) {
  return (
    <ProtectedRoute>
      <DeportesContent params={params} />
    </ProtectedRoute>
  );
}