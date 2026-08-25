# Miami Auto-Key ERP — MVP de Producción

ERP web móvil (español) para **cerrajeros automotrices y mecánicos móviles** en Miami: registro de clientes en calle, inventario de llaves/transponders, diagnóstico asistido por IA, cobros y historial de servicios.

> **Alcance**: este sistema gestiona **llaves físicas de automóviles** (blanks transponder, fobs, espadas láser, herramientas Lishi), NO claves de software.

## Funcionalidad (MVP en producción)

1. **Registro de clientes en sitio** con validación de nombre/apellido/vehículo/teléfono, **catálogo de ~40 fichas técnicas** (Toyota, Honda, Nissan, Ford, Chevrolet, Hyundai, Kia, Jeep, Dodge, Ram, VW, Mazda, Mitsubishi, GMC, Buick) y geocodificación en vivo (OpenStreetMap/Nominatim) con distancias, ETA y enlaces a Google Maps / Waze / WhatsApp.
2. **Inventario físico**: alta/venta de ítems **con foto identificable por pieza**, alertas de stock bajo (<3), escáner de código de barras (buscar ítem o agregarlo al servicio) y generador de órdenes de reposición a proveedor (WhatsApp / portapapeles). **Piezas usadas en el servicio**: se descuentan del stock al cobrar y quedan listadas en el ticket e historial.
3. **Diagnóstico asistido por IA (Gemini)**: botón "Generar con IA" que envía el contexto del servicio (vehículo, falla, notas del técnico y foto opcional) a `POST /api/gemini` — proxy serverless que mantiene la clave API fuera del navegador. El resultado es **editable** y siempre se puede escribir manualmente si la IA no está configurada.
4. **Consulta IA (chat multi-turno)**: botón flotante en todas las vistas para resolver dudas técnicas en campo (ubicación OBD2, herramienta Lishi, chips) con contexto de conversación y foto opcional.
5. **Cobros reales**: modal de cobro con monto editable y tres métodos:
   - **Efectivo** y **Zelle**: registro directo.
   - **Tarjeta**: Stripe Checkout real (redirección + verificación del pago del lado del servidor al volver). Queda deshabilitado con mensaje claro si `STRIPE_SECRET_KEY` no está configurada.
6. **Historial y tickets**: búsqueda, exportación CSV (incluye piezas usadas), respaldo/restauración JSON completa, ticket imprimible de 80mm y resumen por WhatsApp. **Modo demo** con datos de prueba para explorar todos los flujos.
7. **Analíticas reales**: gráficos y KPIs (servicios, ingresos, ticket promedio, categoría top) calculados desde el historial real — sin datos falsos.
8. **Voz manos libres** (Web Speech API, es-US): navegación, acciones rápidas y fichas por marca ("toyota", "ford", "vw"...).

## Persistencia y respaldo (importante)

El MVP guarda todo en **localStorage del navegador** (por dispositivo/origen). Para no perder datos de negocio:

- Botón **"Respaldar Todo"** (Historial) exporta un JSON con clientes + inventario + historial + ganancias.
- **"Restaurar"** reimporta un respaldo con validación y confirmación.
- Las fotos se comprimen automáticamente (~900px JPEG) para no agotar la cuota de localStorage, y si una escritura falla aparece un aviso con botón de descarga inmediata del respaldo.

Migración a base de datos en la nube (Supabase/Postgres) = siguiente etapa del roadmap (`ROADMAP.md`).

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000 (solo frontend; /api/* requiere Vercel)
```

```bash
npm run lint       # typecheck (tsc --noEmit)
npm test           # suite Vitest (40 tests de lógica de dominio)
npm run build      # build de producción a dist/
```

Para probar las funciones serverless localmente: `vercel dev`.

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Requerida | Descripción |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | No | Clave de Google AI Studio. Sin ella, el diagnóstico se escribe manualmente. |
| `STRIPE_SECRET_KEY` | No | Clave secreta de Stripe (`sk_live_...`). Sin ella, solo cobros en efectivo/Zelle. |
| `GEMINI_MODEL` | No | Modelo a usar (por defecto `gemini-2.5-flash`). |
| `APP_URL` | No | URL pública para los retornos de Stripe; se deduce automáticamente si se omite. |

## API serverless (`api/`)

| Endpoint | Método | Función |
| :--- | :--- | :--- |
| `/api/gemini` | POST | Proxy a Gemini (texto + imagen opcional). Rate limit por IP. |
| `/api/stripe/config` | GET | Indica si los pagos con tarjeta están activos. |
| `/api/stripe/create-session` | POST | Crea una Checkout Session (monto en centavos). |
| `/api/stripe/verify` | POST | Verifica server-side el estado de una sesión (`paid`). |

## Despliegue (Vercel)

1. Importe el repo en Vercel (o use `vercel` CLI). Framework: Vite, detectado automáticamente por `vercel.json`.
2. Configure las variables de entorno opcionales de la tabla anterior.
3. `vercel --prod`.

## Seguridad

- Las claves API viven solo en el servidor (`api/`); el cliente nunca las ve.
- `.gitignore` bloquea `.env*`; validación de entrada y límites de tamaño en todos los endpoints; rate limit básico por IP; cabeceras de seguridad en `vercel.json`.
- La verificación de pago de Stripe se hace **del lado del servidor**.

## Estructura del código

```
src/
  App.tsx              # UI principal (React 19, Tailwind 4)
  data/presets.ts      # Fichas técnicas de 8 vehículos
  lib/
    types.ts           # Entidades (Client, InventoryItem, DiagnosticRecord...)
    domain.ts          # Validaciones, ventas/reposición, CSV, analíticas, IDs
    storage.ts         # localStorage con validación y reporte de fallos
    gemini.ts          # Cliente del proxy /api/gemini + prompt de diagnóstico
    stripe.ts          # Cliente de pagos / verificación de retorno
    backup.ts          # Respaldo/restauración JSON (envelope versionado)
    image.ts           # Compresión de fotos antes de persistir
    *.test.ts          # 40 tests Vitest de la lógica real
api/                   # Funciones serverless (Gemini + Stripe)
```

## Licencia

MIT. Ver `ROADMAP.md` para las próximas etapas (Supabase, webhooks de Stripe, PWA offline...).
