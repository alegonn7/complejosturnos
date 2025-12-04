📘 Documentación Completa del Backend - Sistema de Gestión de Turnos para Canchas

📑 Tabla de Contenidos

Visión General del Sistema
Arquitectura y Stack Tecnológico
Modelo de Base de Datos
Sistema de Autenticación y Autorización
Módulos del Sistema
Flujos de Negocio Principales
Sistema de CRON Jobs
Guía de Endpoints por Módulo
Validaciones y Reglas de Negocio
Manejo de Errores
Configuración y Variables de Entorno


1. Visión General del Sistema
1.1 Propósito
Sistema backend completo para la gestión de turnos en complejos deportivos (fútbol, pádel, tenis, etc.). Permite a los clientes reservar turnos con o sin cuenta, gestionar pagos mediante señas, y a los administradores tener control total sobre canchas, horarios, precios y estadísticas.
1.2 Casos de Uso Principales

Cliente sin cuenta: Reservar turnos, enviar comprobantes de pago, cancelar turnos
Cliente con cuenta: Todo lo anterior + turnos fijos recurrentes
Empleado: Gestionar turnos, validar pagos, ver estadísticas del complejo
Dueño: Todo lo de empleado + gestionar canchas, empleados, configuración
Superadmin: Control total sobre todos los complejos del sistema

1.3 Características Principales
✅ Multi-complejo (un sistema para múltiples complejos)
✅ Reserva pública (sin necesidad de cuenta)
✅ Sistema de señas configurable por complejo
✅ Turnos fijos recurrentes con pago semanal
✅ Generación automática de turnos basada en configuración
✅ Precios dinámicos por día de semana
✅ Anti-bot (rate limiting en reservas)
✅ Expiración automática de turnos sin pago
✅ Estadísticas y reportes detallados
✅ Alertas inteligentes para administradores

2. Arquitectura y Stack Tecnológico
2.1 Stack Principal
┌─────────────────────────────────────────────┐
│            BACKEND (NestJS)                 │
├─────────────────────────────────────────────┤
│  • Node.js v18+                             │
│  • TypeScript                               │
│  • NestJS Framework                         │
│  • Prisma ORM                               │
│  • PostgreSQL                               │
│  • JWT Authentication                       │
│  • Class Validator                          │
│  • CRON Jobs (@nestjs/schedule)             │
└─────────────────────────────────────────────┘
2.2 Estructura de Carpetas
backend/
├── src/
│   ├── common/                    # Código compartido
│   │   ├── decorators/            # Decoradores personalizados
│   │   │   └── roles.decorator.ts
│   │   └── guards/                # Guards globales
│   │       └── roles.guard.ts
│   │
│   ├── modules/                   # Módulos de la aplicación
│   │   ├── auth/                  # Autenticación
│   │   ├── complejos/             # Gestión de complejos
│   │   ├── usuarios/              # Gestión de usuarios
│   │   ├── deportes/              # Gestión de deportes
│   │   ├── canchas/               # Gestión de canchas
│   │   ├── turnos/                # Gestión de turnos
│   │   ├── pagos/                 # Gestión de pagos
│   │   ├── turnos-fijos/          # Turnos recurrentes
│   │   ├── estadisticas/          # Reportes y métricas
│   │   └── prisma/                # Servicio de Prisma
│   │
│   ├── app.module.ts              # Módulo raíz
│   └── main.ts                    # Punto de entrada
│
├── prisma/
│   ├── schema.prisma              # Esquema de base de datos
│   └── migrations/                # Migraciones
│
├── .env                           # Variables de entorno
├── package.json
└── tsconfig.json
2.3 Patrón de Arquitectura
Arquitectura Modular con NestJS
Cada módulo sigue el patrón:
modulo/
├── dto/                  # Data Transfer Objects (validación)
├── guards/               # Guards específicos del módulo
├── modulo.controller.ts  # Endpoints HTTP
├── modulo.service.ts     # Lógica de negocio
└── modulo.module.ts      # Configuración del módulo
Principios aplicados:

Separación de responsabilidades: Controller → Service → Prisma
Inyección de dependencias: Gestión automática por NestJS
Validación en DTOs: Class Validator automático
Guards en capas: JWT → Roles → Ownership


3. Modelo de Base de Datos
3.1 Diagrama de Relaciones
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────┐
│  Complejo   │  │    Turno     │
└──────┬──────┘  └──────┬───────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│   Deporte   │  │     Pago     │
└──────┬──────┘  └──────────────┘
       │
       ▼
┌─────────────┐
│   Cancha    │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐  ┌────────────┐  ┌──────────────┐
│ConfigHorario│  │PrecioDinam.│  │  TurnoFijo   │
└─────────────┘  └────────────┘  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │   Historial  │
                                  └──────────────┘
3.2 Entidades Principales
Usuario
prismamodel Usuario {
  id        String     @id @default(cuid())
  email     String?    @unique
  telefono  String     @unique        // Identificador principal
  dni       String?    @unique
  nombre    String
  apellido  String
  rol       RolUsuario @default(CLIENTE)
  password  String?
  complejoId String?   // Si es empleado
  
  // Relaciones
  complejo           Complejo?  @relation(fields: [complejoId])
  complejosPropios   Complejo[] @relation("ComplejosPropietario")
  turnos             Turno[]
  turnosFijos        TurnoFijo[]
}

enum RolUsuario {
  SUPERADMIN  // Control total del sistema
  DUENO       // Propietario de un complejo
  EMPLEADO    // Empleado de un complejo
  CLIENTE     // Usuario final
}
Reglas:

telefono es único y obligatorio (usado para login sin cuenta)
email es opcional pero único si existe
password es opcional (clientes sin cuenta no tienen)
complejoId solo para empleados (apunta a su complejo)
Un DUEÑO tiene relación inversa en complejosPropios


Complejo
prismamodel Complejo {
  id          String   @id @default(cuid())
  nombre      String
  direccion   String
  telefono    String
  email       String?
  
  // Datos bancarios (para transferencias)
  cbu         String?
  alias       String?
  titular     String?
  
  // Configuración de señas
  requiereSeña       Boolean @default(true)
  porcentajeSeña     Int     @default(50)     // 50% del precio
  minutosExpiracion  Int     @default(30)     // 30 min para pagar
  permiteTurnosFijos Boolean @default(true)
  
  // Mercado Pago (futuro)
  mercadoPagoAccessToken  String?
  mercadoPagoPublicKey    String?
  mercadoPagoQR           String?
  
  numeroWhatsapp String?
  
  // Relaciones
  propietarioId String?
  propietario   Usuario?  @relation("ComplejosPropietario")
  empleados     Usuario[]
  canchas       Cancha[]
  deportes      Deporte[]
  turnos        Turno[]
}
Reglas:

Cada complejo puede tener UN propietario (DUEÑO)
Puede tener MUCHOS empleados vinculados
requiereSeña: si es false, turnos se confirman automáticamente
porcentajeSeña: % del precio total a pagar como seña
minutosExpiracion: tiempo límite para enviar comprobante


Deporte
prismamodel Deporte {
  id        String   @id @default(cuid())
  nombre    String
  icono     String?
  
  complejoId String
  complejo   Complejo @relation(...)
  canchas    Cancha[]
  
  @@unique([complejoId, nombre])  // No duplicar deporte en mismo complejo
}
Reglas:

Cada deporte pertenece a UN complejo
No puede haber dos deportes con el mismo nombre en un complejo
Una cancha pertenece a UN deporte


Cancha
prismamodel Cancha {
  id          String       @id @default(cuid())
  nombre      String
  descripcion String?
  estado      EstadoCancha @default(HABILITADA)
  precioBase  Decimal      @db.Decimal(10, 2)
  
  complejoId  String
  deporteId   String
  
  // Relaciones
  complejo              Complejo
  deporte               Deporte
  configuracionHorarios ConfiguracionHorarioCancha[]
  preciosDinamicos      PrecioDinamico[]
  turnos                Turno[]
  turnosFijos           TurnoFijo[]
  
  @@unique([complejoId, nombre])
}

enum EstadoCancha {
  HABILITADA
  DESHABILITADA
  EN_MANTENIMIENTO
}
Reglas:

Nombre único por complejo
precioBase: precio estándar del turno
estado: solo las HABILITADAS permiten reservas
Una cancha tiene MUCHAS configuraciones de horario (una por día de semana)
Una cancha tiene MUCHOS precios dinámicos (uno por día de semana)


ConfiguracionHorarioCancha
prismamodel ConfiguracionHorarioCancha {
  id              String   @id @default(cuid())
  diaSemana       Int      // 0=Domingo, 1=Lunes, ..., 6=Sábado
  horaInicio      String   // "08:00"
  horaFin         String   // "22:00"
  duracionTurno   Int      // minutos (ej: 60)
  activo          Boolean  @default(true)
  diasAdelante    Int      @default(30)
  ultimaGeneracion DateTime?
  
  canchaId        String
  cancha          Cancha
  
  @@unique([canchaId, diaSemana])
}
Ejemplo:

Cancha 1, Lunes (1): 08:00 a 22:00, turnos de 60 minutos
Esto generará turnos: 08:00, 09:00, 10:00, ..., 21:00
diasAdelante: cuántos días al futuro generar (default 30)


PrecioDinamico
prismamodel PrecioDinamico {
  id          String   @id @default(cuid())
  diaSemana   Int
  porcentaje  Int      // 120 = +20%, 80 = -20%
  descripcion String?
  
  canchaId    String
  cancha      Cancha
  
  @@unique([canchaId, diaSemana])
}
Ejemplo:

precioBase = $3000
Viernes (5): porcentaje = 120
Precio final viernes = $3000 × 1.20 = $3600


Turno
prismamodel Turno {
  id          String      @id @default(cuid())
  fecha       DateTime    // Fecha/hora exacta del turno
  duracion    Int         // minutos
  estado      EstadoTurno @default(DISPONIBLE)
  
  // Datos del cliente (puede ser sin cuenta)
  dni              String?
  nombreCliente    String?
  apellidoCliente  String?
  telefonoCliente  String?
  
  // Precios
  precioTotal      Decimal  @db.Decimal(10, 2)
  montoSeña        Decimal? @db.Decimal(10, 2)
  
  // Fechas de control
  fechaReserva      DateTime?
  fechaExpiracion   DateTime?
  fechaConfirmacion DateTime?
  
  // Relaciones
  canchaId    String
  complejoId  String
  usuarioId   String?      // Null si es sin cuenta
  turnoFijoId String?      // Null si no viene de turno fijo
  
  cancha      Cancha
  complejo    Complejo
  usuario     Usuario?
  turnoFijo   TurnoFijo?
  pago        Pago?
  
  @@index([fecha, canchaId])
  @@index([estado])
}

enum EstadoTurno {
  DISPONIBLE      // Nadie lo reservó aún
  RESERVADO       // Cliente reservó, esperando pago
  SENA_ENVIADA    // Cliente envió comprobante
  CONFIRMADO      // Pago validado
  CANCELADO       // Cancelado manualmente
  EXPIRADO        // Venció tiempo de pago
  AUSENTE         // No se presentó
  BLOQUEADO       // Bloqueado por admin
}
```

**Flujo de estados:**
```
DISPONIBLE → RESERVADO → SENA_ENVIADA → CONFIRMADO
              ↓              ↓
           EXPIRADO      CANCELADO
Reglas:

Si requiereSeña = true: pasa por RESERVADO → SENA_ENVIADA → CONFIRMADO
Si requiereSeña = false: va directo de DISPONIBLE → CONFIRMADO
fechaExpiracion: se calcula como fechaReserva + minutosExpiracion
Si pasa fechaExpiracion sin pagar → EXPIRADO (CRON job)
Un turno sin usuarioId significa que fue reserva sin cuenta


Pago
prismamodel Pago {
  id          String      @id @default(cuid())
  monto       Decimal     @db.Decimal(10, 2)
  metodo      MetodoPago  @default(TRANSFERENCIA)
  estado      EstadoPago  @default(PENDIENTE)
  
  fechaEnvio      DateTime?
  fechaValidacion DateTime?
  motivoRechazo   String?
  
  turnoId     String   @unique
  turno       Turno
}

enum MetodoPago {
  TRANSFERENCIA
  EFECTIVO
  MERCADOPAGO
  OTRO
}

enum EstadoPago {
  PENDIENTE
  ENVIADO       // Cliente registró que envió
  APROBADO      // Dueño validó
  RECHAZADO     // Dueño rechazó
}
```

**Flujo:**
```
Cliente envía comprobante → ENVIADO
Dueño valida → APROBADO → Turno pasa a CONFIRMADO
Dueño rechaza → RECHAZADO → Turno vuelve a DISPONIBLE
Reglas:

La seña SIEMPRE es por transferencia o Mercado Pago (nunca efectivo)
Efectivo se usa para pago completo en el momento del turno
No se suben archivos de comprobante (se envían por WhatsApp)


TurnoFijo
prismamodel TurnoFijo {
  id          String   @id @default(cuid())
  diaSemana   Int      // 0-6
  horaInicio  String   // "20:00"
  duracion    Int
  
  activo      Boolean  @default(true)
  fechaInicio DateTime
  fechaFin    DateTime?
  
  requiereSeña Boolean @default(true)  // Configurable por turno fijo
  
  usuarioId   String
  canchaId    String
  
  usuario     Usuario
  cancha      Cancha
  turnosGenerados Turno[]
  historial       HistorialTurnoFijo[]
  
  @@unique([canchaId, diaSemana, horaInicio])
}
Ejemplo:

Usuario Juan reserva turno fijo: Martes a las 20:00
Sistema genera automáticamente un turno CADA martes
Si requiereSeña = true: cada turno se genera en estado RESERVADO (debe pagar 24hs antes)
Si requiereSeña = false: cada turno se genera en estado CONFIRMADO

Reglas:

Solo usuarios CON CUENTA pueden tener turnos fijos
fechaFin puede ser null (indefinido)
Si la cancha se deshabilita → se intenta reasignar a otra cancha del mismo deporte
Si no hay canchas disponibles → se desactiva el turno fijo


HistorialTurnoFijo
prismamodel HistorialTurnoFijo {
  id          String   @id @default(cuid())
  turnoFijoId String
  accion      String   // "CREADO", "PAUSADO", "CANCHA_CAMBIADA", etc.
  detalle     String?
  usuarioId   String?
  createdAt   DateTime @default(now())
  
  turnoFijo   TurnoFijo
}
```

**Acciones registradas:**
- `CREADO`: turno fijo creado
- `PAUSADO`: usuario pausó temporalmente
- `REACTIVADO`: usuario reactivó
- `CANCHA_CAMBIADA`: reasignación automática
- `CANCELADO`: turno fijo eliminado

---

## 4. Sistema de Autenticación y Autorización

### 4.1 Flujo de Autenticación
```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ POST /auth/login
       │ { identifier, password }
       ▼
┌─────────────────────┐
│  AuthController     │
└──────┬──────────────┘
       │
       │ authService.login()
       ▼
┌─────────────────────┐
│  AuthService        │
│  1. Busca usuario   │
│  2. Valida password │
│  3. Genera JWT      │
└──────┬──────────────┘
       │
       │ JWT Token
       ▼
┌─────────────────────┐
│  Cookie HTTP-only   │
│  access_token       │
│  maxAge: 7 días     │
└─────────────────────┘
4.2 Estrategia JWT
Configuración:
typescriptJwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' }
})
Payload del Token:
json{
  "sub": "usuario_id",
  "iat": 1234567890,
  "exp": 1234567890
}
Estrategia de validación:
typescript@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub }
    });
    
    return {
      id: usuario.id,
      rol: usuario.rol,
      telefono: usuario.telefono
    };
  }
}
4.3 Guards en Capas
Capa 1: JwtAuthGuard (Global)
typescript// Verifica que exista un token JWT válido
// Excepto en endpoints marcados con @Public()
Capa 2: RolesGuard (Global)
typescript// Verifica que el usuario tenga el rol requerido
@Roles('DUENO', 'EMPLEADO')
Capa 3: Ownership Guards (Por Módulo)
typescript// Verifica que el usuario tenga permiso sobre ese recurso específico
// Ejemplo: solo el dueño puede editar SU complejo
ComplejoOwnershipGuard
CanchaOwnershipGuard
TurnoOwnershipGuard
4.4 Decoradores Personalizados
@Public()
typescript// Marca endpoint como público (no requiere autenticación)
@Public()
@Get('disponibilidad')
@Roles(...roles)
typescript// Define qué roles pueden acceder
@Roles('SUPERADMIN', 'DUENO')
@Post('complejos')
@CurrentUser()
typescript// Inyecta el usuario autenticado en el método
async getProfile(@CurrentUser() user: any) {
  return user;
}
4.5 Matriz de Permisos
RecursoSUPERADMINDUEÑOEMPLEADOCLIENTEComplejosCrear complejo✅❌❌❌Ver todos✅❌❌✅ (público)Editar su complejo✅✅✅ (excepto bancarios)❌Eliminar complejo✅❌❌❌UsuariosCrear cualquier usuario✅❌❌❌Crear empleado en su complejo✅✅❌❌Editar su perfil✅✅✅✅CanchasCrear cancha✅✅✅❌Editar cancha✅✅✅❌Eliminar cancha✅✅❌❌TurnosVer disponibilidad✅✅✅✅ (público)Reservar✅✅✅✅ (público)Confirmar pago✅✅✅❌EstadísticasVer dashboard✅✅✅❌

5. Módulos del Sistema
5.1 Módulo: Auth
Responsabilidad: Gestión de autenticación y sesiones
Endpoints:
typescriptPOST   /auth/register              // Registro de cliente
POST   /auth/login                 // Login (email o teléfono)
POST   /auth/logout                // Cierre de sesión
GET    /auth/profile               // Ver perfil actual
DTOs:
typescriptRegisterDto {
  telefono: string (required, unique)
  nombre: string
  apellido: string
  email?: string
  dni?: string
  password: string (min 6 chars)
}

LoginDto {
  identifier: string  // email o teléfono
  password: string
}
Lógica de Login:

Determina si identifier es email (@) o teléfono
Busca usuario con ese identificador
Valida password con bcrypt
Genera JWT token
Retorna token en cookie HTTP-only

Cookie de sesión:
typescript{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
}

5.2 Módulo: Complejos
Responsabilidad: Gestión de complejos deportivos
Endpoints:
typescript// PÚBLICO
GET    /complejos                          // Listar todos
GET    /complejos/:id                      // Ver uno

// SUPERADMIN
POST   /complejos                          // Crear
DELETE /complejos/:id                      // Eliminar
PATCH  /complejos/:id/propietario          // Asignar dueño

// DUEÑO/EMPLEADO
GET    /complejos/mi-complejo/info         // Ver mi complejo
PATCH  /complejos/:id                      // Editar
PATCH  /complejos/:id/datos-bancarios      // Solo dueño

// EMPLEADOS
POST   /complejos/:id/empleados            // Crear empleado
GET    /complejos/:id/empleados            // Listar empleados
DELETE /complejos/:id/empleados/:empleadoId // Quitar empleado
Validaciones:

CBU: 22 dígitos numéricos
Alias: 6-20 caracteres, solo minúsculas, números y puntos
porcentajeSeña: entre 1-100
minutosExpiracion: mínimo 5 minutos

Lógica especial:

Al crear empleado: crea Usuario con rol EMPLEADO y lo vincula al complejo
Solo dueño puede editar datos bancarios
Empleados no pueden crear otros empleados


5.3 Módulo: Usuarios
Responsabilidad: CRUD de usuarios del sistema
Endpoints:
typescript// SUPERADMIN
POST   /usuarios                    // Crear usuario cualquier rol
GET    /usuarios                    // Listar todos
GET    /usuarios/:id                // Ver uno
PATCH  /usuarios/:id                // Editar cualquiera
PATCH  /usuarios/:id/rol            // Cambiar rol
DELETE /usuarios/:id                // Eliminar

// DUEÑO
GET    /usuarios/empleados/list     // Ver sus empleados
PATCH  /usuarios/empleados/:id      // Editar empleado
PATCH  /usuarios/empleados/:id/password  // Cambiar password empleado

// CUALQUIER USUARIO
PATCH  /usuarios/me/profile         // Editar mi perfil
PATCH  /usuarios/me/password        // Cambiar mi password
Validaciones especiales:

Al cambiar teléfono: verificar que no exista otro con ese teléfono
Al cambiar email: verificar que no exista otro con ese email
Al cambiar password propio: requerir password actual


5.4 Módulo: Deportes
Responsabilidad: Gestión de deportes por complejo
Endpoints:
typescript// PÚBLICO
GET    /deportes/complejo/:complejoId    // Ver deportes de un complejo

// DUEÑO/EMPLEADO
POST   /deportes                         // Crear deporte
GET    /deportes                         // Ver mis deportes
GET    /deportes/:id                     // Ver uno
PATCH  /deportes/:id                     // Editar
DELETE /deportes/:id                     // Eliminar (solo dueño)
Validaciones:

Nombre único por complejo
No eliminar si tiene canchas asociadas


5.5 Módulo: Canchas
Responsabilidad: Gestión de canchas con horarios y precios
Endpoints:
typescript// PÚBLICO
GET    /canchas/complejo/:complejoId     // Ver canchas de un complejo
GET    /canchas/:id/detalle              // Ver detalle público

// DUEÑO/EMPLEADO
POST   /canchas                          // Crear cancha
GET    /canchas/mis-canchas/list         // Ver mis canchas
PATCH  /canchas/:id                      // Editar
PATCH  /canchas/:id/estado               // Cambiar estado
DELETE /canchas/:id                      // Eliminar (solo dueño)

// CONFIGURACIÓN DE HORARIOS
POST   /canchas/:id/horarios             // Crear config
GET    /canchas/:id/horarios             // Listar configs
PATCH  /canchas/:id/horarios/:horarioId  // Editar config
DELETE /canchas/:id/horarios/:horarioId  // Eliminar config

// PRECIOS DINÁMICOS
POST   /canchas/:id/precios              // Crear precio
GET    /canchas/:id/precios              // Listar precios
PATCH  /canchas/:id/precios/:precioId    // Editar precio
DELETE /canchas/:id/precios/:precioId    // Eliminar precio
ConfiguracionHorarioCancha:
typescript{
  diaSemana: 1,         // Lunes
  horaInicio: "08:00",
  horaFin: "22:00",
  duracionTurno: 60,    // minutos
  activo: true,
  diasAdelante: 30
}
PrecioDinamico:
typescript{
  diaSemana: 5,         // Viernes
  porcentaje: 120,      // +20%
  descripcion: "Precio fin de semana"AContinue}

**Validaciones:**
- Nombre único por complejo
- No eliminar si tiene turnos asociados
- `horaFin` > `horaInicio`
- Una sola configuración por día de semana
- Un solo precio dinámico por día de semana

---

### 5.6 Módulo: Turnos

**Responsabilidad:** Gestión de turnos y reservas

**Endpoints:**
```typescript
// PÚBLICO
GET    /turnos/disponibilidad             // Ver turnos disponibles
POST   /turnos/reservar                   // Reservar sin cuenta
POST   /turnos/:id/cancelar-publico       // Cancelar sin cuenta

// CLIENTE
GET    /turnos/mis-turnos                 // Ver mis turnos
POST   /turnos/reservar-autenticado       // Reservar con cuenta
POST   /turnos/:id/cancelar               // Cancelar con cuenta
POST   /turnos/:id/cancelar-individual    // Cancelar uno de turno fijo

// DUEÑO/EMPLEADO
POST   /turnos/generar                    // Generar turnos manualmente
GET    /turnos/complejo/:complejoId       // Ver todos del complejo
GET    /turnos/cancha/:canchaId           // Ver de una cancha
GET    /turnos/:id                        // Ver detalle
PATCH  /turnos/:id                        // Editar turno
POST   /turnos/:id/confirmar              // Confirmar pago
POST   /turnos/:id/ausente                // Marcar ausente
POST   /turnos/:id/bloquear               // Bloquear turno
DELETE /turnos/:id                        // Eliminar

// CRON (INTERNO)
POST   /turnos/expirar-vencidos           // Expirar turnos
```

**Flujo de Generación de Turnos:**

Obtener ConfiguracionHorarioCancha activas
Para cada día en el rango (0-30 días):
a. Verificar si hay config para ese diaSemana
b. Generar turnos desde horaInicio hasta horaFin
c. Calcular precio (precioBase × precioDinamico.porcentaje)
d. Verificar que no exista ya ese turno
e. Crear turno en DISPONIBLE


**Flujo de Reserva:**

Verificar anti-bot (max 5 reservas en 10min por teléfono)
Verificar límite activos (max 3 turnos activos por teléfono)
Buscar turno y validar que esté DISPONIBLE
Si requiereSeña:

Calcular montoSeña (precioTotal × porcentajeSeña%)
Calcular fechaExpiracion (ahora + minutosExpiracion)
Estado → RESERVADO


Si NO requiereSeña:

Estado → CONFIRMADO


Guardar datos del cliente
Registrar reserva para anti-bot


**Anti-bot:**
```typescript
private reservasPorTelefono: Map<string, number[]> = new Map();
const MAX_RESERVAS_POR_PERIODO = 5;
const PERIODO_MINUTOS = 10;

// Almacena timestamps de reservas por teléfono
// Rechaza si supera el límite en el período
```

---

### 5.7 Módulo: Pagos

**Responsabilidad:** Gestión de señas y validación

**Endpoints:**
```typescript
// PÚBLICO
POST   /pagos/enviar-comprobante         // Registrar envío
GET    /pagos/turno/:turnoId             // Ver estado de pago

// DUEÑO/EMPLEADO
GET    /pagos/pendientes                 // Ver pendientes
GET    /pagos/complejo/:complejoId       // Ver todos
GET    /pagos/:id                        // Ver detalle
PATCH  /pagos/:id/aprobar                // Aprobar pago
PATCH  /pagos/:id/rechazar               // Rechazar pago
POST   /pagos/efectivo/:turnoId          // Registrar pago efectivo
```

**Flujo de Pago:**

Cliente reserva turno → estado RESERVADO
Cliente envía comprobante:
POST /pagos/enviar-comprobante
{
turnoId: "...",
metodo: "TRANSFERENCIA",
monto: 1500
}
Se crea Pago con estado ENVIADO
Turno pasa a SENA_ENVIADA
Dueño valida:
a. Si APRUEBA → Pago: APROBADO, Turno: CONFIRMADO
b. Si RECHAZA → Pago: RECHAZADO, Turno: DISPONIBLE


**Validaciones:**
- Solo turnos en RESERVADO pueden registrar pago
- Seña no puede ser en efectivo
- Efectivo solo se registra para turnos CONFIRMADOS (pago completo)

---

### 5.8 Módulo: Turnos Fijos

**Responsabilidad:** Gestión de turnos recurrentes

**Endpoints:**
```typescript
// CLIENTE
POST   /turnos-fijos                      // Solicitar turno fijo
GET    /turnos-fijos/mis-turnos-fijos    // Ver mis turnos fijos
PATCH  /turnos-fijos/:id/pausar          // Pausar
PATCH  /turnos-fijos/:id/reactivar       // Reactivar
DELETE /turnos-fijos/:id                 // Cancelar

// DUEÑO/EMPLEADO
GET    /turnos-fijos/complejo/:complejoId  // Ver todos
GET    /turnos-fijos/cancha/:canchaId      // Ver de una cancha
GET    /turnos-fijos/:id                   // Ver detalle
PATCH  /turnos-fijos/:id                   // Editar
DELETE /turnos-fijos/:id                   // Cancelar

// CRON (INTERNO)
POST   /turnos-fijos/generar-turnos        // Generar turnos
```

**Flujo de Creación:**

Usuario con cuenta solicita turno fijo
Validar que no exista otro en ese horario
Crear TurnoFijo:
{
diaSemana: 2,        // Martes
horaInicio: "20:00",
duracion: 60,
requiereSeña: true,  // Configurable
fechaInicio: hoy,
fechaFin: null       // Indefinido
}
Registrar en historial: "CREADO"


**Flujo de Generación (CRON diario):**

Obtener todos los TurnoFijo activos
Para cada TurnoFijo:
a. Generar turnos hasta 30 días adelante
b. Solo días que coincidan con diaSemana
c. Si requiereSeña: estado RESERVADO
d. Si NO requiereSeña: estado CONFIRMADO
e. Vincular con turnoFijoId


**Reasignación de Cancha:**
Si cancha se deshabilita:

Buscar otra cancha del mismo deporte en el complejo
Si hay disponible sin conflicto → reasignar
Si todas ocupadas → pausar turno fijo
Si no hay más canchas → eliminar turno fijo
Registrar en historial


**Cancelación Individual:**
Cliente puede cancelar UN turno sin afectar el turno fijo:
POST /turnos/:id/cancelar-individual

Turno vuelve a DISPONIBLE
TurnoFijo sigue activo
Se generará nuevo turno la próxima semana


---

### 5.9 Módulo: Estadísticas

**Responsabilidad:** Reportes y métricas para administradores

**Endpoints:**
```typescript
// DASHBOARD PRINCIPAL
GET /estadisticas/dashboard?complejoId=xxx

// REPORTE DE RENDIMIENTO
GET /estadisticas/rendimiento
  ?complejoId=xxx
  &periodo=semanal|mensual|anual|historico
  &comparar=true

// ANÁLISIS DETALLADOS
GET /estadisticas/turnos/analisis
GET /estadisticas/canchas/analisis
GET /estadisticas/clientes/analisis
GET /estadisticas/ingresos/analisis
GET /estadisticas/deportes/analisis
GET /estadisticas/horarios/optimizacion
```

**Dashboard Response:**
```json
{
  "resumenHoy": {
    "fecha": "2024-01-15",
    "totalTurnos": 45,
    "turnosConfirmados": 28,
    "ingresosDia": 125000,
    "ocupacion": 75.5
  },
  "proximosTurnos": [...],  // Próxima hora
  "pagosPendientes": 8,
  "turnosFijosActivos": 15,
  "alertas": [
    {
      "tipo": "PAGOS_PENDIENTES",
      "mensaje": "Tienes 8 pagos pendientes",
      "prioridad": "MEDIA"
    }
  ],
  "tendenciaSemanal": {
    "semanaActual": { "turnos": 280, "ingresos": 840000 },
    "semanaAnterior": { "turnos": 265, "ingresos": 795000 },
    "variacion": { "turnos": "+5.7%", "ingresos": "+5.7%" }
  }
}
```

**Reporte de Rendimiento Response:**
```json
{
  "periodoActual": {
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-01-31",
    "turnos": {
      "totales": 450,
      "confirmados": 380,
      "tasaOcupacion": 75.5,
      "tasaAusencias": 6.7
    },
    "ingresos": {
      "brutos": 1350000,
      "promedioPorTurno": 3000
    },
    "clientes": {
      "totales": 180,
      "nuevos": 25,
      "tasaRetencion": 86.1
    },
    "mejorCancha": { "nombre": "Cancha 1", "ocupacion": 92 },
    "peorCancha": { "nombre": "Cancha 3", "ocupacion": 45 }
  },
  "comparacion": {
    "turnos": { "variacion": "+12.5%", "diferencia": +50 },
    "ingresos": { "variacion": "+8.3%", "diferencia": +103500 }
  },
  "tendencias": {
    "ocupacion": [65, 68, 72, 75.5],
    "ingresos": [1200000, 1280000, 1320000, 1350000]
  },
  "insights": [
    "📈 Crecimiento sostenido de 12% en turnos",
    "⚠️ Cancha 3 tiene baja ocupación, considera promociones",
    "🎯 Horario 18:00-20:00 representa el 35% de ingresos"
  ]
}
```

**Tipos de Alertas:**

🔴 **Críticas (ALTA):**
- Más de 10 pagos pendientes hace +24hs
- Turno fijo sin pago 12hs antes del turno
- Cancha deshabilitada con turnos confirmados

🟡 **Importantes (MEDIA):**
- Pagos pendientes de validar
- Cancha con <40% ocupación esta semana
- Cliente con 3+ ausencias consecutivas

🟢 **Informativas (BAJA):**
- Nuevo récord de ocupación
- Mes con mejor rendimiento histórico

---

## 6. Flujos de Negocio Principales

### 6.1 Flujo Completo: Reserva con Seña
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE RESERVA CON SEÑA                     │
└─────────────────────────────────────────────────────────────────┘

CLIENTE: Consulta disponibilidad
GET /turnos/disponibilidad?canchaId=xxx&fecha=2024-01-15
Response: Lista de turnos DISPONIBLES
CLIENTE: Selecciona turno y reserva
POST /turnos/reservar
{
turnoId: "turno_123",
telefonoCliente: "123456789",
nombreCliente: "Juan",
apellidoCliente: "Pérez",
dni: "12345678"
}
Backend:

Valida anti-bot
Calcula montoSeña (precioTotal × 50%)
Calcula fechaExpiracion (ahora + 30min)
Turno → RESERVADO

Response:
{
turno: {...},
requiereSeña: true,
montoSeña: 1500,
fechaExpiracion: "2024-01-15T14:30:00Z"
}
FRONTEND: Muestra datos bancarios del complejo

CBU / Alias
Monto a transferir
Botón "Enviar comprobante por WhatsApp"


CLIENTE: Realiza transferencia y envía comprobante
POST /pagos/enviar-comprobante
{
turnoId: "turno_123",
metodo: "TRANSFERENCIA",
monto: 1500
}
Backend:

Crea Pago → ENVIADO
Turno → SENA_ENVIADA


DUEÑO: Recibe notificación (frontend polling o webhooks)
GET /pagos/pendientes
Ve lista de pagos pendientes

6a. DUEÑO: Aprueba pago
PATCH /pagos/{pagoId}/aprobar
Backend:
- Pago → APROBADO
- Turno → CONFIRMADO
- fechaConfirmacion = now()
6b. DUEÑO: Rechaza pago
PATCH /pagos/{pagoId}/rechazar
{
motivoRechazo: "Comprobante inválido"
}
Backend:
- Pago → RECHAZADO
- Turno → DISPONIBLE (vuelve a estar libre)
7. CRON JOB: Expiración automática (cada 5 min)
Si fechaExpiracion < now() && estado = RESERVADO:

Turno → EXPIRADO
Luego se puede volver a DISPONIBLE


---

### 6.2 Flujo: Reserva SIN Seña

CLIENTE: Reserva turno
POST /turnos/reservar
{
turnoId: "turno_123",
telefonoCliente: "123456789",
...
}
Backend verifica: complejo.requiereSeña = false
Response:
{
turno: {...},
requiereSeña: false
}
Turno pasa directamente a CONFIRMADO
No requiere pago previo


---

### 6.3 Flujo: Turno Fijo
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE TURNO FIJO                           │
└─────────────────────────────────────────────────────────────────┘

CLIENTE: Crea turno fijo (requiere cuenta)
POST /turnos-fijos
{
canchaId: "cancha_1",
diaSemana: 2,        // Martes
horaInicio: "20:00",
duracion: 60,
requiereSeña: true   // Configurable
}
Backend:

Valida que no exista conflicto
Crea TurnoFijo
Estado: activo
Registra en historial


CRON JOB DIARIO (2:00 AM):
POST /turnos-fijos/generar-turnos
Para cada TurnoFijo activo:

Busca próximos martes hasta 30 días
Genera Turno para cada fecha:

Si requiereSeña: estado RESERVADO
Si NO requiereSeña: estado CONFIRMADO
Vincula turnoFijoId



Turnos generados:

2024-01-16 20:00 (Martes)
2024-01-23 20:00 (Martes)
2024-01-30 20:00 (Martes)
2024-02-06 20:00 (Martes)


CLIENTE: Si requiereSeña, debe pagar 24hs antes
Para el turno del 16/01:

Tiene hasta 15/01 20:00 para enviar comprobante
Si no paga → turno se cancela
TurnoFijo sigue activo
Se genera nuevo turno para la semana siguiente


CLIENTE: Cancela un turno individual
POST /turnos/{turnoId}/cancelar-individual

Turno del 23/01 vuelve a DISPONIBLE
TurnoFijo sigue activo
Próximo martes (30/01) sigue reservado


CLIENTE: Pausa turno fijo temporalmente
PATCH /turnos-fijos/{id}/pausar

TurnoFijo.activo = false
CRON deja de generar turnos
Turnos futuros ya generados siguen activos


CLIENTE: Cancela turno fijo definitivamente
DELETE /turnos-fijos/{id}

Cancela todos los turnos futuros
Elimina TurnoFijo
Registra en historial




---

### 6.4 Flujo: Reasignación de Cancha
┌─────────────────────────────────────────────────────────────────┐
│            REASIGNACIÓN AUTOMÁTICA DE TURNO FIJO                 │
└─────────────────────────────────────────────────────────────────┘
Escenario: Cancha 1 se deshabilita

ADMIN: Deshabilita cancha
PATCH /canchas/{canchaId}/estado
{
estado: "DESHABILITADA"
}
BACKEND: Detecta turnos fijos afectados

Busca TurnoFijo con canchaId = "cancha_1"
Para cada TurnoFijo:
a. Busca canchas alternativas:

Mismo complejo
Mismo deporte
Estado HABILITADA

b. Verifica disponibilidad:

Busca cancha sin conflicto en ese horario

c. CASO 1: Hay cancha disponible

Reasigna: TurnoFijo.canchaId = "cancha_2"
Registra: "CANCHA_CAMBIADA" en historial
ALERTA (MEDIA): "Turno fijo movido a Cancha 2"

d. CASO 2: Todas ocupadas en ese horario

Pausa: TurnoFijo.activo = false
Registra: "PAUSADO" en historial
ALERTA (ALTA): "Turno fijo pausado, no hay canchas disponibles"

e. CASO 3: No quedan canchas del deporte

Elimina TurnoFijo
Registra: "CANCELADO" en historial
ALERTA (ALTA): "Turno fijo cancelado, contactar usuario"




ADMIN: Ve alertas en dashboard
GET /estadisticas/dashboard
Response incluye alertas con detalles


---

## 7. Sistema de CRON Jobs

### 7.1 Job: Expiración de Turnos

**Frecuencia:** Cada 5 minutos

**Archivo:** `src/modules/turnos/turnos.cron.ts`
```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async handleExpirarTurnos() {
  const ahora = new Date();
  
  // Buscar turnos RESERVADOS con fechaExpiracion vencida
  const turnosExpirados = await prisma.turno.updateMany({
    where: {
      estado: 'RESERVADO',
      fechaExpiracion: {
        lt: ahora
      }
    },
    data: {
      estado: 'EXPIRADO'
    }
  });
  
  // Luego podrían volver a DISPONIBLE
  // (depende de lógica de negocio)
}
```

**Propósito:**
- Liberar turnos que no fueron pagados a tiempo
- Evitar que clientes bloqueen turnos indefinidamente

---

### 7.2 Job: Generación de Turnos Normales

**Frecuencia:** Diario a las 2:00 AM

**Archivo:** Podría agregarse en `src/modules/turnos/turnos.cron.ts`
```typescript
@Cron('0 2 * * *')  // 2:00 AM todos los días
async handleGenerarTurnos() {
  // Obtener todas las canchas activas
  const canchas = await prisma.cancha.findMany({
    where: { estado: 'HABILITADA' },
    include: {
      configuracionHorarios: {
        where: { activo: true }
      }
    }
  });
  
  for (const cancha of canchas) {
    // Generar turnos hasta diasAdelante configurado
    await turnosService.generarTurnos({
      canchaId: cancha.id,
      diasAdelante: 30
    });
  }
}
```

**Propósito:**
- Mantener siempre turnos disponibles hasta 30 días adelante
- Ejecutar de madrugada para no impactar usuarios

---

### 7.3 Job: Generación de Turnos Fijos

**Frecuencia:** Diario a las 2:00 AM

**Archivo:** `src/modules/turnos-fijos/turnos-fijos.cron.ts`
```typescript
@Cron('0 2 * * *')
async handleGenerarTurnos() {
  const hoy = new Date();
  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + 30);
  
  // Obtener turnos fijos activos
  const turnosFijos = await prisma.turnoFijo.findMany({
    where: {
      activo: true,
      OR: [
        { fechaFin: null },
        { fechaFin: { gte: hoy } }
      ]
    }
  });
  
  for (const turnoFijo of turnosFijos) {
    // Generar turnos para las próximas 4 semanas
    // Solo días que coincidan con diaSemana
    await generarTurnosParaTurnoFijo(turnoFijo, limite);
  }
}
```

**Propósito:**
- Generar automáticamente turnos recurrentes
- Mantener 4 semanas de turnos siempre disponibles

---

### 7.4 Job: Alertas de Turnos Fijos sin Pago

**Frecuencia:** Cada hora

**Archivo:** Podría agregarse en `src/modules/turnos-fijos/turnos-fijos.cron.ts`
```typescript
@Cron('0 * * * *')  // Cada hora
async handleAlertarTurnosFijosSinPago() {
  const en24Horas = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  // Buscar turnos de turno fijo sin pagar próximos a vencer
  const turnosSinPago = await prisma.turno.findMany({
    where: {
      turnoFijoId: { not: null },
      estado: 'RESERVADO',
      fecha: {
        lte: en24Horas
      }
    },
    include: {
      usuario: true,
      turnoFijo: true
    }
  });
  
  // Generar alertas
  // Opcionalmente enviar notificaciones
}
```

**Propósito:**
- Recordar a usuarios de turnos fijos que deben pagar
- Evitar ausencias por olvido

---

## 8. Guía de Endpoints por Módulo

### 8.1 Auth Endpoints

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/auth/register` | ❌ Público | - | Registrar nuevo cliente |
| POST | `/auth/login` | ❌ Público | - | Login con email o teléfono |
| POST | `/auth/logout` | ✅ Requerido | Todos | Cerrar sesión |
| GET | `/auth/profile` | ✅ Requerido | Todos | Ver mi perfil |

---

### 8.2 Complejos Endpoints

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/complejos` | ❌ Público | - | Listar complejos |
| GET | `/complejos/:id` | ❌ Público | - | Ver complejo |
| POST | `/complejos` | ✅ Requerido | SUPERADMIN | Crear complejo |
| PATCH | `/complejos/:id` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Editar complejo |
| DELETE | `/complejos/:id` | ✅ Requerido | SUPERADMIN | Eliminar complejo |
| GET | `/complejos/mi-complejo/info` | ✅ Requerido | DUENO, EMPLEADO | Ver mi complejo |
| PATCH | `/complejos/:id/propietario` | ✅ Requerido | SUPERADMIN | Asignar dueño |
| PATCH | `/complejos/:id/datos-bancarios` | ✅ Requerido | SUPERADMIN, DUENO | Editar datos bancarios |
| POST | `/complejos/:id/empleados` | ✅ Requerido | SUPERADMIN, DUENO | Crear empleado |
| GET | `/complejos/:id/empleados` | ✅ Requerido | SUPERADMIN, DUENO | Listar empleados |
| DELETE | `/complejos/:id/empleados/:empleadoId` | ✅ Requerido | SUPERADMIN, DUENO | Quitar empleado |

---

### 8.3 Usuarios Endpoints

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/usuarios` | ✅ Requerido | SUPERADMIN | Crear usuario |
| GET | `/usuarios` | ✅ Requerido | SUPERADMIN | Listar usuarios |
| GET | `/usuarios/:id` | ✅ Requerido | SUPERADMIN | Ver usuario |
| PATCH | `/usuarios/:id` | ✅ Requerido | SUPERADMIN | Editar usuario |
| DELETE | `/usuarios/:id` | ✅ Requerido | SUPERADMIN | Eliminar usuario |
| PATCH | `/usuarios/:id/rol` | ✅ Requerido | SUPERADMIN | Cambiar rol |
| PATCH | `/usuarios/:id/password` | ✅ Requerido | SUPERADMIN | Cambiar password |
| GET | `/usuarios/empleados/list` | ✅ Requerido | DUENO | Ver mis empleados |
| PATCH | `/usuarios/empleados/:id` | ✅ Requerido | SUPERADMIN, DUENO | Editar empleado |
| PATCH | `/usuarios/empleados/:id/password` | ✅ Requerido | SUPERADMIN, DUENO | Cambiar password empleado |
| PATCH | `/usuarios/me/profile` | ✅ Requerido | Todos | Editar mi perfil |
| PATCH | `/usuarios/me/password` | ✅ Requerido | Todos | Cambiar mi password |

---

### 8.4 Deportes Endpoints

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/deportes/complejo/:complejoId` | ❌ Público | - | Ver deportes de complejo |
| POST | `/deportes` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Crear deporte |
| GET | `/deportes` | ✅ Requerido | DUENO, EMPLEADO | Ver mis deportes |
| GET | `/deportes/:id` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Ver deporte |
| PATCH | `/deportes/:id` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Editar deporte |
| DELETE | `/deportes/:id` | ✅ Requerido | SUPERADMIN, DUENO | Eliminar deporte |

---

### 8.5 Canchas Endpoints

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/canchas/complejo/:complejoId` | ❌ Público | - | Ver canchas de complejo |
| GET | `/canchas/:id/detalle` | ❌ Público | - | Ver detalle cancha |
| POST | `/canchas` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Crear cancha |
| GET | `/canchas/mis-canchas/list` | ✅ Requerido | DUENO, EMPLEADO | Ver mis canchas |
| GET | `/canchas/:id` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Ver cancha |
| PATCH | `/canchas/:id` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Editar cancha |
| PATCH | `/canchas/:id/estado` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Cambiar estado |
| DELETE | `/canchas/:id` | ✅ Requerido | SUPERADMIN, DUENO | Eliminar cancha |
| POST | `/canchas/:id/horarios` | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Crear config horario |
| GET | `/canchas/:id/horarios`AContinue| ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Ver horarios |
| PATCH | /canchas/:id/horarios/:horarioId | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Editar horario |
| DELETE | /canchas/:id/horarios/:horarioId | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Eliminar horario |
| POST | /canchas/:id/precios | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Crear precio dinámico |
| GET | /canchas/:id/precios | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Ver precios |
| PATCH | /canchas/:id/precios/:precioId | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Editar precio |
| DELETE | /canchas/:id/precios/:precioId | ✅ Requerido | SUPERADMIN, DUENO, EMPLEADO | Eliminar precio |

8.6 Turnos Endpoints
MétodoRutaAuthRolesDescripciónGET/turnos/disponibilidad❌ Público-Ver turnos disponiblesPOST/turnos/reservar❌ Público-Reservar sin cuentaPOST/turnos/:id/cancelar-publico❌ Público-Cancelar sin cuentaGET/turnos/mis-turnos✅ RequeridoCLIENTE, DUENO, EMPLEADOVer mis turnosPOST/turnos/reservar-autenticado✅ RequeridoCLIENTE, DUENO, EMPLEADOReservar con cuentaPOST/turnos/:id/cancelar✅ RequeridoCLIENTE, DUENO, EMPLEADOCancelar turnoPOST/turnos/:id/cancelar-individual✅ RequeridoCLIENTE, DUENO, EMPLEADOCancelar uno de turno fijoPOST/turnos/generar✅ RequeridoSUPERADMIN, DUENO, EMPLEADOGenerar turnos manualmenteGET/turnos/complejo/:complejoId✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer todos del complejoGET/turnos/cancha/:canchaId✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer de una canchaGET/turnos/:id✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer detallePATCH/turnos/:id✅ RequeridoSUPERADMIN, DUENO, EMPLEADOEditar turnoPOST/turnos/:id/confirmar✅ RequeridoSUPERADMIN, DUENO, EMPLEADOConfirmar pagoPOST/turnos/:id/ausente✅ RequeridoSUPERADMIN, DUENO, EMPLEADOMarcar ausentePOST/turnos/:id/bloquear✅ RequeridoSUPERADMIN, DUENO, EMPLEADOBloquear turnoDELETE/turnos/:id✅ RequeridoSUPERADMIN, DUENOEliminar turno

8.7 Pagos Endpoints
MétodoRutaAuthRolesDescripciónPOST/pagos/enviar-comprobante❌ Público-Registrar envíoGET/pagos/turno/:turnoId❌ Público-Ver estado de pagoGET/pagos/pendientes✅ RequeridoDUENO, EMPLEADOVer pagos pendientesGET/pagos/complejo/:complejoId✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer todos los pagosGET/pagos/:id✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer detallePATCH/pagos/:id/aprobar✅ RequeridoSUPERADMIN, DUENO, EMPLEADOAprobar pagoPATCH/pagos/:id/rechazar✅ RequeridoSUPERADMIN, DUENO, EMPLEADORechazar pagoPOST/pagos/efectivo/:turnoId✅ RequeridoSUPERADMIN, DUENO, EMPLEADORegistrar pago efectivo

8.8 Turnos Fijos Endpoints
MétodoRutaAuthRolesDescripciónPOST/turnos-fijos✅ RequeridoCLIENTE, DUENO, EMPLEADOCrear turno fijoGET/turnos-fijos/mis-turnos-fijos✅ RequeridoCLIENTE, DUENO, EMPLEADOVer mis turnos fijosPATCH/turnos-fijos/:id/pausar✅ RequeridoCLIENTE, DUENO, EMPLEADOPausar turno fijoPATCH/turnos-fijos/:id/reactivar✅ RequeridoCLIENTE, DUENO, EMPLEADOReactivar turno fijoDELETE/turnos-fijos/:id✅ RequeridoCLIENTE, DUENO, EMPLEADO, SUPERADMINCancelar turno fijoGET/turnos-fijos/complejo/:complejoId✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer todos del complejoGET/turnos-fijos/cancha/:canchaId✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer de una canchaGET/turnos-fijos/:id✅ RequeridoSUPERADMIN, DUENO, EMPLEADOVer detallePATCH/turnos-fijos/:id✅ RequeridoSUPERADMIN, DUENO, EMPLEADOEditar turno fijo

8.9 Estadísticas Endpoints
MétodoRutaAuthRolesDescripciónGET/estadisticas/dashboard✅ RequeridoSUPERADMIN, DUENO, EMPLEADODashboard principalGET/estadisticas/rendimiento✅ RequeridoSUPERADMIN, DUENO, EMPLEADOReporte de rendimientoGET/estadisticas/turnos/analisis✅ RequeridoSUPERADMIN, DUENO, EMPLEADOAnálisis de turnosGET/estadisticas/canchas/analisis✅ RequeridoSUPERADMIN, DUENO, EMPLEADOAnálisis de canchasGET/estadisticas/clientes/analisis✅ RequeridoSUPERADMIN, DUENO, EMPLEADOAnálisis de clientesGET/estadisticas/ingresos/analisis✅ RequeridoSUPERADMIN, DUENO, EMPLEADOAnálisis de ingresosGET/estadisticas/deportes/analisis✅ RequeridoSUPERADMIN, DUENO, EMPLEADOAnálisis de deportesGET/estadisticas/horarios/optimizacion✅ RequeridoSUPERADMIN, DUENO, EMPLEADOOptimización de horarios

9. Validaciones y Reglas de Negocio
9.1 Validaciones de DTOs
Todas las validaciones se realizan con class-validator:
typescript// Ejemplo: CreateComplejoDto
export class CreateComplejoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;  // Requerido, string no vacío
  
  @IsEmail()
  @IsOptional()
  email?: string;  // Opcional, pero si existe debe ser email válido
  
  @Matches(/^\d{22}$/, { message: 'CBU debe tener 22 dígitos' })
  @IsOptional()
  cbu?: string;  // Opcional, pero si existe debe ser 22 dígitos
  
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  porcentajeSeña?: number;  // Opcional, entre 1-100
}
Validaciones automáticas:

@IsNotEmpty(): No puede ser vacío
@IsString(): Debe ser string
@IsInt(): Debe ser entero
@IsEmail(): Debe ser email válido
@Min(x) / @Max(y): Rango numérico
@Matches(regex): Expresión regular
@IsOptional(): Campo opcional


9.2 Reglas de Negocio Principales
Anti-bot en Reservas:
typescript// Límites por teléfono
MAX_RESERVAS_POR_PERIODO = 5 reservas en 10 minutos
MAX_TURNOS_ACTIVOS = 3 turnos simultáneos

// Validación
if (reservasRecientes.length >= 5) {
  throw BadRequestException(
    'Has alcanzado el límite de 5 reservas en 10 minutos'
  );
}
Expiración de Turnos:
typescript// Al reservar
fechaExpiracion = now() + complejo.minutosExpiracion

// CRON cada 5 minutos
if (turno.estado === 'RESERVADO' && turno.fechaExpiracion < now()) {
  turno.estado = 'EXPIRADO';
}
Cálculo de Precio:
typescript// Precio base de la cancha
precioBase = cancha.precioBase

// Aplicar precio dinámico si existe para ese día
precioDinamico = canchas.preciosDinamicos.find(
  p => p.diaSemana === turno.fecha.getDay()
)

precioFinal = precioBase × (precioDinamico.porcentaje / 100)

// Ejemplo:
// precioBase = 3000
// precioDinamico.porcentaje = 120 (viernes)
// precioFinal = 3000 × 1.20 = 3600
Cálculo de Seña:
typescriptmontoSeña = precioTotal × (complejo.porcentajeSeña / 100)

// Ejemplo:
// precioTotal = 3600
// porcentajeSeña = 50
// montoSeña = 3600 × 0.50 = 1800
Generación de Turnos:
typescript// Para cada ConfiguracionHorarioCancha
for (let dia = 0; dia < diasAdelante; dia++) {
  if (fecha.getDay() === config.diaSemana) {
    let hora = config.horaInicio;
    
    while (hora < config.horaFin) {
      // Crear turno
      // Avanzar por duracionTurno minutos
      hora += config.duracionTurno;
    }
  }
}
Reasignación de Cancha:
typescript// Al deshabilitar cancha
turnosFijos = getTurnosFijosDeCancha(canchaId)

for (turnoFijo of turnosFijos) {
  canchasAlternativas = getCanchasMismoDeporte(
    cancha.deporteId,
    cancha.complejoId
  )
  
  if (canchasAlternativas.length === 0) {
    eliminarTurnoFijo(turnoFijo)
    alertar("TURNO_FIJO_ELIMINADO")
  } else {
    canchaLibre = encontrarCanchaSinConflicto(
      canchasAlternativas,
      turnoFijo.diaSemana,
      turnoFijo.horaInicio
    )
    
    if (canchaLibre) {
      reasignar(turnoFijo, canchaLibre)
      alertar("TURNO_FIJO_REASIGNADO")
    } else {
      pausar(turnoFijo)
      alertar("TURNO_FIJO_PAUSADO")
    }
  }
}

9.3 Validaciones de Unicidad
Base de Datos (Prisma):
prisma// Usuario
@@unique([telefono])
@@unique([email])
@@unique([dni])

// Complejo
@@unique([complejoId, nombre])  // Cancha

// Deporte
@@unique([complejoId, nombre])

// ConfiguracionHorarioCancha
@@unique([canchaId, diaSemana])

// PrecioDinamico
@@unique([canchaId, diaSemana])

// TurnoFijo
@@unique([canchaId, diaSemana, horaInicio])
Aplicación (Service):
typescript// Verificar antes de crear
const existing = await prisma.xxx.findUnique({
  where: { ... }
});

if (existing) {
  throw new ConflictException('Ya existe');
}

9.4 Validaciones de Estado
Estados de Turno:
typescript// Solo turnos DISPONIBLES pueden reservarse
if (turno.estado !== 'DISPONIBLE') {
  throw ConflictException('Turno no disponible');
}

// Solo turnos RESERVADOS pueden registrar pago
if (turno.estado !== 'RESERVADO') {
  throw BadRequestException('Estado incorrecto');
}

// Solo turnos CONFIRMADOS pueden marcarse ausentes
if (turno.estado !== 'CONFIRMADO') {
  throw BadRequestException('Solo turnos confirmados');
}
Estados de Cancha:
typescript// Solo canchas HABILITADAS permiten reservas
if (cancha.estado !== 'HABILITADA') {
  throw BadRequestException('Cancha no habilitada');
}
Estados de Pago:
typescript// Solo pagos ENVIADOS pueden aprobarse/rechazarse
if (pago.estado !== 'ENVIADO') {
  throw BadRequestException('Pago no está en estado ENVIADO');
}

10. Manejo de Errores
10.1 Excepciones HTTP de NestJS
typescript// 400 Bad Request - Datos inválidos
throw new BadRequestException('Mensaje de error')

// 401 Unauthorized - No autenticado
throw new UnauthorizedException('Credenciales inválidas')

// 403 Forbidden - Sin permisos
throw new ForbiddenException('No tienes permisos')

// 404 Not Found - Recurso no existe
throw new NotFoundException('Recurso no encontrado')

// 409 Conflict - Conflicto de unicidad
throw new ConflictException('Ya existe')
10.2 Formato de Respuesta de Error
json{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
Con detalles de validación:
json{
  "statusCode": 400,
  "message": [
    "telefono should not be empty",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
10.3 Interceptor Global de Errores
NestJS maneja automáticamente las excepciones y las convierte en respuestas HTTP apropiadas.

11. Configuración y Variables de Entorno
11.1 Archivo .env
env# Database
DATABASE_URL="postgresql://user:password@localhost:5432/turnos_db"

# JWT
JWT_SECRET="tu_secreto_super_seguro_aqui"
JWT_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3001"
11.2 Configuración de Prisma
typescript// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
11.3 Configuración de JWT
typescript// auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION || '7d'
  }
})
11.4 Configuración de CORS
typescript// main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
});
11.5 Configuración de Cookies
typescript// auth.controller.ts
response.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

12. Comandos Útiles
12.1 Comandos de Prisma
bash# Crear migración
npx prisma migrate dev --name descripcion_cambio

# Aplicar migraciones
npx prisma migrate deploy

# Generar cliente de Prisma
npx prisma generate

# Abrir Prisma Studio (GUI)
npx prisma studio

# Reset database (CUIDADO: borra todo)
npx prisma migrate reset
12.2 Comandos de NestJS
bash# Crear módulo
nest g module modules/nombre

# Crear controller
nest g controller modules/nombre

# Crear service
nest g service modules/nombre

# Iniciar desarrollo
npm run start:dev

# Build para producción
npm run build

# Iniciar producción
npm run start:prod
12.3 Comandos de Testing
bash# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

13. Seguridad
13.1 Protección de Passwords
typescript// Al crear/actualizar
const hashedPassword = await bcrypt.hash(password, 10);

// Al validar
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
13.2 JWT en Cookies HTTP-Only
typescript// Las cookies HTTP-only no son accesibles desde JavaScript
// Protege contra ataques XSS
response.cookie('access_token', token, {
  httpOnly: true,  // No accesible desde JS
  secure: true,    // Solo HTTPS en producción
  sameSite: 'lax'  // Protección CSRF
});
13.3 Validación de Inputs
Todos los DTOs usan class-validator para validar automáticamente:

Tipos de datos
Rangos numéricos
Formatos (email, teléfono, etc.)
Expresiones regulares

13.4 Rate Limiting (Anti-bot)
Implementado en memoria para reservas:

5 reservas máximo cada 10 minutos por teléfono
3 turnos activos máximo por teléfono


14. Notas Importantes para IAs
14.1 Convenciones de Código
Imports con .js:
typescript// Todos los imports internos deben terminar en .js
import { PrismaService } from '../prisma/prisma.service.js';
Decimales en Prisma:
typescript// Siempre usar new Decimal() para valores monetarios
precioTotal: new Decimal(precioTotal.toFixed(2))
Fechas:
typescript// Siempre usar Date objects de JavaScript
const fecha = new Date();
fecha.setHours(0, 0, 0, 0);  // Resetear a medianoche
14.2 Patrones Comunes
Verificar permisos en Service:
typescriptif (userRole !== 'SUPERADMIN') {
  const complejo = await this.prisma.complejo.findUnique({
    where: { id: complejoId },
    select: {
      propietarioId: true,
      empleados: { where: { id: userId }, select: { id: true } }
    }
  });
  
  const isDueno = complejo.propietarioId === userId;
  const isEmpleado = complejo.empleados.length > 0;
  
  if (!isDueno && !isEmpleado) {
    throw new ForbiddenException('No tienes permisos');
  }
}
Cálculo de fechas relativas:
typescript// Hace 30 días
const hace30Dias = new Date();
hace30Dias.setDate(hace30Dias.getDate() - 30);

// En 24 horas
const en24Horas = new Date(Date.now() + 24 * 60 * 60 * 1000);
Queries con relaciones:
typescriptconst turno = await this.prisma.turno.findUnique({
  where: { id },
  include: {
    cancha: {
      select: {
        nombre: true,
        deporte: { select: { nombre: true } }
      }
    },
    usuario: { select: { nombre: true, apellido: true } },
    pago: true
  }
});
14.3 Testing Sugerido
Casos de prueba críticos:

Autenticación y autorización
Reserva de turnos (con y sin seña)
Expiración de turnos
Generación de turnos automática
Reasignación de canchas
Cálculo de precios dinámicos
Validación de unicidad
Anti-bot en reservas


15. Resumen Ejecutivo
15.1 Tecnologías Clave

Backend: NestJS + TypeScript
Base de Datos: PostgreSQL + Prisma ORM
Autenticación: JWT en cookies HTTP-only
Validación: class-validator automático
CRON Jobs: @nestjs/schedule
Arquitectura: Modular, inyección de dependencias

15.2 Características Destacadas
✅ Multi-complejo con roles granulares
✅ Reserva pública sin cuenta
✅ Sistema de señas configurable
✅ Turnos fijos recurrentes
✅ Generación automática de turnos
✅ Precios dinámicos por día
✅ Anti-bot integrado
✅ Expiración automática
✅ Reasignación inteligente de canchas
✅ Dashboard con alertas y métricas
✅ Reportes de rendimiento comparativos
15.3 Módulos Implementados

Auth - Autenticación y sesiones
Complejos - Gestión de complejos y empleados
Usuarios - CRUD de usuarios
Deportes - Gestión de deportes
Canchas - Canchas con horarios y precios
Turnos - Reservas y gestión de turnos
Pagos - Señas y validación manual
Turnos Fijos - Turnos recurrentes
Estadísticas - Dashboard y reportes

15.4 Puntos de Extensión Futuros
🔮 Integraciones pendientes:

Mercado Pago API (estructura preparada)
WhatsApp API para notificaciones
Upload de comprobantes (opcional)
Sistema de notificaciones push
Exportación de reportes (PDF/Excel)

🔮 Mejoras sugeridas:

Redis para cache y rate limiting
WebSockets para actualizaciones en tiempo real
Sistema de cupones/descuentos
Programa de fidelidad para clientes
Multi-idioma
Sistema de reseñas


16. Glosario de Términos
TérminoDefiniciónComplejoConjunto de canchas deportivas bajo una misma administraciónTurnoReserva de una cancha en una fecha/hora específicaTurno FijoTurno recurrente semanal (ej: todos los martes a las 20:00)SeñaPago adelantado (porcentaje del total) para confirmar reservaCBUClave Bancaria Uniforme (22 dígitos)AliasIdentificador bancario alfanumérico (6-20 caracteres)Anti-botSistema de limitación de reservas para evitar abusosOcupaciónPorcentaje de turnos confirmados vs disponiblesPrecio DinámicoModificador de precio por día de semanaGuardMiddleware de NestJS para control de accesoDTOData Transfer Object - Objeto para validación de datosCRONTarea programada que se ejecuta automáticamente

📌 FIN DE LA DOCUMENTACIÓN
Versión: 1.0
Fecha: Enero 2024
Estado: Completo y funcional
Esta documentación cubre el 100% del sistema implementado y está diseñada para ser utilizada por:

Desarrolladores que continúen el proyecto
IAs que necesiten entender el sistema
Product managers para toma de decisiones
Nuevos miembros del equipo

Para consultas específicas, referirse a las secciones correspondientes o al código fuente en la estructura de carpetas descrita.