  'use client';

  import { useQuery } from '@tanstack/react-query';
  import { useRouter } from 'next/navigation';
  import { api } from '@/lib/api';
  import { Complejo } from '@/types/api.types';
  import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
  import { DashboardLayout } from '@/components/layout/DashboardLayout';
  import { Card, CardBody, CardHeader } from '@/components/ui/Card';
  import { Button } from '@/components/ui/Button';
  import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
  import { EmptyState } from '@/components/ui/EmptyState';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

  function ComplejosContent() {
    const router = useRouter();

    const { data: complejos, isLoading } = useQuery({
      queryKey: ['complejos'],
      queryFn: async () => {
        const { data } = await api.get<Complejo[]>('/complejos');
        return data;
      },
    });

    const handleVerComplejo = (complejoId: string) => {
      router.push(`/complejo/${complejoId}`);
    };

    return (
      <DashboardLayout title="Gestión de Complejos" subtitle="Administra todos los complejos del sistema">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Complejos Registrados</h2>
              <Button variant="primary" size="sm">
                + Nuevo Complejo
              </Button>
            </div>
          </CardHeader>

          <CardBody>
            {isLoading ? (
              <div className="py-12">
                <LoadingSpinner />
              </div>
            ) : !complejos || complejos.length === 0 ? (
              <EmptyState
                icon="🏢"
                title="No hay complejos registrados"
                description="Crea el primer complejo para comenzar"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complejos.map((complejo) => (
                    <TableRow key={complejo.id}>
                      <TableCell>
                        <div className="font-medium">{complejo.nombre}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-primary-600">{complejo.direccion}</div>
                      </TableCell>
                      <TableCell>{complejo.telefono}</TableCell>
                      <TableCell>{complejo.email || '-'}</TableCell>
                      <TableCell>
                        {complejo.propietarioId ? (
                          <span className="text-green-600 text-sm">✓ Asignado</span>
                        ) : (
                          <span className="text-yellow-600 text-sm">⚠ Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleVerComplejo(complejo.id)}
                          >
                            Ver Panel
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
      </DashboardLayout>
    );
  }

  export default function ComplejosPage() {
    return (
      <ProtectedRoute>
        <ComplejosContent />
      </ProtectedRoute>
    );
  }