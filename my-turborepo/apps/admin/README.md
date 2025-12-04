📘 Documentación Completa del Frontend - Sistema de Gestión de Turnos (Panel Admin)

📑 Tabla de Contenidos

Visión General del Sistema
Arquitectura y Stack Tecnológico
Estructura de Carpetas
Sistema de Autenticación
Gestión de Estado
Data Fetching y Comunicación con Backend
Sistema de Rutas y Navegación
Componentes UI Reutilizables
Módulos Funcionales
Hooks Personalizados
Sistema de Permisos
Utilidades y Helpers
Estilos y Diseño
Flujos de Negocio Frontend-Backend
Manejo de Errores
Optimizaciones y Performance
Guía de Uso por Rol


1. Visión General del Sistema
1.1 Propósito
Frontend de administración para el sistema de gestión de turnos en complejos deportivos. Permite a administradores (SUPERADMIN, DUEÑO, EMPLEADO) gestionar todos los aspectos del complejo: turnos, pagos, canchas, empleados y configuración.
1.2 Características Principales
✅ Dashboard en tiempo real con métricas y alertas
✅ Gestión de pagos con aprobación/rechazo de señas
✅ Gestión de turnos con múltiples estados
✅ CRUD completo de canchas, deportes y empleados
✅ Sistema de permisos basado en roles
✅ Navegación dinámica según rol y complejo
✅ Estadísticas avanzadas con comparativas
✅ Diseño responsive en blanco/negro minimalista
✅ Optimización con cache mediante React Query
1.3 Roles Soportados

SUPERADMIN: Acceso total, gestiona múltiples complejos
DUEÑO: Gestión completa de su complejo
EMPLEADO: Gestión operativa (turnos, pagos, canchas)
CLIENTE: No tiene acceso al panel admin


2. Arquitectura y Stack Tecnológico
2.1 Stack Principal
┌─────────────────────────────────────────────┐
│         FRONTEND (Next.js 14)               │
├─────────────────────────────────────────────┤
│  • React 18 (Client Components)             │
│  • TypeScript                               │
│  • Next.js App Router                       │
│  • TanStack Query (React Query v5)          │
│  • Zustand (State Management)               │
│  • Axios (HTTP Client)                      │
│  • Tailwind CSS                             │
│  • date-fns (Date utilities)                │
└─────────────────────────────────────────────┘
          ↕️ (HTTP REST API)
┌─────────────────────────────────────────────┐
│         BACKEND (NestJS)                    │
│  • Endpoint: http://localhost:3000          │
│  • Auth: JWT en cookies HTTP-only           │
│  • Database: PostgreSQL + Prisma            │
└─────────────────────────────────────────────┘
2.2 Dependencias Clave
json{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.13.2",
    "zustand": "^5.0.9",
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.45"
  }
}
```

### 2.3 Patrón de Arquitectura
```
Client Component → Custom Hook → React Query → Axios → Backend API
                       ↓
                   Zustand Store (Auth/Global State)
                       ↓
                   UI Components
```

**Principios aplicados:**
- **Separación de responsabilidades**: UI, lógica, datos
- **Composición de componentes**: Reutilización máxima
- **Server State vs Client State**: React Query para server, Zustand para cliente
- **Type Safety**: TypeScript estricto en todo
- **Optimistic Updates**: Mejora UX en mutaciones

---

## 3. Estructura de Carpetas
```
apps/admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Layout raíz + metadata
│   │   ├── providers.tsx             # React Query Provider
│   │   ├── page.tsx                  # Redireccionamiento según rol
│   │   ├── login/
│   │   │   └── page.tsx              # Página de login
│   │   ├── complejos/                # SUPERADMIN: Lista complejos
│   │   │   └── page.tsx
│   │   └── complejo/
│   │       └── [complejoId]/         # Rutas dinámicas por complejo
│   │           ├── page.tsx          # Dashboard
│   │           ├── turnos/
│   │           │   └── page.tsx
│   │           ├── pagos/
│   │           │   └── page.tsx
│   │           ├── canchas/
│   │           │   └── page.tsx
│   │           ├── deportes/
│   │           │   └── page.tsx
│   │           ├── empleados/
│   │           │   └── page.tsx
│   │           ├── turnos-fijos/
│   │           │   └── page.tsx
│   │           ├── estadisticas/
│   │           │   └── page.tsx
│   │           └── configuracion/
│   │               └── page.tsx
│   │
│   ├── components/                   # Componentes reutilizables
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx    # HOC para rutas protegidas
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx   # Layout principal
│   │   │   ├── Sidebar.tsx           # Navegación lateral
│   │   │   └── Header.tsx            # Header con usuario
│   │   ├── tables/
│   │   │   └── TurnosTable.tsx       # Tabla de turnos con filtros
│   │   └── ui/                       # Componentes UI base
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       ├── Table.tsx
│   │       ├── Alert.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/                        # Custom Hooks
│   │   ├── usePermissions.ts         # Lógica de permisos
│   │   ├── useTurnos.ts              # CRUD turnos
│   │   ├── usePagos.ts               # CRUD pagos
│   │   ├── useCanchas.ts             # CRUD canchas
│   │   ├── useDeportes.ts            # CRUD deportes
│   │   ├── useEmpleados.ts           # CRUD empleados
│   │   ├── useTurnosFijos.ts         # CRUD turnos fijos
│   │   └── useEstadisticas.ts        # Dashboard stats
│   │
│   ├── stores/                       # Zustand Stores
│   │   └── authStore.ts              # Estado de autenticación
│   │
│   ├── lib/                          # Configuraciones
│   │   ├── api.ts                    # Axios instance
│   │   ├── queryClient.ts            # React Query config
│   │   ├── utils.ts                  # Utilidades generales
│   │   └── constants.ts              # Constantes (estados, colores)
│   │
│   ├── types/                        # TypeScript Types
│   │   ├── api.types.ts              # Interfaces del backend
│   │   ├── enums.ts                  # Enums compartidos
│   │   └── css.d.ts                  # Declaraciones CSS
│   │
│   └── styles/                       # Estilos globales
│       ├── globals.css               # Tailwind + base styles
│       ├── components.css            # Clases de componentes
│       └── layouts.css               # Clases de layout
│
├── public/                           # Assets estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## 4. Sistema de Autenticación

### 4.1 Flujo de Autenticación
```
┌──────────┐
│  LOGIN   │
└────┬─────┘
     │
     │ 1. Usuario ingresa credenciales
     │    (email/teléfono + password)
     ▼
┌─────────────────────────┐
│  POST /auth/login       │
│  { identifier, password }│
└────┬────────────────────┘
     │
     │ 2. Backend valida y genera JWT
     │    Retorna: { usuario: {...} }
     │    Cookie: access_token (HTTP-only)
     ▼
┌─────────────────────────┐
│  authStore.login()      │
│  Guarda usuario en      │
│  Zustand                │
└────┬────────────────────┘
     │
     │ 3. Redirige según rol
     ▼
┌─────────────────────────┐
│  SUPERADMIN → /complejos│
│  DUEÑO/EMPLEADO →       │
│  /complejo/[id]         │
└─────────────────────────┘
4.2 Implementación del Store (Zustand)
src/stores/authStore.ts
typescriptinterface AuthState {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Características:
// - Estado global persistente
// - Validación automática en mount
// - Limpieza al logout
4.3 Protección de Rutas
src/components/auth/ProtectedRoute.tsx
typescript// HOC que envuelve todas las páginas protegidas
// - Verifica autenticación al montar
// - Muestra loading mientras valida
// - Redirige a /login si no autenticado
```

**Flujo de validación:**
```
1. useEffect → checkAuth()
2. GET /auth/profile → Valida JWT en cookie
3. Si válido: setUsuario() + render children
4. Si inválido: redirect /login
4.4 Configuración de Axios
src/lib/api.ts
typescriptexport const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,  // ✅ CRÍTICO: Envía cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si token expiró → redirige a login
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**⚠️ IMPORTANTE:** `withCredentials: true` es esencial para que las cookies HTTP-only se envíen en cada request.

---

## 5. Gestión de Estado

### 5.1 División de Estado
```
┌────────────────────────────────────┐
│     CLIENT STATE (Zustand)         │
│  - usuario                         │
│  - isAuthenticated                 │
│  - isLoading                       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   SERVER STATE (React Query)       │
│  - turnos                          │
│  - pagos                           │
│  - canchas                         │
│  - deportes                        │
│  - empleados                       │
│  - estadísticas                    │
└────────────────────────────────────┘
5.2 React Query: Query Keys
typescript// Estructura jerárquica de query keys
['turnos', complejoId]                 // Todos los turnos
['turnos', complejoId, canchaId]       // Turnos de cancha específica

['pagos', 'pendientes', complejoId]    // Pagos pendientes

['canchas', complejoId]                // Canchas del complejo

['dashboard', complejoId]              // Estadísticas dashboard

['estadisticas', 'rendimiento', complejoId, periodo]  // Stats avanzadas
5.3 Cache e Invalidación
typescript// Configuración global
queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Invalidación después de mutaciones
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['turnos'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}
Estrategia de invalidación:

Aprobar pago → invalida ['pagos'], ['turnos'], ['dashboard']
Crear cancha → invalida ['canchas']
Cambiar estado turno → invalida ['turnos'], ['dashboard']


6. Data Fetching y Comunicación con Backend
6.1 Patrón de Custom Hooks
Estructura estándar:
typescriptexport function useRecurso(parametros) {
  const queryClient = useQueryClient();

  // Query (GET)
  const { data, isLoading } = useQuery({
    queryKey: ['recurso', parametros],
    queryFn: async () => {
      const { data } = await api.get('/endpoint');
      return data;
    },
    enabled: !!parametros,  // Solo ejecuta si hay params
  });

  // Mutation (POST/PATCH/DELETE)
  const crearRecurso = useMutation({
    mutationFn: async (datos) => {
      const { data } = await api.post('/endpoint', datos);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurso'] });
    },
  });

  return {
    data,
    isLoading,
    crearRecurso,
  };
}
6.2 Mapeo Frontend → Backend
Turnos
FrontendBackendMétodoDescripciónuseTurnos(complejoId)GET /turnos/complejo/:idQueryObtener turnosconfirmarTurno.mutate(id)POST /turnos/:id/confirmarMutationConfirmar pago manualmentemarcarAusente.mutate(id)POST /turnos/:id/ausenteMutationMarcar cliente ausentebloquearTurno.mutate(id)POST /turnos/:id/bloquearMutationBloquear turnocancelarTurno.mutate(id)DELETE /turnos/:idMutationCancelar turno
Pagos
FrontendBackendMétodoDescripciónusePagos(complejoId)GET /pagos/pendientesQueryPagos pendientesaprobarPago.mutate(id)PATCH /pagos/:id/aprobarMutationAprobar señarechazarPago.mutate({id, motivo})PATCH /pagos/:id/rechazarMutationRechazar seña
Canchas
FrontendBackendMétodoDescripciónuseCanchas(complejoId)GET /canchas/complejo/:idQueryListar canchascrearCancha.mutate(data)POST /canchasMutationCrear canchaeditarCancha.mutate({id, ...data})PATCH /canchas/:idMutationEditar canchacambiarEstado.mutate({id, estado})PATCH /canchas/:id/estadoMutationHabilitar/DeshabilitareliminarCancha.mutate(id)DELETE /canchas/:idMutationEliminar cancha
Empleados
FrontendBackendMétodoDescripciónuseEmpleados(complejoId)GET /complejos/:id/empleadosQueryListar empleadoscrearEmpleado.mutate(data)POST /complejos/:id/empleadosMutationCrear empleadoeditarEmpleado.mutate({id, ...data})PATCH /usuarios/empleados/:idMutationEditar datoscambiarPassword.mutate({id, password})PATCH /usuarios/empleados/:id/passwordMutationCambiar claveeliminarEmpleado.mutate(id)DELETE /complejos/:id/empleados/:idMutationQuitar empleado
Estadísticas
FrontendBackendMétodoDescripciónuseEstadisticas(complejoId)GET /estadisticas/dashboardQueryMétricas dashboardEstadísticas avanzadasGET /estadisticas/rendimientoQueryReportes comparativos
6.3 Ejemplo Completo: Aprobar Pago
typescript// 1. FRONTEND: Hook usePagos.ts
const aprobarPago = useMutation({
  mutationFn: async (pagoId: string) => {
    const { data } = await api.patch(`/pagos/${pagoId}/aprobar`);
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pagos'] });
    queryClient.invalidateQueries({ queryKey: ['turnos'] });
  },
});

// 2. FRONTEND: Componente pagos/page.tsx
const handleAprobar = async () => {
  await aprobarPago.mutateAsync(pagoId);
  setModalAprobar(null);
};

// 3. BACKEND: PagosController
@Patch(':id/aprobar')
async aprobar(@Param('id') id: string) {
  return this.pagosService.aprobar(id);
}

// 4. BACKEND: PagosService
async aprobar(id: string) {
  // 1. Actualizar pago → APROBADO
  await prisma.pago.update({
    where: { id },
    data: { 
      estado: 'APROBADO',
      fechaValidacion: new Date()
    }
  });
  
  // 2. Actualizar turno → CONFIRMADO
  await prisma.turno.update({
    where: { id: pago.turnoId },
    data: { 
      estado: 'CONFIRMADO',
      fechaConfirmacion: new Date()
    }
  });
}

// 5. FRONTEND: React Query invalida cache
// Automáticamente refetch de pagos y turnos
```

---

## 7. Sistema de Rutas y Navegación

### 7.1 Arquitectura de Rutas
```
/                                    # Redireccionamiento según rol
├── /login                           # Página pública
└── /complejo/[complejoId]/          # Rutas protegidas
    ├── /                            # Dashboard
    ├── /turnos                      # Gestión de turnos
    ├── /pagos                       # Gestión de pagos
    ├── /canchas                     # Gestión de canchas
    ├── /deportes                    # Gestión de deportes
    ├── /empleados                   # Gestión de empleados (DUEÑO)
    ├── /turnos-fijos                # Turnos recurrentes
    ├── /estadisticas                # Reportes avanzados
    └── /configuracion               # Settings complejo (DUEÑO)

/complejos                           # Solo SUPERADMIN
```

### 7.2 Navegación Dinámica según Rol

**SUPERADMIN:**
```
1. Login → /complejos (lista todos)
2. Selecciona complejo → /complejo/[id]
3. Navega normalmente
4. Botón "Volver a Complejos" siempre visible
```

**DUEÑO/EMPLEADO:**
```
1. Login → /complejo/[suComplejoId] (directo)
2. No ve opción "Complejos"
3. Solo navega en su complejo
7.3 Sidebar Dinámico
src/components/layout/Sidebar.tsx
typescript// Items según contexto
const items = isSuperAdmin && !complejoId 
  ? superAdminItems  // Solo "Complejos"
  : complejoItems;   // Items del complejo

// Filtrado por permisos
const filteredItems = items.filter((item) => {
  if (!item.roles) return true;
  if (isSuperAdmin) return true;
  if (item.roles.includes('DUENO') && canManageEmpleados) return true;
  return false;
});
7.4 Rutas Dinámicas de Next.js
typescript// Archivo: app/complejo/[complejoId]/page.tsx
function DashboardContent({ params }: { 
  params: Promise<{ complejoId: string }> 
}) {
  const { complejoId } = use(params);  // Next.js 14 async params
  
  const { dashboard } = useEstadisticas(complejoId);
  // ...
}

8. Componentes UI Reutilizables
8.1 Sistema de Diseño
Paleta de Colores:
cssprimary-50:  #f5f5f5  /* Fondos suaves */
primary-100: #e5e5e5  /* Borders sutiles */
primary-200: #d4d4d4  /* Borders normales */
primary-600: #404040  /* Texto secundario */
primary-700: #262626  /* Texto importante */
primary-900: #0a0a0a  /* Negro principal */
Colores Semánticos:
typescript// Estados de turno
DISPONIBLE → gray
RESERVADO → blue
SENA_ENVIADA → yellow
CONFIRMADO → green
CANCELADO/EXPIRADO/AUSENTE → red

// Estados de pago
PENDIENTE → gray
ENVIADO → yellow
APROBADO → green
RECHAZADO → red
8.2 Componentes Base
Button
typescript<Button 
  variant="primary|secondary|danger|success"
  size="sm|md|lg"
  isLoading={boolean}
  disabled={boolean}
>
  Texto
</Button>
Card
typescript<Card>
  <CardHeader>
    <h2>Título</h2>
  </CardHeader>
  <CardBody>
    Contenido
  </CardBody>
</Card>
Modal
typescript<Modal
  isOpen={boolean}
  onClose={() => {}}
  title="Título"
  size="sm|md|lg|xl"
  footer={<>Botones</>}
>
  Contenido
</Modal>
Table
typescript<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Columna</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dato</TableCell>
    </TableRow>
  </TableBody>
</Table>
Badge
typescript<Badge variant="gray|green|yellow|red|blue">
  Estado
</Badge>
Alert
typescript<Alert variant="info|success|warning|error">
  Mensaje
</Alert>
8.3 Componentes Compuestos
EmptyState
typescript<EmptyState
  icon="📭"
  title="No hay datos"
  description="Descripción opcional"
  action={<Button>Acción</Button>}
/>
LoadingSpinner
typescript<LoadingSpinner size="sm|md|lg" />

9. Módulos Funcionales
9.1 Dashboard (Complejo)
Ruta: /complejo/[complejoId]
Datos mostrados:
typescriptinterface DashboardStats {
  resumenHoy: {
    totalTurnos: number;
    turnosConfirmados: number;
    ingresosDia: number;
    ocupacion: number;
  };
  proximosTurnos: Turno[];  // Próxima hora
  pagosPendientes: number;
  turnosFijosActivos: number;
  alertas: Alerta[];
  tendenciaSemanal: {
    semanaActual: { turnos, ingresos };
    semanaAnterior: { turnos, ingresos };
    variacion: { turnos: "+5.7%", ingresos: "+8.3%" };
  };
}
Tarjetas métricas:

Turnos Hoy (confirmados/total)
Ingresos Hoy ($)
Ocupación (%)
Pagos Pendientes (cantidad)

Secciones:

Alertas importantes (priorizadas por severidad)
Próximos turnos (próxima hora con estado)
Tendencia semanal (comparativa)
Info adicional (turnos fijos activos)

Refetch: Cada 1 minuto automático
9.2 Gestión de Pagos
Ruta: /complejo/[complejoId]/pagos
Funcionalidades:

Listar pagos pendientes

Filtro: Estado ENVIADO
Datos: Cliente, turno, monto, método, tiempo transcurrido
Botón WhatsApp: Contacto directo


Aprobar pago

Modal de confirmación
Info: Cliente, monto, fecha turno
Acción: PATCH /pagos/:id/aprobar
Resultado: Pago → APROBADO, Turno → CONFIRMADO


Rechazar pago

Modal con textarea obligatorio
Campo: motivoRechazo (requerido)
Acción: PATCH /pagos/:id/rechazar
Resultado: Pago → RECHAZADO, Turno → DISPONIBLE



Tabla columnas:

Turno (cancha, fecha/hora)
Cliente (nombre, teléfono con link WhatsApp)
Monto (seña / total)
Método (TRANSFERENCIA)
Enviado (tiempo relativo)
Estado (badge)
Acciones (aprobar/rechazar)

9.3 Gestión de Turnos
Ruta: /complejo/[complejoId]/turnos
Funcionalidades:

Listar turnos

Filtros: Estado, Cancha
Contador: X de Y turnos
Columnas: Fecha/hora, Cancha, Cliente, Teléfono, Precio, Estado


Confirmar turno (SENA_ENVIADA → CONFIRMADO)

Modal confirmación
POST /turnos/:id/confirmar


Marcar ausente (CONFIRMADO → AUSENTE)

Modal warning
POST /turnos/:id/ausente


Bloquear turno (DISPONIBLE → BLOQUEADO)

Modal info
POST /turnos/:id/bloquear


Cancelar turno

Modal error (destructivo)
DELETE /turnos/:id



Componente TurnosTable:

Select filtros (estado, cancha)
Renderizado condicional de acciones según estado
Badges de color según estado

9.4 Gestión de Canchas
Ruta: /complejo/[complejoId]/canchas
Funcionalidades:

CRUD completo

Crear: Modal con form
Editar: Modal pre-llenado
Eliminar: Confirmación destructiva


Cambiar estado

HABILITADA ↔ DESHABILITADA
Botón dinámico según estado actual
PATCH /canchas/:id/estado


Form fields:

Nombre (texto, requerido)
Deporte (select de deportes del complejo)
Precio Base (número, decimal)
Descripción (textarea, opcional)



Tabla columnas:AContinue
Nombre
Deporte
Precio Base (formateado $)
Estado (badge con color)
Descripción
Acciones (habilitar/deshabilitar, editar, eliminar)

9.5 Gestión de Deportes
Ruta: /complejo/[complejoId]/deportes
CRUD simple:

Nombre (texto)
Icono (emoji, 1-2 caracteres)

Validación backend:

Nombre único por complejo
No eliminar si tiene canchas asociadas

9.6 Gestión de Empleados
Ruta: /complejo/[complejoId]/empleados
Permisos: Solo SUPERADMIN y DUEÑO
Funcionalidades:

Crear empleado

Nombre, Apellido
Teléfono (único)
Email (opcional)
Password (min 6 chars)
POST /complejos/:id/empleados


Editar empleado

Todos los campos excepto password
PATCH /usuarios/empleados/:id


Cambiar password

Modal específico
Nueva password (min 6)
PATCH /usuarios/empleados/:id/password


Eliminar empleado

Confirmación destructiva
DELETE /complejos/:id/empleados/:empleadoId



Tabla columnas:

Nombre completo
Teléfono
Email
Rol (siempre EMPLEADO)
Acciones (editar, cambiar clave, eliminar)

9.7 Turnos Fijos
Ruta: /complejo/[complejoId]/turnos-fijos
Funcionalidades:

Listar turnos fijos

Cliente (nombre, teléfono)
Cancha (nombre, deporte)
Día y Hora (ej: "Martes 20:00")
Duración
Desde (fecha inicio)
Requiere Seña (badge)
Estado (Activo/Pausado)


Pausar turno fijo

PATCH /turnos-fijos/:id/pausar
No genera más turnos
Turnos existentes siguen activos


Reactivar turno fijo

PATCH /turnos-fijos/:id/reactivar
Vuelve a generar turnos


Cancelar turno fijo

DELETE /turnos-fijos/:id
Elimina turnos futuros
Destructivo



Nota: Los clientes crean turnos fijos desde la app pública, aquí solo se gestionan.
9.8 Estadísticas Avanzadas
Ruta: /complejo/[complejoId]/estadisticas
Períodos: Semanal, Mensual, Anual
Métricas mostradas:

Principales

Turnos Totales (variación vs anterior)
Ocupación (%)
Ingresos Brutos (variación vs anterior)
Promedio por Turno


Secundarias

Clientes (total, nuevos, retención)
Mejor Cancha (nombre, ocupación)
Peor Cancha (nombre, ocupación)


Tasa de ausencias
Insights

Array de strings con análisis
Ejemplo: "📈 Crecimiento sostenido de 12%"



Endpoint: GET /estadisticas/rendimiento?complejoId=X&periodo=mensual&comparar=true
9.9 Configuración del Complejo
Ruta: /complejo/[complejoId]/configuracion
Permisos: Solo SUPERADMIN y DUEÑO
Secciones:

Información General

Nombre, Dirección, Teléfono, Email, WhatsApp
PATCH /complejos/:id


Configuración de Señas

Checkbox: Requerir seña
Porcentaje seña (1-100%)
Minutos expiración (min 5)
Checkbox: Permitir turnos fijos
PATCH /complejos/:id


Datos Bancarios (solo DUEÑO)

CBU (22 dígitos)
Alias (6-20 chars)
Titular
PATCH /complejos/:id/datos-bancarios




10. Hooks Personalizados
10.1 usePermissions
Ubicación: src/hooks/usePermissions.ts
typescriptexport function usePermissions() {
  const usuario = useAuthStore((state) => state.usuario);

  return {
    usuario,
    isSuperAdmin: usuario?.rol === 'SUPERADMIN',
    isDueno: usuario?.rol === 'DUENO',
    isEmpleado: usuario?.rol === 'EMPLEADO',
    canManageComplejos: isSuperAdmin,
    canManageEmpleados: isSuperAdmin || isDueno,
    canEditComplejo: isSuperAdmin || isDueno,
    canDeleteCanchas: isSuperAdmin || isDueno,
    canViewEstadisticas: isSuperAdmin || isDueno || isEmpleado,
    canManagePagos: isSuperAdmin || isDueno || isEmpleado,
    canManageTurnos: isSuperAdmin || isDueno || isEmpleado,
  };
}
Uso:
typescriptconst { canManageEmpleados } = usePermissions();

if (!canManageEmpleados) {
  return <Alert variant="error">Sin permisos</Alert>;
}
10.2 Patrón de Hooks de Datos
Todos los hooks de datos siguen este patrón:
typescriptexport function useRecurso(filtros) {
  const queryClient = useQueryClient();

  // GET - Lista
  const { data, isLoading } = useQuery({
    queryKey: ['recurso', filtros],
    queryFn: () => api.get('/endpoint'),
    enabled: !!filtros,
  });

  // POST - Crear
  const crear = useMutation({
    mutationFn: (datos) => api.post('/endpoint', datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurso'] });
    },
  });

  // PATCH - Editar
  const editar = useMutation({
    mutationFn: ({ id, ...datos }) => api.patch(`/endpoint/${id}`, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurso'] });
    },
  });

  // DELETE - Eliminar
  const eliminar = useMutation({
    mutationFn: (id) => api.delete(`/endpoint/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurso'] });
    },
  });

  return {
    data,
    isLoading,
    crear,
    editar,
    eliminar,
  };
}

11. Sistema de Permisos
11.1 Matriz de Permisos
AcciónSUPERADMINDUEÑOEMPLEADOVer todos los complejos✅❌❌Gestionar complejos✅❌❌Editar configuración complejo✅✅⚠️ (excepto bancarios)Editar datos bancarios✅✅❌Crear empleados✅✅❌Gestionar turnos✅✅✅Gestionar pagos✅✅✅Gestionar canchas✅✅✅Eliminar canchas✅✅❌Gestionar deportes✅✅✅Ver estadísticas✅✅✅
11.2 Implementación de Permisos
Nivel 1: Rutas (Sidebar)
typescript// Sidebar.tsx
const filteredItems = items.filter((item) => {
  if (!item.roles) return true;
  if (isSuperAdmin) return true;
  if (item.roles.includes('DUENO') && canManageEmpleados) return true;
  return false;
});
Nivel 2: Páginas
typescript// empleados/page.tsx
if (!canManageEmpleados) {
  return <Alert variant="error">Sin permisos</Alert>;
}
Nivel 3: Acciones
typescript// configuracion/page.tsx
{canEditComplejo && (
  <Button onClick={handleGuardar}>Guardar</Button>
)}

12. Utilidades y Helpers
12.1 Formatters
src/lib/utils.ts
typescript// Formatear fecha
formatDate("2024-01-15") → "15/01/2024"

// Formatear hora
formatTime("2024-01-15T20:00:00") → "20:00"

// Formatear fecha y hora
formatDateTime("2024-01-15T20:00:00") → "15/01/2024 20:00"

// Formatear precio
formatPrice(3000) → "$3.000,00"
formatPrice("3000.50") → "$3.000,50"

// Nombre del día
getDayName(0) → "Domingo"
getDayName(1) → "Lunes"

// Tiempo relativo
getTimeAgo("2024-01-15T14:00:00") → "Hace 2h"
12.2 Constantes
src/lib/constants.ts
typescript// Mapeo estado turno → color badge
TURNO_COLORS: {
  DISPONIBLE: 'gray',
  RESERVADO: 'blue',
  SENA_ENVIADA: 'yellow',
  CONFIRMADO: 'green',
  CANCELADO: 'red',
  // ...
}

// Mapeo estado turno → label
TURNO_LABELS: {
  DISPONIBLE: 'Disponible',
  RESERVADO: 'Reservado',
  // ...
}

// Similar para PAGO_COLORS, PAGO_LABELS, CANCHA_COLORS, CANCHA_LABELS

// Días de la semana
DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  // ...
]
12.3 TypeScript Types
src/types/api.types.ts
Contiene todas las interfaces del backend:
typescriptexport interface Usuario { ... }
export interface Complejo { ... }
export interface Deporte { ... }
export interface Cancha { ... }
export interface Turno { ... }
export interface Pago { ... }
export interface TurnoFijo { ... }
export interface DashboardStats { ... }
export interface Alerta { ... }
src/types/enums.ts
Enums compartidos con backend:
typescriptexport enum RolUsuario { ... }
export enum EstadoTurno { ... }
export enum EstadoPago { ... }
export enum EstadoCancha { ... }
export enum MetodoPago { ... }

13. Estilos y Diseño
13.1 Sistema de Estilos
3 capas de CSS:

globals.css - Base Tailwind + reseteos
components.css - Clases de componentes
layouts.css - Clases de layout

13.2 Tailwind Config
javascripttheme: {
  extend: {
    colors: {
      primary: {
        50: '#f5f5f5',
        100: '#e5e5e5',
        200: '#d4d4d4',
        // ... hasta 900: '#0a0a0a'
      },
    },
  },
}
13.3 Clases Reutilizables
Botones:
css.btn { base }
.btn-primary { bg-primary-900 text-white }
.btn-secondary { bg-white border }
.btn-danger { bg-red-600 text-white }
.btn-success { bg-green-600 text-white }
.btn-sm { px-3 py-1.5 text-sm }
Inputs:
css.input { w-full px-3 py-2 border rounded-md }
.input-error { border-red-500 }
.label { block text-sm font-medium mb-1 }
Cards:
css.card { bg-white border rounded-lg shadow-sm }
.card-header { px-6 py-4 border-b }
.card-body { px-6 py-4 }
Badges:
css.badge { inline-flex px-2.5 py-0.5 rounded-full text-xs }
.badge-gray { bg-primary-100 text-primary-800 }
.badge-green { bg-green-100 text-green-800 }
.badge-yellow { bg-yellow-100 text-yellow-800 }
.badge-red { bg-red-100 text-red-800 }
13.4 Diseño Responsive
Breakpoints:

sm: 640px
md: 768px
lg: 1024px
xl: 1280px

Grid adaptativo:
html<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Tarjetas métricas -->
</div>
```

**Sidebar:**
- Desktop: Fixed 256px width
- Mobile: (pendiente implementar hamburger menu)

---

## 14. Flujos de Negocio Frontend-Backend

### 14.1 Flujo: Aprobar Pago
```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND                                   │
└─────────────────────────────────────────────────────────────┘

1. Usuario hace clic en "Aprobar"
   ↓
2. setModalAprobar(pago)
   ↓
3. Usuario confirma en modal
   ↓
4. handleAprobar()
   ↓
5. aprobarPago.mutateAsync(pagoId)
   ↓
6. usePagos hook ejecuta mutation
   ↓
7. api.patch(`/pagos/${pagoId}/aprobar`)
   ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND                                    │
└─────────────────────────────────────────────────────────────┘

8. @Patch(':id/aprobar') PagosController
   ↓
9. pagosService.aprobar(id)
   ↓
10. Busca pago en DB
    ↓
11. Valida estado = ENVIADO
    ↓
12. Actualiza pago:
    - estado → APROBADO
    - fechaValidacion → now()
    ↓
13. Actualiza turno:
    - estado → CONFIRMADO
    - fechaConfirmacion → now()
    ↓
14. return { pago, turno }
    ↓
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND                                   │
└─────────────────────────────────────────────────────────────┘

15. onSuccess callback
    ↓
16. queryClient.invalidateQueries(['pagos'])
    ↓
17. queryClient.invalidateQueries(['turnos'])
    ↓
18. queryClient.invalidateQueries(['dashboard'])
    ↓
19. React Query refetch automático
    ↓
20. UI actualizada:
    - Pago desaparece de lista pendientes
    - Turno aparece como CONFIRMADO
    - Dashboard muestra nuevas métricas
    ↓
21. setModalAprobar(null) cierra modal
```

### 14.2 Flujo: Crear Cancha
```
FRONTEND:
1. Click "Nueva Cancha" → setModalCrear(true)
2. Llenar form (nombre, deporte, precio, descripción)
3. Submit form → handleCrear()
4. crearCancha.mutateAsync({ ...formData, complejoId })

BACKEND:
5. @Post('/canchas') CanchasController
6. Validación DTO (nombre required, precio valid, etc.)
7. canchasService.crear()
8. Verificar nombre único en complejo
9. Prisma.cancha.create({ ...data, estado: HABILITADA })
10. return cancha

FRONTEND:
11. onSuccess → invalidateQueries(['canchas'])
12. React Query refetch automático
13. Nueva cancha aparece en tabla
14. setModalCrear(false) cierra modal
15. resetForm() limpia campos
```

### 14.3 Flujo: Cambiar Estado Cancha
```
FRONTEND:
1. Click botón "Deshabilitar"
2. handleCambiarEstado(canchaId, 'DESHABILITADA')
3. cambiarEstado.mutateAsync({ id, estado })

BACKEND:
4. @Patch(':id/estado') CanchasController
5. Validación: estado válido
6. canchasService.cambiarEstado()
7. Si DESHABILITADA → buscar turnos fijos afectados
8. Reasignar turnos fijos a otras canchas o pausar
9. Prisma.cancha.update({ estado })
10. return { cancha, turnosFijosAfectados }

FRONTEND:
11. onSuccess → invalidateQueries(['canchas'])
12. React Query refetch
13. Badge actualizado en tabla
14. Botón cambia de "Deshabilitar" a "Habilitar"
```

### 14.4 Flujo: Login
```
FRONTEND:
1. Usuario ingresa identifier + password
2. handleSubmit() → login(identifier, password)
3. authStore.login()
4. api.post('/auth/login', { identifier, password })

BACKEND:
5. @Post('/auth/login') AuthController
6. Buscar usuario por email o teléfono
7. bcrypt.compare(password, hashedPassword)
8. Si válido: generar JWT
9. Setear cookie HTTP-only: access_token
10. return { usuario }

FRONTEND:
11. authStore.setUsuario(response.data.usuario)
12. isAuthenticated = true
13. Navegar según rol:
    - SUPERADMIN → /complejos
    - DUEÑO/EMPLEADO → /complejo/[complejoId]
```

### 14.5 Flujo: Verificación de Autenticación
```
CADA PÁGINA:
1. <ProtectedRoute> envuelve contenido
2. useEffect → checkAuth()
3. authStore.checkAuth()
4. api.get('/auth/profile')
   - Cookie access_token se envía automáticamente
   - withCredentials: true asegura esto

BACKEND:
5. @Get('/auth/profile') AuthController
6. @UseGuards(JwtAuthGuard)
7. Passport valida JWT de cookie
8. Si válido: return usuario
9. Si inválido: throw UnauthorizedException

FRONTEND:
10a. Si válido:
    - setUsuario(data)
    - isAuthenticated = true
    - isLoading = false
    - Render children
    
10b. Si inválido:
    - isAuthenticated = false
    - isLoading = false
    - router.push('/login')
```

---

## 15. Manejo de Errores

### 15.1 Capas de Error Handling
```
1. Axios Interceptor (global)
   ↓
2. React Query onError (por mutación)
   ↓
3. try-catch en componentes (local)
   ↓
4. useState error message
   ↓
5. <Alert variant="error"> (UI)
15.2 Interceptor de Axios
typescript// src/lib/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado → logout automático
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
15.3 Manejo en Mutations
typescript// Hook
const crear = useMutation({
  mutationFn: async (data) => {
    const { data: response } = await api.post('/endpoint', data);
    return response;
  },
  onError: (error: any) => {
    // Se propaga al componente
    console.error('Error en mutación:', error);
  },
});

// Componente
const handleCrear = async () => {
  try {
    await crear.mutateAsync(formData);
    setSuccess('Creado correctamente');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error al crear');
  }
};
15.4 Tipos de Errores del Backend
400 Bad Request:
json{
  "statusCode": 400,
  "message": [
    "telefono should not be empty",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
401 Unauthorized:
json{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}
403 Forbidden:
json{
  "statusCode": 403,
  "message": "No tienes permisos para esta acción",
  "error": "Forbidden"
}
404 Not Found:
json{
  "statusCode": 404,
  "message": "Recurso no encontrado",
  "error": "Not Found"
}
409 Conflict:
json{
  "statusCode": 409,
  "message": "Ya existe un usuario con ese teléfono",
  "error": "Conflict"
}
15.5 Display de Errores
typescript// Estado
const [error, setError] = useState('');

// Renderizado
{error && (
  <Alert variant="error" className="mb-6">
    {error}
  </Alert>
)}

// Limpieza automática (opcional)
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(timer);
  }
}, [error]);

16. Optimizaciones y Performance
16.1 React Query Cache
Estrategia:
typescript{
  staleTime: 5 * 60 * 1000,        // 5 min
  cacheTime: 10 * 60 * 1000,       // 10 min
  refetchOnWindowFocus: false,
  retry: 1,
}
Beneficios:

Reduce requests al backend
Datos instantáneos en navegación
Sincronización automática
Garbage collection de cache antiguo

16.2 Invalidación Inteligente
typescript// Aprobar pago invalida:
queryClient.invalidateQueries({ queryKey: ['pagos'] });
queryClient.invalidateQueries({ queryKey: ['turnos'] });
queryClient.invalidateQueries({ queryKey: ['dashboard'] });

// Crear cancha invalida:
queryClient.invalidateQueries({ queryKey: ['canchas'] });

// NO invalida turnos, pagos, etc. (no afectados)
16.3 Lazy Loading de Devtools
typescript// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Lazy load para no aumentar bundle
  const { ReactQueryDevtools } = require('@tanstack/react-query-devtools');
  return <ReactQueryDevtools />;
}
16.4 Optimistic Updates (futuro)
typescriptconst editarCancha = useMutation({
  mutationFn: async ({ id, ...data }) => {
    return api.patch(`/canchas/${id}`, data);
  },
  onMutate: async (newData) => {
    // Cancelar refetch en curso
    await queryClient.cancelQueries({ queryKey: ['canchas'] });
    
    // Snapshot del estado actual
    const previous = queryClient.getQueryData(['canchas']);
    
    // Actualizar optimistically
    queryClient.setQueryData(['canchas'], (old) => {
      return old.map(c => c.id === newData.id ? { ...c, ...newData } : c);
    });
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback si falla
    queryClient.setQueryData(['canchas'], context.previous);
  },
  onSettled: () => {
    // Refetch para sincronizar
    queryClient.invalidateQueries({ queryKey: ['canchas'] });
  },
});
16.5 Code Splitting (Next.js automático)
Next.js 14 con App Router hace code splitting automático por:

Cada page.tsx
Cada componente con 'use client'
Dynamic imports

16.6 Memoization (cuando sea necesario)
typescript// Solo si el componente es pesado
const TurnosTable = React.memo(({ turnos, onAction }) => {
  // ...
});

// Solo si el cálculo es costoso
const turnosFiltrados = useMemo(() => {
  return turnos.filter(/* filtros complejos */);
}, [turnos, filtros]);
```

---

## 17. Guía de Uso por Rol

### 17.1 SUPERADMIN

**Acceso:**
- Login → `/complejos`
- Ve lista de todos los complejos del sistema

**Navegación:**
1. Desde `/complejos`: Click "Ver Panel" → `/complejo/[id]`
2. En panel complejo: Navega igual que dueño
3. Botón "Volver a Complejos" siempre visible en sidebar

**Permisos especiales:**
- Crear/eliminar complejos
- Asignar propietarios
- Acceder a cualquier complejo
- Todas las funciones de DUEÑO en cualquier complejo

**Flujo típico:**
```
1. Login → Ve 10 complejos
2. Click "Complejo Norte" → Dashboard
3. Revisa alertas: "8 pagos pendientes"
4. Va a Pagos → Aprueba 5, rechaza 3
5. Va a Turnos → Marca 2 ausentes
6. Va a Estadísticas → Revisa rendimiento mensual
7. Click "Volver a Complejos"
8. Selecciona otro complejo
```

### 17.2 DUEÑO

**Acceso:**
- Login → `/complejo/[suComplejoId]` (directo)
- Solo ve su complejo

**Navegación:**
- Dashboard
- Turnos
- Pagos
- Canchas
- Deportes
- **Empleados** (único con acceso)
- Turnos Fijos
- Estadísticas
- **Configuración** (puede editar todo)

**Flujo típico día a día:**
```
1. Login → Dashboard
2. Revisa métricas del día
3. Ve alerta: "Tienes 5 pagos pendientes"
4. Va a Pagos → Valida comprobantes
5. Aprueba 4, rechaza 1 (monto incorrecto)
6. Va a Turnos → Revisa próximos turnos
7. Marca ausente a un turno de hace 2 horas
8. Va a Empleados → Crea nuevo empleado "Juan"
9. Va a Configuración → Cambia % seña de 50% a 30%
10. Logout
```

**Flujo gestión canchas:**
```
1. Va a Deportes → Crea "Fútbol 11"
2. Va a Canchas → Crea "Cancha 1"
   - Deporte: Fútbol 11
   - Precio base: $5000
3. (Backend genera turnos automáticamente)
4. Va a Turnos → Ve turnos disponibles
5. Cancha tiene problema → Deshabilita
6. Backend reasigna turnos fijos a otra cancha
```

### 17.3 EMPLEADO

**Acceso:**
- Login → `/complejo/[suComplejoId]` (directo)
- Solo ve su complejo

**Navegación:**
- Dashboard
- Turnos
- Pagos
- Canchas
- Deportes
- Turnos Fijos
- Estadísticas
- **NO** Empleados
- **NO** Configuración (o muy limitado)

**Permisos limitados:**
- NO puede editar datos bancarios
- NO puede crear/eliminar empleados
- NO puede eliminar canchas (solo habilitar/deshabilitar)
- SÍ puede gestionar turnos y pagos (operativa diaria)

**Flujo típico turno de trabajo:**
```
1. Login 8:00 AM
2. Dashboard → Ve turnos del día
3. Pagos → Valida 3 transferencias
4. Turnos → Cliente llega
   - Verifica turno CONFIRMADO
   - Todo OK
5. Turnos → Cliente no se presenta
   - Marca AUSENTE
6. Canchas → Cancha 2 inundada
   - Deshabilita temporalmente
7. Estadísticas → Revisa ocupación del día
8. Logout 16:00 PM
```

### 17.4 Interacción con App Pública (Clientes)

**Cliente sin cuenta:**
```
APP PÚBLICA:
1. Ve disponibilidad → GET /turnos/disponibilidad
2. Reserva turno → POST /turnos/reservar
3. Recibe datos bancarios
4. Transfiere seña
5. Envía comprobante → POST /pagos/enviar-comprobante

PANEL ADMIN (Empleado):
6. Recibe notificación "Pago pendiente"
7. Va a Pagos → Ve comprobante
8. Contacta por WhatsApp si es necesario
9. Aprueba → Turno pasa a CONFIRMADO
Cliente con cuenta (Turno Fijo):
APP PÚBLICA:
1. Cliente solicita turno fijo
   - POST /turnos-fijos
   - Martes 20:00, CanchaAContinue1
BACKEND (CRON diario 2:00 AM):
2. Genera turnos próximos 30 días

Todos los martes 20:00
Estado: RESERVADO (requiere seña semanal)

APP PÚBLICA (Cliente cada semana):
3. Ve turno del próximo martes
4. Paga seña 24hs antes
5. Envía comprobante
PANEL ADMIN:
6. Dueño aprueba → Turno CONFIRMADO
7. Si no paga → CRON cancela turno
8. Turno fijo sigue activo (genera siguiente semana)

---

## 18. Anexo: Endpoints Mapeados

### 18.1 Autenticación

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `login(identifier, password)` | `POST /auth/login` | Mutation | `{ identifier, password }` |
| `logout()` | `POST /auth/logout` | Mutation | - |
| `checkAuth()` | `GET /auth/profile` | Query | - |

### 18.2 Complejos

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `useQuery(['complejos'])` | `GET /complejos` | Query | - |
| `useQuery(['complejo', id])` | `GET /complejos/:id` | Query | - |
| `actualizar.mutate(data)` | `PATCH /complejos/:id` | Mutation | `data` |
| `actualizarBancarios.mutate(data)` | `PATCH /complejos/:id/datos-bancarios` | Mutation | `{ cbu, alias, titular }` |

### 18.3 Turnos

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `useTurnos(complejoId)` | `GET /turnos/complejo/:complejoId` | Query | - |
| `confirmarTurno.mutate(id)` | `POST /turnos/:id/confirmar` | Mutation | - |
| `marcarAusente.mutate(id)` | `POST /turnos/:id/ausente` | Mutation | - |
| `bloquearTurno.mutate(id)` | `POST /turnos/:id/bloquear` | Mutation | - |
| `cancelarTurno.mutate(id)` | `DELETE /turnos/:id` | Mutation | - |

### 18.4 Pagos

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `usePagos(complejoId)` | `GET /pagos/pendientes?complejoId=X` | Query | - |
| `aprobarPago.mutate(id)` | `PATCH /pagos/:id/aprobar` | Mutation | - |
| `rechazarPago.mutate({id, motivo})` | `PATCH /pagos/:id/rechazar` | Mutation | `{ motivoRechazo }` |

### 18.5 Canchas

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `useCanchas(complejoId)` | `GET /canchas/complejo/:complejoId` | Query | - |
| `crearCancha.mutate(data)` | `POST /canchas` | Mutation | `{ nombre, deporteId, precioBase, complejoId }` |
| `editarCancha.mutate({id, ...data})` | `PATCH /canchas/:id` | Mutation | `data` |
| `cambiarEstado.mutate({id, estado})` | `PATCH /canchas/:id/estado` | Mutation | `{ estado }` |
| `eliminarCancha.mutate(id)` | `DELETE /canchas/:id` | Mutation | - |

### 18.6 Deportes

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `useDeportes(complejoId)` | `GET /deportes/complejo/:complejoId` | Query | - |
| `crearDeporte.mutate(data)` | `POST /deportes` | Mutation | `{ nombre, icono, complejoId }` |
| `editarDeporte.mutate({id, ...data})` | `PATCH /deportes/:id` | Mutation | `data` |
| `eliminarDeporte.mutate(id)` | `DELETE /deportes/:id` | Mutation | - |

### 18.7 Empleados

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `useEmpleados(complejoId)` | `GET /complejos/:id/empleados` | Query | - |
| `crearEmpleado.mutate(data)` | `POST /complejos/:id/empleados` | Mutation | `{ nombre, apellido, telefono, password }` |
| `editarEmpleado.mutate({id, ...data})` | `PATCH /usuarios/empleados/:id` | Mutation | `data` |
| `cambiarPassword.mutate({id, password})` | `PATCH /usuarios/empleados/:id/password` | Mutation | `{ password }` |
| `eliminarEmpleado.mutate(id)` | `DELETE /complejos/:complejoId/empleados/:id` | Mutation | - |

### 18.8 Turnos Fijos

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `useTurnosFijos(complejoId)` | `GET /turnos-fijos/complejo/:complejoId` | Query | - |
| `pausarTurnoFijo.mutate(id)` | `PATCH /turnos-fijos/:id/pausar` | Mutation | - |
| `reactivarTurnoFijo.mutate(id)` | `PATCH /turnos-fijos/:id/reactivar` | Mutation | - |
| `cancelarTurnoFijo.mutate(id)` | `DELETE /turnos-fijos/:id` | Mutation | - |

### 18.9 Estadísticas

| Frontend | Backend | Método | Body/Params |
|----------|---------|--------|-------------|
| `useEstadisticas(complejoId)` | `GET /estadisticas/dashboard?complejoId=X` | Query | - |
| Stats avanzadas | `GET /estadisticas/rendimiento?complejoId=X&periodo=mensual&comparar=true` | Query | Query params |

---

## 19. Checklist de Funcionalidades

### ✅ Implementado

- [x] Login con JWT en cookies
- [x] Protección de rutas
- [x] Dashboard con métricas en tiempo real
- [x] Gestión de Pagos (aprobar/rechazar)
- [x] Gestión de Turnos (confirmar, ausente, bloquear, cancelar)
- [x] CRUD Canchas (crear, editar, cambiar estado, eliminar)
- [x] CRUD Deportes
- [x] CRUD Empleados
- [x] Gestión Turnos Fijos (pausar, reactivar, cancelar)
- [x] Estadísticas avanzadas
- [x] Configuración del complejo
- [x] Sistema de permisos por rol
- [x] Navegación dinámica según rol
- [x] Diseño minimalista blanco/negro
- [x] React Query con cache
- [x] TypeScript estricto
- [x] Manejo de errores

### 🔄 Pendiente/Futuro

- [ ] Responsive mobile (hamburger menu)
- [ ] Configuración de horarios por cancha (UI)
- [ ] Precios dinámicos por día (UI)
- [ ] Generación manual de turnos (UI)
- [ ] Reserva de turno desde admin
- [ ] Vista calendario para turnos
- [ ] Exportar reportes (PDF/Excel)
- [ ] Notificaciones push
- [ ] Dark mode
- [ ] Multi-idioma
- [ ] Tests unitarios
- [ ] Tests E2E

---

## 20. Comandos Útiles
```bash
# Desarrollo
npm run dev                    # Inicia servidor dev en :3001

# Build
npm run build                  # Build producción
npm run start                  # Inicia producción

# Linting
npm run lint                   # ESLint

# Dependencias
npm install                    # Instalar deps
npm install <paquete>          # Agregar dep

# Tailwind
npx tailwindcss init -p        # Inicializar config
```

---

## 21. Troubleshooting

### Problema: "Module not found" en imports CSS
**Solución:** Crear `src/types/css.d.ts`:
```typescript
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
```

### Problema: Cookies no se envían
**Solución:** Verificar `withCredentials: true` en axios config

### Problema: 401 Unauthorized en requests
**Solución:** 
1. Verificar que backend retorna cookie
2. Verificar `withCredentials: true`
3. Verificar CORS en backend permite credentials

### Problema: React Query no refetch después de mutation
**Solución:** Asegurar `queryClient.invalidateQueries()` en `onSuccess`

### Problema: TypeScript errors en params
**Solución:** Next.js 14 usa `Promise<>` en params:
```typescript
function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
}
```

---

## 22. Mejores Prácticas Aplicadas

✅ **Separación de responsabilidades**: UI / Lógica / Datos
✅ **Type Safety**: TypeScript en todo
✅ **DRY**: Custom hooks reutilizables
✅ **Single Source of Truth**: React Query para server state
✅ **Optimistic UI**: Cache de React Query
✅ **Error Boundaries**: Manejo centralizado de errores
✅ **Composición**: Componentes pequeños y reutilizables
✅ **Convenciones**: Nombrado consistente
✅ **Documentación**: Código auto-documentado con tipos

---

## 📝 Resumen Ejecutivo

Este frontend de administración es una **SPA (Single Page Application)** construida con **Next.js 14** y **React 18** que se comunica con el backend NestJS mediante **REST API con JWT en cookies HTTP-only**.

**Características principales:**
- **3 roles** con permisos granulares
- **9 módulos funcionales** completos
- **Cache inteligente** con React Query
- **Type Safety** total con TypeScript
- **Diseño minimalista** blanco/negro
- **Optimizado** para performance

**Flujo de datos:**
Usuario → UI Component → Custom Hook → React Query → Axios → Backend API
↓
Cache + State Management

**Stack:**
- Next.js 14 + React 18 + TypeScript
- TanStack Query (React Query)
- Zustand (Auth State)
- Axios (HTTP Client)
- Tailwind CSS (Estilos)

---

**📌 FIN DE LA DOCUMENTACIÓN**

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Estado:** Funcional y completo

---

¿Necesitas que agregue o profundice en alguna sección específica?Claude can make mistakes. Please double-check responses.