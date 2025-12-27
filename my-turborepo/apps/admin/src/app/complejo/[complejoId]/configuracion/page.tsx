'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Complejo } from '@/types/api.types';

function ConfiguracionContent({ params }: { params: { complejoId: string } }) {
    const { complejoId } = params;
    const { canEditComplejo } = usePermissions();
    const queryClient = useQueryClient();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: complejo, isLoading } = useQuery({
        queryKey: ['complejo', complejoId],
        queryFn: async () => {
            const { data } = await api.get<Complejo>(`/complejos/${complejoId}`);
            return data;
        },
    });

    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        numeroWhatsapp: '',
        requiereSeña: true,
        porcentajeSeña: 50,
        minutosExpiracion: 30,
        permiteTurnosFijos: true,
    });

    const [datosBancarios, setDatosBancarios] = useState({
        cbu: '',
        alias: '',
        titular: '',
    });

    useEffect(() => {
        if (complejo) {
            setFormData({
                nombre: complejo.nombre,
                direccion: complejo.direccion,
                telefono: complejo.telefono,
                email: complejo.email || '',
                numeroWhatsapp: complejo.numeroWhatsapp || '',
                requiereSeña: complejo.requiereSeña,
                porcentajeSeña: complejo.porcentajeSeña,
                minutosExpiracion: complejo.minutosExpiracion,
                permiteTurnosFijos: complejo.permiteTurnosFijos,
            });

            setDatosBancarios({
                cbu: complejo.cbu || '',
                alias: complejo.alias || '',
                titular: complejo.titular || '',
            });
        }
    }, [complejo]);

    const actualizarComplejo = useMutation({
        mutationFn: async (data: Partial<Complejo>) => {
            const response = await api.patch(`/complejos/${complejoId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complejo', complejoId] });
            setSuccess('Configuración actualizada correctamente');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al actualizar configuración');
        },
    });

    const actualizarDatosBancarios = useMutation({
        mutationFn: async (data: { cbu?: string; alias?: string; titular?: string }) => {
            const response = await api.patch(`/complejos/${complejoId}/datos-bancarios`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complejo', complejoId] });
            setSuccess('Datos bancarios actualizados correctamente');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al actualizar datos bancarios');
        },
    });

    const handleGuardarGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        await actualizarComplejo.mutateAsync(formData);
    };

    const handleGuardarBancarios = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        await actualizarDatosBancarios.mutateAsync(datosBancarios);
    };

    if (!canEditComplejo) {
        return (
            <DashboardLayout title="Sin Acceso" complejoId={complejoId}>
                <Alert variant="error">
                    No tienes permisos para editar la configuración.
                </Alert>
            </DashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <DashboardLayout title="Configuración" complejoId={complejoId}>
                <div className="py-12">
                    <LoadingSpinner />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Configuración"
            subtitle="Administra la configuración del complejo"
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

            <div className="space-y-6">
                {/* Información General */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Información General</h2>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleGuardarGeneral} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Nombre del Complejo *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        required
                                    />
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

                                <div>
                                    <label className="label">WhatsApp</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="+5491112345678"
                                        value={formData.numeroWhatsapp}
                                        onChange={(e) => setFormData({ ...formData, numeroWhatsapp: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Dirección *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={actualizarComplejo.isPending}
                                >
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                {/* Configuración de Señas */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Configuración de Señas</h2>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleGuardarGeneral} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="requiereSeña"
                                    checked={formData.requiereSeña}
                                    onChange={(e) => setFormData({ ...formData, requiereSeña: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="requiereSeña" className="text-sm font-medium">
                                    Requerir seña para confirmar turnos
                                </label>
                            </div>

                            {formData.requiereSeña && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Porcentaje de Seña (%)</label>
                                            <input
                                                type="number"
                                                className="input"
                                                min="1"
                                                max="100"
                                                value={formData.porcentajeSeña}
                                                onChange={(e) => setFormData({ ...formData, porcentajeSeña: parseInt(e.target.value) })}
                                            />
                                            <p className="text-xs text-primary-600 mt-1">
                                                Porcentaje del precio total a pagar como seña
                                            </p>
                                        </div>

                                        <div>
                                            <label className="label">Minutos de Expiración</label>
                                            <input
                                                type="number"
                                                className="input"
                                                min="5"
                                                value={formData.minutosExpiracion}
                                                onChange={(e) => setFormData({ ...formData, minutosExpiracion: parseInt(e.target.value) })}
                                            />
                                            <p className="text-xs text-primary-600 mt-1">
                                                Tiempo límite para enviar comprobante
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="permiteTurnosFijos"
                                    checked={formData.permiteTurnosFijos}
                                    onChange={(e) => setFormData({ ...formData, permiteTurnosFijos: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="permiteTurnosFijos" className="text-sm font-medium">
                                    Permitir turnos fijos recurrentes
                                </label>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={actualizarComplejo.isPending}
                                >
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                {/* Datos Bancarios */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Datos Bancarios</h2>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleGuardarBancarios} className="space-y-4">
                            <Alert variant="info">
                                Estos datos se mostrarán a los clientes para realizar transferencias de señas.
                            </Alert>

                            <div>
                                <label className="label">CBU</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="22 dígitos"
                                    maxLength={22}
                                    value={datosBancarios.cbu}
                                    onChange={(e) => setDatosBancarios({ ...datosBancarios, cbu: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label">Alias</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="mi.alias.banco"
                                    value={datosBancarios.alias}
                                    onChange={(e) => setDatosBancarios({ ...datosBancarios, alias: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label">Titular</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Nombre del titular de la cuenta"
                                    value={datosBancarios.titular}
                                    onChange={(e) => setDatosBancarios({ ...datosBancarios, titular: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={actualizarDatosBancarios.isPending}
                                >
                                    Guardar Datos Bancarios
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </DashboardLayout>
    );
}
export default function ConfiguracionPage({ params }: { params: { complejoId: string } }) {
    return (
        <ProtectedRoute>
            <ConfiguracionContent params={params} />
        </ProtectedRoute>
    );
}