# Roadmap — Miami Auto-Key ERP

Estado del MVP de producción y prioridades siguientes. Cada etapa está pensada
para entregarse de forma independiente sin romper la operación en campo.

## ✅ MVP (en producción)

- [x] Registro de clientes con validación y fichas técnicas por vehículo
- [x] Inventario con alertas de stock, escáner y órdenes de proveedor
- [x] Diagnóstico asistido por Gemini (proxy serverless, fallback manual)
- [x] Cobros: efectivo / Zelle (registro directo) y tarjeta vía Stripe Checkout
- [x] Historial con búsqueda, CSV, tickets 80mm y WhatsApp
- [x] Respaldo/restauración JSON completa + compresión de fotos
- [x] Analíticas calculadas del historial real
- [x] CI (lint + tests + build) y despliegue en Vercel

## 1. Migración a Supabase (máxima prioridad post-MVP)

**Problema que resuelve**: hoy los datos viven en localStorage de un solo
dispositivo; limpiar el navegador o cambiar de teléfono los pierde (mitigado
con respaldos manuales).

- Auth (email/contraseña) con rol de técnico único para empezar.
- Postgres: tablas `clients`, `inventory_items`, `service_records`, `payments`.
- Sincronización en tiempo real entre dispositivos (Supabase Realtime).
- Fotos de servicio en Storage (bucket privado) en vez de base64 en localStorage.
- Importador del JSON de respaldo actual para migrar datos históricos.

## 2. Robustez de pagos

- Webhook `checkout.session.completed` para registrar pagos aunque el cliente
  cierre el navegador antes de volver del redirect.
- Recibos por email automáticos de Stripe.
- Reembolsos parciales/totales desde la app.

## 3. PWA / uso en campo

- Manifest + service worker: instalable en la pantalla de inicio del teléfono.
- Modo offline con cola de sincronización (crítico en sótanos y parkings sin señal).

## 4. Impresión térmica real

- CSS `@media print` dedicado para el ticket de 80mm (hoy usa `window.print()` genérico).
- Soporte de impresoras Bluetooth térmicas (ESC/POS) vía Web Bluetooth.

## 5. Multi-técnico y despacho

- Cuentas múltiples con roles (admin / técnico).
- Asignación de servicios y estado del técnico en mapa.

## 6. Extras de operación

- Notificaciones al cliente por WhatsApp (plantillas de ETA y ticket).
- Fotos por ítem de inventario e impresión de etiquetas con código de barras.
- Catálogo ampliado de fichas técnicas (más marcas/años) editable desde la UI.
