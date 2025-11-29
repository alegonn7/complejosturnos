📘 Sistema de Gestión de Turnos para Canchas

Plataforma para reservar turnos de canchas (fútbol, pádel y otros deportes), con administración completa para dueños de complejos, manejo de señas por transferencia y panel de estadísticas.

📑 Tabla de Contenidos

Descripción General

Arquitectura del Sistema

Flujo Completo de Reserva

Diagrama de Estados – Turnos

Diagrama de Estados – Canchas

User Stories (Historias de Usuario)

PlantUML

Futuras Mejoras

Licencia

🏟️ Descripción General

El sistema permite:

Reservar turnos sin registración.

Administrar canchas, deportes y horarios.

Manejar señas mediante transferencia bancaria con envío de comprobante por WhatsApp.

Confirmación manual de pago por parte del dueño o empleados.

Manejo del estado de las canchas (habilitada, deshabilitada, mantenimiento).

Sistema de turnos fijos (opcional con cuenta o sin cuenta).

Panel de estadísticas del complejo.

Multi-complejo: un superadmin puede administrar múltiples complejos.

Incluye dos frontends:

Cliente: para reservar turnos.

Administrador: para dueños y empleados.

🏗️ Arquitectura del Sistema

Backend

API REST (o GraphQL si se prefiere).

Manejo de usuarios, complejos, canchas, turnos y estadísticas.

Notificaciones por WhatsApp.

Lógica de estados de turnos y canchas.

Frontend Cliente

Selección de complejo → deporte → cancha → turno.

Reserva sin cuenta.

Pantalla de datos de transferencia.

Redirección a WhatsApp para enviar comprobante.

Frontend Admin

Calendario de turnos en tiempo real.

Gestión de canchas, horarios y deportes.

Confirmación manual de pagos.

Panel de estadísticas.

Manejo de turnos fijos.

Administración multi-complejo.

🔄 Flujo Completo de Reserva

El usuario selecciona una cancha y un horario disponible.

El turno cambia a Reservado (Pendiente de Seña).

El sistema muestra:

datos de la transferencia

botón "Enviar comprobante por WhatsApp"

El usuario realiza la transferencia y envía el comprobante.

El dueño revisa manualmente el comprobante.

Si está correcto → el turno pasa a Confirmado.

Si no corresponde → el turno pasa a Cancelado.

Si pasa el tiempo límite sin pago → el turno vuelve a Disponible (estado Expirado).

⏱️ Diagrama de Estados – Turnos
Estados

Disponible

Reservado (Pendiente de Seña)

Seña Enviada

Confirmado

Cancelado

Expirado

Reglas

Si la cancha se deshabilita, turnos no confirmados → Cancelado automático.

Los confirmados requieren acción manual del dueño.

🚧 Diagrama de Estados – Canchas
Estados

Habilitada

Deshabilitada

En Mantenimiento

Reglas

Una cancha deshabilitada no puede recibir reservas.

Los turnos afectados deben reubicarse o cancelarse según el caso.

🧩 User Stories (Historias de Usuario)
Cliente

Como cliente, quiero reservar un turno sin crear una cuenta, para no perder tiempo.

Como cliente, quiero ver los horarios disponibles en tiempo real para poder elegir rápido.

Como cliente, quiero recibir los datos de transferencia y enviar el comprobante por WhatsApp.

Como cliente, quiero que mi turno quede confirmado luego de que validen mi pago.

Como cliente, quiero poder reservar un turno fijo si el complejo lo permite.

Administrador / Dueño

Como dueño, quiero ver un calendario con todos los turnos para entender la ocupación.

Como dueño, quiero confirmar o rechazar comprobantes de pago.

Como dueño, quiero activar o desactivar el sistema de señas.

Como dueño, quiero crear canchas y deportes.

Como dueño, quiero deshabilitar una cancha temporalmente.

Como dueño, quiero marcar un turno como “ausente” si el equipo no se presenta.

Como dueño, quiero ver estadísticas sobre reservas, ausencias y horarios más usados.

Superadmin

Como superadmin, quiero crear múltiples complejos.

Como superadmin, quiero administrar todos los datos sin restricciones.

Como superadmin, quiero dar permisos a empleados o dueños.

📊 PlantUML
Turnos
@startuml
[*] --> Disponible

Disponible --> Reservado : Cliente reserva

Reservado --> SeneaEnviada : Envía comprobante
Reservado --> Expirado : Tiempo límite

SeneaEnviada --> Confirmado : Dueño valida
SeneaEnviada --> Cancelado : Pago no válido

Confirmado --> Cancelado : Cancelación manual

@enduml

Canchas
@startuml
[*] --> Habilitada

Habilitada --> Deshabilitada
Deshabilitada --> Habilitada

Deshabilitada --> EnMantenimiento
EnMantenimiento --> Deshabilitada
EnMantenimiento --> Habilitada

@enduml

🚀 Futuras Mejoras

Integración con WhatsApp Business API para recibir comprobantes directamente.

Pago automático con Mercado Pago / Stripe.

Notificaciones push / email.

Motor de recomendaciones de horarios.

Doble autenticación para administradores.

📄 Licencia

MIT License — libre para usar, modificar y distribuir.

Si querés, te genero también:

✅ logo y branding
✅ estructura de carpetas del repo
✅ documentación técnica de API (OpenAPI/Swagger)
✅ wireframes del flujo de reserva
