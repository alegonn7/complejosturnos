'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEmpleados } from '@/hooks/useEmpleados';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Usuario } from '@/types/api.types';

function EmpleadosContent({ params }: { params: { complejoId: string } }) {
  const { complejoId } = params;
  const { canManageEmpleados } = usePermissions();
  const { empleados, isLoading, crearEmpleado, editarEmpleado, cambiarPassword, eliminarEmpleado } = useEmpleados(complejoId);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<Usuario | null>(null);
  const [modalPassword, setModalPassword] = useState<Usuario | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Usuario | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
  });

  const [newPassword, setNewPassword] = useState('');

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      password: '',
    });
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearEmpleado.mutateAsync(formData);
      setModalCrear(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear empleado');
    }
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditar) return;
    try {
      await editarEmpleado.mutateAsync({
        id: modalEditar.id,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email || null,
      });
      setModalEditar(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al editar empleado');
    }
  };

  const handleCambiarPassword = async () => {
    if (!modalPassword) return;
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await cambiarPassword.mutateAsync({
        id: modalPassword.id,
        password: newPassword,
      });
      setModalPassword(null);
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await eliminarEmpleado.mutateAsync(modalEliminar.id);
      setModalEliminar(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar empleado');
    }
  };

  const openModalEditar = (empleado: Usuario) => {
    setFormData({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      telefono: empleado.telefono,
      email: empleado.email || '',
      password: '',
    });
    setModalEditar(empleado);
  };

  if (!canManageEmpleados) {
    return (
      <DashboardLayout title="Sin Acceso" complejoId={complejoId}>
        <Alert variant="error">
          No tienes permisos para gestionar empleados.
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Gestión de Empleados"
      subtitle="Administra los empleados del complejo"
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
            <h2 className="text-lg font-semibold">Empleados</h2>
            <Button variant="primary" size="sm" onClick={() => setModalCrear(true)}>
              + Nuevo Empleado
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : !empleados || empleados.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No hay empleados"
              description="Agrega empleados para que ayuden a gestionar el complejo"
              action={
                <Button variant="primary" onClick={() => setModalCrear(true)}>
                  + Nuevo Empleado
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell>
                      <div className="font-medium">
                        {empleado.nombre} {empleado.apellido}
                      </div>
                    </TableCell>
                    <TableCell>{empleado.telefono}</TableCell>
                    <TableCell>{empleado.email || '-'}</TableCell>
                    <TableCell>
                      <span className="text-sm text-primary-600">{empleado.rol}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModalEditar(empleado)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setModalPassword(empleado)}
                        >
                          Cambiar Clave
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setModalEliminar(empleado)}
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

      {/* Modal Crear */}
      <Modal
        isOpen={modalCrear}
        onClose={() => {
          setModalCrear(false);
          resetForm();
          setError('');
        }}
        title="Nuevo Empleado"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalCrear(false);
                resetForm();
                setError('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCrear}
              isLoading={crearEmpleado.isPending}
            >
              Crear Empleado
            </Button>
          </>
        }
      >
        <form onSubmit={handleCrear} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                className="input"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Apellido *</label>
              <input
                type="text"
                className="input"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Teléfono *</label>
            <input
              type="tel"
              className="input"
              placeholder="+5491112345678"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Contraseña *</label>
            <input
              type="password"
              className="input"
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <p className="text-xs text-primary-600 mt-1">Mínimo 6 caracteres</p>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={!!modalEditar}
        onClose={() => {
          setModalEditar(null);
          resetForm();
          setError('');
        }}
        title="Editar Empleado"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalEditar(null);
                resetForm();
                setError('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleEditar}
              isLoading={editarEmpleado.isPending}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                className="input"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Apellido *</label>
              <input
                type="text"
                className="input"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Teléfono *</label>
            <input
              type="tel"
              className="input"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Cambiar Password */}
      <Modal
        isOpen={!!modalPassword}
        onClose={() => {
          setModalPassword(null);
          setNewPassword('');
          setError('');
        }}
        title="Cambiar Contraseña"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalPassword(null);
                setNewPassword('');
                setError('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCambiarPassword}
              isLoading={cambiarPassword.isPending}
            >
              Cambiar Contraseña
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info">
            Cambiarás la contraseña de <strong>{modalPassword?.nombre} {modalPassword?.apellido}</strong>
          </Alert>

          <div>
            <label className="label">Nueva Contraseña *</label>
            <input
              type="password"
              className="input"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        title="Eliminar Empleado"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleEliminar} isLoading={eliminarEmpleado.isPending}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <Alert variant="error">
          ¿Estás seguro de eliminar a <strong>{modalEliminar?.nombre} {modalEliminar?.apellido}</strong>?
          Ya no tendrá acceso al sistema.
        </Alert>
      </Modal>
    </DashboardLayout>
  );
}

export default function EmpleadosPage({ params }: { params: { complejoId: string } }) {
  return (
    <ProtectedRoute>
      <EmpleadosContent params={params} />
    </ProtectedRoute>
  );
}