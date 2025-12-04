'use client';

import { useState } from 'react';
import { Turno } from '@/types/api.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { TURNO_COLORS, TURNO_LABELS } from '@/lib/constants';

interface TurnosTableProps {
  turnos: Turno[];
  onConfirmar?: (turnoId: string) => void;
  onMarcarAusente?: (turnoId: string) => void;
  onBloquear?: (turnoId: string) => void;
  onCancelar?: (turnoId: string) => void;
  isLoading?: boolean;
}

export function TurnosTable({
  turnos,
  onConfirmar,
  onMarcarAusente,
  onBloquear,
  onCancelar,
  isLoading = false,
}: TurnosTableProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroCancha, setFiltroCancha] = useState<string>('TODAS');

  // Obtener canchas únicas
  const canchas = Array.from(new Set(turnos.map(t => t.cancha?.nombre).filter(Boolean)));

  // Filtrar turnos
  const turnosFiltrados = turnos.filter(turno => {
    const matchEstado = filtroEstado === 'TODOS' || turno.estado === filtroEstado;
    const matchCancha = filtroCancha === 'TODAS' || turno.cancha?.nombre === filtroCancha;
    return matchEstado && matchCancha;
  });

  return (
    <div>
      {/* Filtros */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <label className="text-sm text-primary-600 mb-1 block">Estado</label>
          <select
            className="input"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos</option>
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
          <label className="text-sm text-primary-600 mb-1 block">Cancha</label>
          <select
            className="input"
            value={filtroCancha}
            onChange={(e) => setFiltroCancha(e.target.value)}
          >
            <option value="TODAS">Todas</option>
            {canchas.map(cancha => (
              <option key={cancha} value={cancha}>{cancha}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <p className="text-sm text-primary-600">
            Mostrando {turnosFiltrados.length} de {turnos.length} turnos
          </p>
        </div>
      </div>

      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead>Cancha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {turnosFiltrados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-primary-600">
                No hay turnos que coincidan con los filtros
              </TableCell>
            </TableRow>
          ) : (
            turnosFiltrados.map((turno) => (
              <TableRow key={turno.id}>
                <TableCell>
                  <div className="font-medium">{formatDateTime(turno.fecha)}</div>
                  <div className="text-xs text-primary-600">{turno.duracion} min</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{turno.cancha?.nombre}</div>
                  <div className="text-xs text-primary-600">
                    {turno.cancha?.deporte?.nombre}
                  </div>
                </TableCell>
                <TableCell>
                  {turno.nombreCliente ? (
                    <div>
                      <div className="font-medium text-sm">
                        {turno.nombreCliente} {turno.apellidoCliente}
                      </div>
                      {turno.dni && (
                        <div className="text-xs text-primary-600">DNI: {turno.dni}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-primary-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {turno.telefonoCliente || '-'}
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{formatPrice(turno.precioTotal)}</div>
                  {turno.montoSeña && (
                    <div className="text-xs text-primary-600">
                      Seña: {formatPrice(turno.montoSeña)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={TURNO_COLORS[turno.estado]}>
                    {TURNO_LABELS[turno.estado]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {turno.estado === 'SENA_ENVIADA' && onConfirmar && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onConfirmar(turno.id)}
                        disabled={isLoading}
                      >
                        Confirmar
                      </Button>
                    )}
                    {turno.estado === 'CONFIRMADO' && onMarcarAusente && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onMarcarAusente(turno.id)}
                        disabled={isLoading}
                      >
                        Ausente
                      </Button>
                    )}
                    {turno.estado === 'DISPONIBLE' && onBloquear && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onBloquear(turno.id)}
                        disabled={isLoading}
                      >
                        Bloquear
                      </Button>
                    )}
                    {['RESERVADO', 'SENA_ENVIADA', 'CONFIRMADO'].includes(turno.estado) && onCancelar && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onCancelar(turno.id)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}