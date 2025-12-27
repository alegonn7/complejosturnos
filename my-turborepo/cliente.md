📘 Plan de Acción Completo - Sistema de Gestión de Turnos para Canchas
🎯 Resumen Ejecutivo
Sistema SaaS multi-tenant para gestión de turnos en complejos deportivos. El negocio consiste en alquilar la plataforma por mes a dueños de complejos, diferenciándose por alta personalización (logo, colores, textos, banners).

🏗️ Arquitectura General del Sistema
┌──────────────────────────────────────────────────────────────┐
│                    INFRAESTRUCTURA                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────┐                     │
│  │      HETZNER VPS                   │                     │
│  │  (Backend + Admin + PostgreSQL)    │                     │
│  │  • Backend NestJS (puerto 3000)    │                     │
│  │  • Admin Next.js (puerto 3001)     │                     │
│  │  • PostgreSQL                      │                     │
│  │  • /var/www/uploads (storage)      │                     │
│  │  • Nginx (reverse proxy + SSL)     │                     │
│  │  Dominio: api.tuapp.com            │                     │
│  │           admin.tuapp.com          │                     │
│  │           cdn.tuapp.com (uploads)  │                     │
│  └────────────────────────────────────┘                     │
│                        ↕ API REST                            │
│  ┌────────────────────────────────────┐                     │
│  │      VERCEL (u otro)               │                     │
│  │  (Frontend Cliente)                │                     │
│  │  • Cliente Next.js                 │                     │
│  │  • CDN global automático           │                     │
│  │  • Escalado automático             │                     │
│  │  Dominio: tuapp.com.ar             │                     │
│  │  URLs: /complejo-norte             │                     │
│  │        /club-deportivo             │                     │
│  └────────────────────────────────────┘                     │
│                                                               │
└──────────────────────────────────────────────────────────────┘

📦 Componentes del Sistema
1. Backend (NestJS) - Ya implementado

API REST completa
Autenticación JWT en cookies HTTP-only
Sistema de roles (SUPERADMIN, DUEÑO, EMPLEADO, CLIENTE)
Gestión de complejos, canchas, turnos, pagos
CRON jobs para expiración y generación automática
Ubicación: apps/backend/

2. Admin (Next.js) - Ya implementado

Panel para SUPERADMIN, DUEÑO, EMPLEADO
Gestión de turnos, pagos, canchas, empleados
Dashboard con métricas y alertas
Estadísticas avanzadas
Ubicación: apps/admin/

3. Cliente (Next.js) - A IMPLEMENTAR 🚧

App pública para usuarios finales
Reserva de turnos sin cuenta (obligatorio)
Reserva con cuenta (opcional, para turnos fijos)
Personalización por complejo (theming dinámico)
Ubicación: apps/cliente/ (nuevo)


🎨 Modelo de Negocio y Personalización
Modelo SaaS Multi-Tenant
Concepto: Un único sistema, múltiples complejos con apariencia personalizada.
URL Pattern:
tuapp.com.ar/complejo-norte    → Tema A (logo, colores, textos propios)
tuapp.com.ar/club-deportivo    → Tema B (diferente apariencia)
tuapp.com.ar/padel-premium     → Tema C (otro estilo)
Niveles de Personalización
Nivel 1: Branding Visual

Logo (URL guardada en DB, archivo en VPS)
Favicon (para la pestaña del navegador)
Colores (primario, secundario, acento, fondo)
Fuente (opcional, futuro)

Nivel 2: Contenido Textual

Nombre a mostrar (puede diferir del nombre oficial)
Texto hero principal ("Reservá tu cancha en segundos")
Texto hero secundario ("Fútbol 5, pádel y más deportes")
Texto footer (horarios, info de contacto)
Mensaje WhatsApp (pre-cargado al abrir chat)

Nivel 3: Banners (Futuro)

Banner home (imagen principal)
Banner página reserva (promociones, etc.)

Nivel 4: SEO

Meta Title ("Complejo Norte - Reservá Online")
Meta Description (para Google)
Keywords ("cancha, fútbol 5, reserva online")

Nivel 5: Redes Sociales

Facebook URL
Instagram URL
TikTok URL (opcional)


🗄️ Cambios Necesarios en Base de Datos
1. Agregar campo slug a Complejo
prismamodel Complejo {
  id          String   @id @default(cuid())
  slug        String   @unique  // 👈 NUEVO: "complejo-norte"
  nombre      String
  // ... resto de campos existentes
  
  configuracionTema ConfiguracionTema?  // 👈 NUEVO: relación 1:1
}
Propósito del slug:

URL amigable y memorable
Único en todo el sistema
Editable por el dueño desde admin
Validación: solo minúsculas, números, guiones

Ejemplos:

Nombre: "Complejo Deportivo Norte" → Slug: complejo-norte
Nombre: "Club Atlético San Martín" → Slug: club-san-martin


2. Crear tabla ConfiguracionTema
prismamodel ConfiguracionTema {
  id              String   @id @default(cuid())
  complejoId      String   @unique
  
  // BRANDING BÁSICO
  logoUrl         String?   // URL: https://cdn.tuapp.com/logos/complejo1.png
  faviconUrl      String?   // URL: https://cdn.tuapp.com/favicons/complejo1.ico
  nombreMostrar   String    // "Club Deportivo Norte"
  
  // COLORES (formato HEX)
  colorPrimario   String    @default("#0a0a0a")   // Negro por defecto
  colorSecundario String    @default("#404040")   // Gris oscuro
  colorAccent     String    @default("#22c55e")   // Verde (éxito)
  colorFondo      String    @default("#ffffff")   // Blanco
  
  // TEXTOS PERSONALIZABLES
  textoHeroPrincipal   String?  @db.Text  // "Reservá tu cancha en segundos"
  textoHeroSecundario  String?  @db.Text  // "Fútbol 5, pádel y más deportes"
  textoFooter          String?  @db.Text  // "Abierto de 8 a 23hs"
  textoWhatsApp        String?  @db.Text  // "Hola! Quiero reservar un turno"
  
  // BANNERS (URLs a imágenes, futuro)
  bannerHomeUrl       String?   
  bannerReservaUrl    String?   
  
  // SEO
  metaTitle           String?   // "Complejo Norte - Reservá Online"
  metaDescription     String?   @db.Text
  metaKeywords        String?   // "cancha, fútbol 5, reserva"
  
  // REDES SOCIALES
  facebookUrl     String?
  instagramUrl    String?
  tiktokUrl       String?
  
  // CONFIGURACIÓN AVANZADA (futuro)
  fontFamily      String?   @default("Inter")
  
  complejo        Complejo  @relation(fields: [complejoId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([complejoId])
}
```

**Reglas de negocio:**
- Se crea automáticamente al crear un `Complejo` (con valores default)
- Relación 1:1 (un complejo = un tema)
- Solo DUEÑO y SUPERADMIN pueden editarlo
- Si `logoUrl` es null → usar logo default del sistema

---

## 💾 Sistema de Storage (Archivos)

### Arquitectura Elegida: Storage Local en VPS

**¿Por qué local y no Cloudinary?**
- Control total de los archivos
- Sin costos adicionales (usa disco del VPS)
- Suficiente para 50-100 complejos iniciales
- Migración a S3/Cloudinary es fácil más adelante

### Estructura de Carpetas en VPS
```
/var/www/uploads/
├── logos/
│   ├── complejo1_1234567890.png
│   ├── complejo2_1234567891.jpg
│   └── complejo3_1234567892.webp
│
├── favicons/
│   ├── complejo1_1234567890.ico
│   └── complejo2_1234567891.png
│
└── banners/
    ├── complejo1_home_1234567890.jpg
    └── complejo2_reserva_1234567891.jpg
```

### Flujo de Upload
```
1. Dueño sube logo desde Panel Admin
   ↓
2. Admin → POST /upload/logo (con archivo)
   ↓
3. Backend guarda en /var/www/uploads/logos/
   ↓
4. Backend genera URL: https://cdn.tuapp.com/logos/archivo.png
   ↓
5. Backend actualiza DB: configuracionTema.logoUrl = URL
   ↓
6. Admin muestra preview del logo
   ↓
7. Cliente (Vercel) consume esa URL para mostrar logo
Nginx Config para Servir Uploads
nginxserver {
    listen 80;
    server_name cdn.tuapp.com;
    
    root /var/www/uploads;
    
    location / {
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}
```

### Endpoint de Upload en Backend

**Módulo nuevo:** `UploadModule`

**Endpoints:**
- `POST /upload/logo` - Sube logo
- `POST /upload/favicon` - Sube favicon
- `POST /upload/banner` - Sube banner
- `DELETE /upload/:tipo/:filename` - Elimina archivo

**Validaciones:**
- Solo imágenes (jpg, png, webp, svg)
- Tamaño máximo: 5MB
- Solo DUEÑO y SUPERADMIN
- Verificar ownership del complejo

**Procesamiento con Sharp:**
- Optimización automática (WebP, calidad 80%)
- Resize si es muy grande (max 2000px)
- Eliminar metadatos EXIF

---

## 🎨 Sistema de Theming Dinámico

### ¿Cómo funciona?

**Concepto:** Cada complejo tiene su propia "piel" visual, pero todos usan el mismo código.

### Implementación en Cliente (Next.js)

#### 1. Layout Dinámico por Complejo
```
apps/cliente/src/app/[complejoSlug]/layout.tsx
```

**Responsabilidades:**
- Fetch de `ConfiguracionTema` basado en `slug`
- Generación de CSS variables dinámicas
- Inyección de metadata SEO personalizada
- Carga de logo y favicon personalizados

**Flujo:**
```
1. Usuario visita tuapp.com.ar/complejo-norte
   ↓
2. Next.js extrae params.complejoSlug = "complejo-norte"
   ↓
3. Server Component hace: GET /complejos/slug/complejo-norte
   ↓
4. Backend retorna: { complejo, configuracionTema }
   ↓
5. Layout genera CSS con colores personalizados
   ↓
6. Layout inyecta metadata SEO
   ↓
7. Layout renderiza Header con logo personalizado
   ↓
8. Children (páginas) usan estilos personalizados
2. Generación de CSS Dinámico
Técnica: CSS Variables + Tailwind
css/* Generado dinámicamente por cada complejo */
:root {
  --color-primary: #0a0a0a;      /* Negro */
  --color-secondary: #404040;    /* Gris */
  --color-accent: #22c55e;       /* Verde */
  --color-background: #ffffff;   /* Blanco */
}

/* Clases Tailwind usan las variables */
.bg-primary { background-color: var(--color-primary); }
.text-primary { color: var(--color-primary); }
.border-accent { border-color: var(--color-accent); }
Ventaja: Cambias los colores sin recompilar Tailwind.
3. Componentes con Theming
Todos los componentes usan clases Tailwind que referencian variables:
tsx// Button.tsx
<button className="bg-primary text-white hover:bg-primary/90">
  Reservar
</button>

// Header.tsx
<header className="bg-white border-b border-secondary/20">
  <img src={config.logoUrl} alt={config.nombreMostrar} />
</header>
```

---

## 📱 Aplicación Cliente - Estructura Completa

### Rutas de la Aplicación
```
apps/cliente/src/app/

├── layout.tsx                    # Layout global
├── page.tsx                      # Landing o redirect a admin
│
├── login/
│   └── page.tsx                  # Login (opcional para turnos fijos)
│
├── registro/
│   └── page.tsx                  # Registro (opcional)
│
└── [complejoSlug]/               # 🔥 Rutas dinámicas por complejo
    │
    ├── layout.tsx                # Layout con tema personalizado
    ├── page.tsx                  # Home del complejo
    │
    ├── reservar/
    │   └── page.tsx              # Selector de cancha/fecha/horario
    │
    ├── turno/
    │   └── [turnoId]/
    │       └── page.tsx          # Detalle de turno + pago
    │
    ├── mis-turnos/
    │   └── page.tsx              # Historial (requiere login)
    │
    └── turnos-fijos/
        ├── page.tsx              # Mis turnos fijos (requiere login)
        └── solicitar/
            └── page.tsx          # Formulario nuevo turno fijo
```

---

## 🔄 Flujos de Usuario en Cliente

### Flujo 1: Reserva sin Cuenta (Principal)
```
┌─────────────────────────────────────────────────────────────┐
│             FLUJO DE RESERVA SIN CUENTA                      │
└─────────────────────────────────────────────────────────────┘

PASO 1: Landing del Complejo
URL: tuapp.com.ar/complejo-norte

Elementos visuales:
- Header con logo personalizado
- Hero con textos personalizados
- Banner (si existe)
- Botón CTA: "Reservar Turno"
- Horarios del complejo
- Ubicación (Google Maps)
- Redes sociales (iconos con links)
- Footer personalizado

Datos: Server Side Rendering (SSR) o ISR
API: GET /complejos/slug/complejo-norte
Response: { complejo, configuracionTema, deportes[] }

────────────────────────────────────────────────────────────────

PASO 2: Selector de Reserva
URL: tuapp.com.ar/complejo-norte/reservar

Interfaz:
┌──────────────────────────────────────────────────┐
│  1. Selector de Deporte (tabs o dropdown)       │
│     [Fútbol 5] [Pádel] [Fútbol 11]              │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  2. Selector de Cancha (cards)                   │
│     ┌───────┐  ┌───────┐  ┌───────┐            │
│     │Cancha1│  │Cancha2│  │Cancha3│            │
│     │$3.000 │  │$3.500 │  │$4.000 │            │
│     └───────┘  └───────┘  └───────┘            │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  3. Calendario (fecha)                           │
│     [Hoy] [Mañana] [Calendario completo]         │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  4. Grilla de Horarios                           │
│     08:00 🟢  09:00 🟢  10:00 🔴  11:00 🟢      │
│     12:00 🟢  13:00 🔴  14:00 🟢  15:00 🟢      │
│     (Verde = disponible, Rojo = ocupado)         │
└──────────────────────────────────────────────────┘

Datos: Client Side con React Query
API: GET /turnos/disponibilidad
Params: ?canchaId=xxx&fecha=2024-01-15
Response: { turnos: [...], preciosFecha: {...} }

Refetch automático: Cada 30 segundos

────────────────────────────────────────────────────────────────

PASO 3: Formulario de Datos
(Popup/Modal al seleccionar horario)

┌──────────────────────────────────────────────────┐
│  Reservar: Cancha 1 - Lunes 15/01 - 20:00       │
│  Precio: $3.600                                  │
│                                                  │
│  Nombre:     [_____________]                     │
│  Apellido:   [_____________]                     │
│  Teléfono:   [_____________] (obligatorio)       │
│  DNI:        [_____________] (opcional)          │
│                                                  │
│  [Cancelar]  [Reservar]                         │
└──────────────────────────────────────────────────┘

Validaciones:
- Teléfono: formato válido
- Anti-bot: máx 5 reservas en 10min por teléfono
- Límite: máx 3 turnos activos por teléfono

API: POST /turnos/reservar
Body: {
  turnoId: "turno_123",
  nombreCliente: "Juan",
  apellidoCliente: "Pérez",
  telefonoCliente: "123456789",
  dni: "12345678"
}

────────────────────────────────────────────────────────────────

PASO 4: Pantalla de Pago
URL: tuapp.com.ar/complejo-norte/turno/turno_123

Si complejo.requiereSeña = TRUE:

┌──────────────────────────────────────────────────┐
│  ✅ Turno Reservado                              │
│                                                  │
│  Estado: Pendiente de Seña                      │
│  Tiempo límite: ⏱️ 28 minutos restantes          │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  📋 Datos de Transferencia                       │
│                                                  │
│  CBU:     1234567890123456789012                 │
│  Alias:   complejo.norte                         │
│  Titular: Juan Pérez                             │
│                                                  │
│  💰 Monto a transferir: $1.800                   │
│     (50% de $3.600)                              │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  📱 Enviar comprobante:                          │
│                                                  │
│  [📲 Enviar por WhatsApp]  ← Pre-cargado        │
│                                                  │
│  Mensaje pre-cargado:                            │
│  "Hola! Envío comprobante de mi reserva         │
│   Turno: #turno_123                              │
│   Cancha 1 - Lunes 15/01 - 20:00                │
│   Monto: $1.800"                                 │
│                                                  │
└──────────────────────────────────────────────────┘

Si complejo.requiereSeña = FALSE:

┌──────────────────────────────────────────────────┐
│  ✅ Turno Confirmado                             │
│                                                  │
│  Tu turno está confirmado.                       │
│  No requiere pago adelantado.                    │
│                                                  │
│  Recordá:                                        │
│  - Llegá 10 minutos antes                        │
│  - Pagás en el complejo: $3.600                  │
│                                                  │
│  [Ver mis turnos]                                │
└──────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────

PASO 5: Confirmar Envío de Comprobante
(Usuario vuelve después de enviar por WhatsApp)

Botón en pantalla de pago:
[✓ Ya envié el comprobante]

API: POST /pagos/enviar-comprobante
Body: {
  turnoId: "turno_123",
  metodo: "TRANSFERENCIA",
  monto: 1800
}

Resultado:
- Pago.estado → ENVIADO
- Turno.estado → SENA_ENVIADA

Nueva pantalla:

┌──────────────────────────────────────────────────┐
│  ⏳ Comprobante Enviado                          │
│                                                  │
│  Estamos validando tu pago.                      │
│  Te contactaremos por WhatsApp para confirmar.   │
│                                                  │
│  Estado: En validación                           │
│                                                  │
│  📱 Te escribiremos al: 123456789                │
│                                                  │
│  [Ver mis turnos]                                │
└──────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────

PASO 6: Dueño Valida (desde Panel Admin)
Admin ve notificación → valida comprobante

Si APRUEBA:
- Pago.estado → APROBADO
- Turno.estado → CONFIRMADO

Si RECHAZA:
- Pago.estado → RECHAZADO
- Turno.estado → DISPONIBLE (vuelve a estar libre)

Cliente puede consultar estado:
API: GET /pagos/turno/turno_123
Response: { estado: "APROBADO", fechaValidacion: "..." }

────────────────────────────────────────────────────────────────

PASO 7: Confirmación Final (opcional)
Email/SMS al cliente (futuro):
"Tu turno está confirmado. Te esperamos el Lunes 15/01 a las 20:00"
```

---

### Flujo 2: Turnos Fijos (Requiere Cuenta)
```
┌─────────────────────────────────────────────────────────────┐
│             FLUJO DE TURNO FIJO (CON CUENTA)                 │
└─────────────────────────────────────────────────────────────┘

PASO 1: Usuario debe registrarse/loguearse
URL: tuapp.com.ar/login

Formulario:
- Teléfono (identificador principal)
- Password

API: POST /auth/login
Body: { identifier: "123456789", password: "***" }
Response: Cookie JWT + { usuario }

────────────────────────────────────────────────────────────────

PASO 2: Solicitar Turno Fijo
URL: tuapp.com.ar/complejo-norte/turnos-fijos/solicitar

┌──────────────────────────────────────────────────┐
│  Solicitar Turno Fijo Recurrente                 │
│                                                  │
│  Cancha:      [▼ Cancha 1 - Fútbol 5]           │
│  Día:         [▼ Martes]                         │
│  Horario:     [▼ 20:00]                          │
│  Duración:    [▼ 60 minutos]                     │
│                                                  │
│  Desde:       [15/01/2024]                       │
│  Hasta:       [∞ Indefinido] o [fecha]           │
│                                                  │
│  ¿Requiere seña semanal?                         │
│  ○ Sí, debo pagar cada semana                    │
│  ● No, pago en el momento                        │
│                                                  │
│  [Cancelar]  [Solicitar]                         │
└──────────────────────────────────────────────────┘

Validaciones:
- Solo si complejo.permiteTurnosFijos = true
- Verificar que no haya conflicto en ese horario
- Usuario debe estar autenticado

API: POST /turnos-fijos
Body: {
  canchaId: "cancha_1",
  diaSemana: 2,
  horaInicio: "20:00",
  duracion: 60,
  requiereSeña: true,
  fechaInicio: "2024-01-15"
}

Response: { turnoFijo, proximosTurnos: [...] }

────────────────────────────────────────────────────────────────

PASO 3: CRON Genera Turnos Automáticamente
(Todos los días a las 2:00 AM)

Sistema busca todos los TurnoFijo activos
Para cada uno:
- Genera turnos hasta 30 días adelante
- Solo días que coincidan con diaSemana
- Si requiereSeña: estado RESERVADO
- Si NO requiereSeña: estado CONFIRMADO

Ejemplo:
TurnoFijo: Martes 20:00
Genera:
- 16/01/2024 20:00 (Martes) → RESERVADO
- 23/01/2024 20:00 (Martes) → RESERVADO
- 30/01/2024 20:00 (Martes) → RESERVADO
- 06/02/2024 20:00 (Martes) → RESERVADO

────────────────────────────────────────────────────────────────

PASO 4: Cliente Paga Seña Semanal (si requiere)
URL: tuapp.com.ar/complejo-norte/mis-turnos

┌──────────────────────────────────────────────────┐
│  Mis Próximos Turnos                             │
│                                                  │
│  ⚠️ Pendiente de pago:                           │
│  Martes 16/01 - 20:00 - Cancha 1                │
│  Vence: ⏱️ 22 horas restantes                     │
│  [💰 Pagar seña $1.800]                          │
│                                                  │
│  ✅ Confirmados:                                 │
│  Martes 09/01 - 20:00 - Cancha 1                │
│  (Pagado)                                        │
└──────────────────────────────────────────────────┘

Mismo flujo de pago que reserva normal:
- Datos bancarios
- WhatsApp
- Validación manual

────────────────────────────────────────────────────────────────

PASO 5: Gestionar Turno Fijo
URL: tuapp.com.ar/complejo-norte/turnos-fijos

┌──────────────────────────────────────────────────┐
│  Mis Turnos Fijos                                │
│                                                  │
│  🟢 Activo                                       │
│  Martes a las 20:00 - Cancha 1                   │
│  Desde: 15/01/2024                               │
│                                                  │
│  Próximos turnos:                                │
│  • 16/01 - Confirmado                            │
│  • 23/01 - Pendiente pago                        │
│  • 30/01 - Pendiente pago                        │
│                                                  │
│  [⏸️ Pausar]  [❌ Cancelar]                      │
└──────────────────────────────────────────────────┘

Acciones:
- Pausar: TurnoFijo.activo = false (no genera más)
- Cancelar: Elimina TurnoFijo + turnos futuros
- Cancelar individual: Solo ese turno, resto sigue

🛠️ Componentes Principales de Cliente
1. Layout Components
Header.tsx

Logo personalizado
Nombre del complejo
Botón "Reservar"
(Opcional) Login/Registro

Footer.tsx

Texto personalizado
Horarios
Redes sociales
Copyright

ThemeProvider.tsx

Context con configuración de tema
Disponible en toda la app


2. Reserva Components
DeporteSelector.tsx

Tabs o cards con deportes del complejo
Iconos personalizados

CanchaSelector.tsx

Grid de cards con canchas
Info: nombre, precio, descripción
Indicador de disponibilidad

CalendarioTurnos.tsx

Selector de fecha
Vista día/semana
Indicadores de ocupación

GrillaHorarios.tsx

Slots de tiempo clickeables
Estados visuales (disponible/ocupado/
Continue20:45seleccionado)

Precios dinámicos por día

FormularioReserva.tsx

Inputs: nombre, apellido, teléfono, DNI
Validación en tiempo real
Manejo de errores


3. Pago Components
DatosTransferencia.tsx

Display de CBU/Alias/Titular
Botón copiar CBU
Monto a transferir destacado

WhatsAppButton.tsx

Link pre-cargado con mensaje
Abre WhatsApp Web o app según dispositivo

EstadoPago.tsx

Indicadores visuales de estado
Timer de expiración
Mensajes contextuales

TimerExpiracion.tsx

Countdown en tiempo real
Alertas cuando quedan 5 minutos


4. Turnos Fijos Components
TurnoFijoCard.tsx

Info del turno fijo
Estado (activo/pausado)
Próximos turnos generados
Acciones (pausar/cancelar)

FormularioTurnoFijo.tsx

Selector de cancha/día/horario
Checkbox requiere seña
Validación de conflictos


5. UI Base Components
Button.tsx

Variants: primary, secondary, danger
Loading state
Disabled state
Usa colores del tema

Card.tsx

Container estándar
Header/Body/Footer
Elevación sutil

Badge.tsx

Estados de turno
Colores semánticos
Tamaños (sm, md, lg)

Modal.tsx

Overlay
Cerrar con ESC o click afuera
Sizes configurables

LoadingSpinner.tsx

Spinner con color del tema
Tamaños (sm, md, lg)

EmptyState.tsx

Mensaje cuando no hay datos
Icono + texto + acción opcional


📡 API Endpoints para Cliente
Públicos (sin autenticación)
GET  /complejos/slug/:slug
     → Obtener complejo por slug
     Response: { complejo, configuracionTema, deportes[] }

GET  /canchas/complejo/:complejoId
     → Listar canchas del complejo
     Response: { canchas: [...] }

GET  /turnos/disponibilidad
     Query: ?canchaId=xxx&fecha=2024-01-15
     → Ver turnos disponibles
     Response: { turnos: [...], precios: {...} }

POST /turnos/reservar
     Body: { turnoId, nombreCliente, apellidoCliente, telefonoCliente, dni }
     → Reservar turno sin cuenta
     Response: { turno, requiereSeña, montoSeña, datosBancarios }

POST /pagos/enviar-comprobante
     Body: { turnoId, metodo, monto }
     → Registrar envío de comprobante
     Response: { pago, turno }

GET  /pagos/turno/:turnoId
     → Consultar estado de pago
     Response: { pago: { estado, fechaValidacion } }

POST /turnos/:id/cancelar-publico
     Body: { telefono, dni }
     → Cancelar turno sin cuenta (validando datos)
     Response: { turno }
Privados (requieren autenticación)
POST /auth/login
     Body: { identifier, password }
     → Login
     Response: Cookie JWT + { usuario }

POST /auth/register
     Body: { telefono, nombre, apellido, password }
     → Registro
     Response: Cookie JWT + { usuario }

GET  /auth/profile
     → Ver mi perfil
     Response: { usuario }

POST /auth/logout
     → Cerrar sesión
     Response: { success: true }

GET  /turnos/mis-turnos
     → Ver mis turnos (con y sin cuenta)
     Query: ?telefono=xxx (si no está autenticado)
     Response: { turnos: [...] }

POST /turnos-fijos
     Body: { canchaId, diaSemana, horaInicio, duracion, requiereSeña }
     → Crear turno fijo
     Response: { turnoFijo, proximosTurnos: [...] }

GET  /turnos-fijos/mis-turnos-fijos
     → Ver mis turnos fijos
     Response: { turnosFijos: [...] }

PATCH /turnos-fijos/:id/pausar
     → Pausar turno fijo
     Response: { turnoFijo }

PATCH /turnos-fijos/:id/reactivar
     → Reactivar turno fijo
     Response: { turnoFijo }

DELETE /turnos-fijos/:id
     → Cancelar turno fijo
     Response: { success: true }

POST /turnos/:id/cancelar-individual
     → Cancelar un turno de turno fijo
     Response: { turno }

🎨 Panel de Personalización en Admin
Nueva Sección: /complejo/[id]/personalizacion
Permisos: Solo DUEÑO y SUPERADMIN
Tabs/Secciones:
1. Branding

Upload logo (PNG, SVG, max 5MB)
Upload favicon (ICO, PNG)
Nombre a mostrar (input text)
Preview en vivo

2. Colores

Color primario (color picker)
Color secundario
Color acento
Color fondo
Preview de componentes con colores aplicados

3. Textos

Texto hero principal (textarea, max 100 chars)
Texto hero secundario (textarea, max 200 chars)
Texto footer (textarea, max 500 chars)
Mensaje WhatsApp pre-cargado (textarea, max 300 chars)

4. Banners (Futuro)

Upload banner home
Upload banner reserva
Preview

5. SEO

Meta title (input, max 60 chars)
Meta description (textarea, max 160 chars)
Keywords (tags input)

6. Redes Sociales

URL Facebook
URL Instagram
URL TikTok
Validación de URLs

7. Vista Previa

Iframe o link a /[slug] con tema aplicado
"Ver como usuario final"


🚀 Plan de Implementación por Fases
FASE 1: Setup y Base de Datos (Semana 1)
Tareas Backend:

✅ Crear migración para agregar slug a Complejo
✅ Crear migración para tabla ConfiguracionTema
✅ Modificar ComplejoService.create() para generar tema default
✅ Script de migración para complejos existentes
✅ Seed con 2-3 complejos de prueba con slugs

Tareas Código:

✅ Actualizar Prisma schema
✅ Generar Prisma client
✅ Run migrations


FASE 2: Backend - Upload y Endpoints (Semana 1-2)
Nuevos Módulos:

✅ UploadModule

Controller con endpoints de upload
Validaciones de archivos
Procesamiento con Sharp
Guardado en /var/www/uploads


✅ Modificar ComplejosController

GET /complejos/slug/:slug (público)
Response incluye configuracionTema


✅ Nuevo ConfiguracionTemaController

GET /configuracion-tema/:complejoId
PATCH /configuracion-tema/:complejoId
Guards: solo DUEÑO del complejo o SUPERADMIN



Testing:

✅ Subir logo vía Postman
✅ Verificar archivo en /var/www/uploads/logos
✅ Verificar URL guardada en DB
✅ Verificar que Nginx sirve el archivo


FASE 3: Admin - Panel de Personalización (Semana 2)
Nueva Página:
apps/admin/src/app/complejo/[id]/personalizacion/page.tsx
Componentes:

✅ LogoUpload.tsx - Upload con preview
✅ ColorPicker.tsx - Selector de colores
✅ TextEditor.tsx - Inputs de texto
✅ PreviewButton.tsx - Link a vista de cliente

Hooks:

✅ useConfiguracionTema.ts

Query: fetch config
Mutations: update config, upload files



Features:

✅ Auto-save (debounce 1 segundo)
✅ Preview en vivo de colores
✅ Validaciones de campos
✅ Loading states
✅ Success/Error messages


FASE 4: Cliente - Estructura Base (Semana 3)
Setup Inicial:

✅ Crear apps/cliente/ con Next.js 14
✅ Configurar Tailwind CSS
✅ Configurar Axios + React Query
✅ Configurar Zustand (estado global)

Estructura de Carpetas:
apps/cliente/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [complejoSlug]/
│   │       ├── layout.tsx          # 🔥 Theming aquí
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── reserva/
│   │   ├── pago/
│   │   └── ui/
│   │
│   ├── hooks/
│   ├── stores/
│   ├── lib/
│   └── types/
Implementar:

✅ [complejoSlug]/layout.tsx - Theming dinámico
✅ Hook useComplejo(slug) - Fetch complejo + tema
✅ Sistema de CSS variables
✅ Componentes UI base (Button, Card, Badge, etc.)


FASE 5: Cliente - Landing y Home (Semana 3)
Página: [complejoSlug]/page.tsx
Secciones:

✅ Hero

Banner personalizado (si existe)
Textos personalizados
CTA destacado "Reservar Turno"


✅ Deportes y Canchas

Cards con deportes disponibles
Listado de canchas
Precios base


✅ Información

Horarios
Ubicación (Google Maps embed)
Teléfono/WhatsApp


✅ Footer

Texto personalizado
Redes sociales
Copyright



Data Fetching:

SSR o ISR (revalidate: 3600)
GET /complejos/slug/:slug


FASE 6: Cliente - Flujo de Reserva (Semana 4)
Páginas:

✅ /[complejoSlug]/reservar

Selector de deporte
Selector de cancha
Calendario
Grilla de horarios


✅ Formulario de datos (Modal)

Inputs: nombre, apellido, teléfono, DNI
Validaciones
Anti-bot checks


✅ /[complejoSlug]/turno/[turnoId]

Estado de reserva
Datos de transferencia (si requiere seña)
Botón WhatsApp
Timer de expiración
Estado de pago



Hooks:

✅ useDisponibilidad(canchaId, fecha)
✅ useReservar()
✅ usePago(turnoId)

Store:

✅ reservaStore (Zustand)

Cancha seleccionada
Fecha seleccionada
Turno seleccionado
Datos del formulario




FASE 7: Cliente - Turnos Fijos (Semana 5)
Prerequisito: Autenticación

✅ /login y /registro
✅ authStore (Zustand)
✅ ProtectedRoute component

Páginas:

✅ /[complejoSlug]/turnos-fijos

Listado de mis turnos fijos
Estados y próximos turnos
Acciones (pausar, cancelar)


✅ /[complejoSlug]/turnos-fijos/solicitar

Formulario completo
Validaciones de conflictos


✅ /[complejoSlug]/mis-turnos

Historial de todos los turnos
Estados y filtros



Hooks:

✅ useTurnosFijos()
✅ useMisTurnos()


FASE 8: Optimizaciones y Polish (Semana 6)
Performance:

✅ Image optimization (next/image)
✅ Code splitting
✅ Lazy loading de componentes pesados
✅ Prefetching de rutas

UX:

✅ Loading skeletons
✅ Error boundaries
✅ Toast notifications
✅ Animaciones suaves (Framer Motion opcional)

SEO:

✅ Sitemap dinámico por complejo
✅ robots.txt
✅ Structured data (JSON-LD)
✅ Open Graph tags

PWA (Opcional):

✅ Service Worker
✅ Manifest.json dinámico
✅ Installable app
✅ Offline fallback


FASE 9: Testing y Deploy (Semana 7)
Testing:

✅ E2E con Playwright o Cypress

Flujo completo de reserva
Flujo de turno fijo
Navegación entre complejos


✅ Testing manual:

3 complejos con temas diferentes
Reservas simultáneas
Anti-bot



Deploy VPS (Hetzner):

✅ Setup Nginx
✅ SSL con Let's Encrypt (Certbot)
✅ PM2 para procesos
✅ PostgreSQL en VPS
✅ Backups automáticos

Deploy Cliente (Vercel):

✅ Conectar repo
✅ Variables de entorno
✅ Deploy automático en push


🔐 Consideraciones de Seguridad
Rate Limiting

✅ Anti-bot en reservas (ya implementado)
✅ Rate limit en uploads (max 10 archivos/hora por usuario)
✅ Rate limit en login (max 5 intentos/15min)

Validaciones

✅ Tamaño de archivos (max 5MB)
✅ Tipos de archivo (solo imágenes)
✅ Sanitización de inputs
✅ SQL injection (Prisma previene)
✅ XSS (React escapa por defecto)

CORS

✅ Solo dominios permitidos
✅ Credentials: true para cookies

Headers de Seguridad
nginxadd_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";

📊 Métricas y Monitoreo
Backend (VPS):

✅ Logs con Winston o Pino
✅ PM2 monitoring
✅ Uptime checks (UptimeRobot gratis)

Cliente (Vercel):

✅ Vercel Analytics (gratis)
✅ Web Vitals tracking
✅ Error tracking (Sentry opcional)

Base de Datos:

✅ Query performance con Prisma
✅ Índices en campos frecuentes
✅ Backups diarios


🎓 Guías de Uso
Para IAs que continúen el proyecto:
Al implementar un componente:

Verificar qué theme variables necesita
Usar hooks compartidos (useComplejo, useReserva)
Seguir convenciones de nombres
Agregar tipos TypeScript
Manejar loading y error states

Al agregar un endpoint:

Definir DTO con validaciones
Implementar en controller
Lógica en service
Guards si es privado
Documentar en este README

Al modificar theming:

Agregar campo en ConfiguracionTema
Actualizar generateThemeCSS()
Agregar input en panel de personalización
Probar con 2-3 complejos diferentes


🚨 Troubleshooting Común
"No puedo subir archivos"

✅ Verificar permisos de /var/www/uploads
✅ Verificar tamaño máximo en Nginx
✅ Verificar que Multer esté configurado

"El tema no se aplica"

✅ Verificar que ConfiguracionTema existe en DB
✅ Check console del navegador (CSS variables)
✅ Verificar que el layout carga el tema

"CORS errors"

✅ Verificar withCredentials: true en axios
✅ Verificar CORS config en backend
✅ Verificar que el dominio está permitido

"Turnos no se generan"

✅ Verificar CRON job esté corriendo
✅ Verificar ConfiguracionHorarioCancha activas
✅ Check logs del CRON


📞 Contacto y Próximos Pasos
Estado actual: Backend y Admin completos, Cliente a implementar
Siguiente milestone: FASE 1 - Setup de DB y migraciones
Documentos relacionados:

Documentación Backend (completa)
Documentación Admin (completa)
Documentación Cliente (este documento)


Versión: 1.0
Fecha: Diciembre 2024
Última actualización: [Fecha]