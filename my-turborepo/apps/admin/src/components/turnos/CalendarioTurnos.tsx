'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Turno } from './types';
import { Badge } from '@/components/ui/Badge';
import { TURNO_COLORS } from '@/lib/constants';

interface CalendarioTurnosProps {
  turnos: Turno[];
  mesActual: Date;
  onDayClick: (fecha: Date) => void;
  onTurnoClick: (turno: Turno) => void;
}

export function CalendarioTurnos({ 
  turnos, 
  mesActual, 
  onDayClick,
  onTurnoClick 
}: CalendarioTurnosProps) {
  
  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 0 });
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesActual]);

  const turnosPorDia = useMemo(() => {
    const map = new Map<string, Turno[]>();
    turnos.forEach(turno => {
      const key = format(new Date(turno.fecha), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(turno);
    });
    return map;
  }, [turnos]);

  return (
    <div>
      {/* Header con días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
          <div key={dia} className="text-center text-sm font-medium text-primary-600 py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-2">
        {dias.map(dia => {
          const key = format(dia, 'yyyy-MM-dd');
          const turnosDia = turnosPorDia.get(key) || [];
          const esMesActual = dia.getMonth() === mesActual.getMonth();

          return (
            <div
              key={key}
              onClick={() => onDayClick(dia)}
              className={`
                min-h-[100px] p-2 border rounded-lg cursor-pointer
                transition-all hover:shadow-md
                ${esMesActual ? 'bg-white' : 'bg-primary-50'}
                ${isSameDay(dia, new Date()) ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              {/* Número del día */}
              <div className={`
                text-sm font-semibold mb-1
                ${esMesActual ? 'text-primary-900' : 'text-primary-400'}
                ${isSameDay(dia, new Date()) ? 'text-blue-600' : ''}
              `}>
                {format(dia, 'd')}
              </div>

              {/* Turnos del día */}
              <div className="space-y-1">
                {turnosDia.slice(0, 3).map(turno => (
                  <div
                    key={turno.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTurnoClick(turno);
                    }}
                    className="text-xs p-1 rounded bg-primary-50 hover:bg-primary-100 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">
                        {format(new Date(turno.fecha), 'HH:mm')}
                      </span>
                      <Badge variant={TURNO_COLORS[turno.estado]} size="sm">
                        {turno.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {turnosDia.length > 3 && (
                  <div className="text-xs text-primary-500 text-center">
                    +{turnosDia.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}