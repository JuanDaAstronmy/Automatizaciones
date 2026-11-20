# ¿Qué herramienta usar para WhatsApp? (análisis, noviembre 2026)

**Objetivo:** contactar ~94 leads de los Ads (y los que sigan llegando), responderles, que agenden, y que el equipo haga el mínimo trabajo posible, sin poner en riesgo el número de AIESEC.

## Opciones evaluadas

| # | Opción | Cómo funciona | Costo | Trabajo por lead | Riesgo | Veredicto |
|---|---|---|---|---|---|---|
| 0 | **Claude conectado directo a WhatsApp** | No hay un conector oficial de WhatsApp disponible. Los que existen en el directorio de conectores (Bird, Sent, etc.) son plataformas de pago que por debajo igual usan la API de Meta. | — | — | — | ❌ No disponible de forma directa |
| 1 | **WhatsApp Business (app) + panel de 1 toque** | El panel abre WhatsApp con el mensaje ya escrito (nombre + link personal); la persona solo toca *Enviar*. | **Gratis** | ~10 s | Bajo (envío humano, mensajes personalizados, leads que dieron sus datos) | ✅ **Recomendado para arrancar** |
| 2 | **WhatsApp Cloud API (Meta, directo)** | El sistema envía una plantilla aprobada a todos los pendientes de una vez, y a los nuevos cada hora. | ~USD 0,014 por invitación de marketing en Colombia (≈ USD 1,4 por 94) | 0 s | Bajo (es la vía oficial) | ✅ **Nivel 2, ya programado** (ver [whatsapp-api.md](whatsapp-api.md)) |
| 3 | **Proveedor con bandeja de entrada (WATI, SleekFlow, 360dialog, Respond.io, ManyChat, Kommo…)** | Misma API de Meta + bandeja compartida, chatbots con botones y "coexistencia" (el número sigue funcionando en la app). | Mensualidad del proveedor + tarifas de Meta | 0 s | Bajo | 🟡 Cuando el volumen crezca mucho (cientos por semana) |
| 4 | **Bots no oficiales** (whatsapp-web.js, extensiones de "envío masivo", etc.) | Automatizan WhatsApp Web. | Gratis | 0 s | **Alto**: violan los términos de WhatsApp; el número puede quedar bloqueado | ⛔ No recomendado |

### Por qué el Nivel 1 primero

- Funciona **hoy mismo**, sin aprobaciones de Meta ni tarjeta de crédito.
- Lo "pesado" (agendar, calendario, Meet, registro, recordatorios, resúmenes) ya es 100 % automático. Lo único manual es el toque de *Enviar*: 94 leads ≈ 15–20 minutos, que se pueden repartir entre el equipo (el panel evita que dos personas le escriban al mismo lead).
- Las respuestas llegan al WhatsApp del equipo como siempre, así que la conversación sigue siendo humana (en reclutamiento eso suele convertir mejor que un bot).

### Por qué el Nivel 2 no es el punto de partida

- Hay que crear la app en Meta for Developers, registrar un número, aprobar la plantilla y poner un medio de pago. Si ya tienen Meta Business por los Ads, esto se acorta, pero igual toma tiempo.
- Con la Cloud API "pura", **el número deja de usarse en la app del celular**: las respuestas no se ven en un teléfono, se necesita una bandeja de entrada. Las alternativas son: (a) un número solo para enviar las invitaciones y un botón "Hablar con alguien" que lleve al WhatsApp humano, o (b) un proveedor con *coexistencia* (mismo número en la app y en la API).
- Recibir respuestas por webhook directamente en Apps Script no es confiable: Apps Script responde con una redirección 302 y varios servicios de webhooks no la siguen. Para un bot que conteste solo, conviene un proveedor (opción 3) o un servidor aparte.

## Otras decisiones

- **Página de agendamiento propia en vez de las "Citas" de Google Calendar:** las páginas de reserva de Google solo se pueden crear en un calendario *secundario* (el "apartado diferente" que querías) con un plan de Google Workspace de pago. La página propia funciona con cualquier cuenta, ya sabe quién es cada lead (link personal), y actualiza la hoja y los resúmenes automáticamente.
- **Google Hojas + Apps Script en vez de Zapier/Make/n8n/Notion:** sin costo ni límites de tareas para este volumen, todo queda en la cuenta de Google del comité, y la hoja ya es la herramienta para verificar a quién se contactó. Si el equipo prefiere Notion para los agendados, se puede agregar después (Apps Script puede escribir en Notion con su API).
- **Correo + Telegram para los avisos:** el correo sale gratis desde la misma cuenta; Telegram da notificación inmediata en el celular sin costo. Avisar por WhatsApp al propio equipo requeriría la API (plantilla de utilidad).

## Costos de la WhatsApp Cloud API (referencia)

- Meta cobra por **plantilla entregada**. Las de marketing (la invitación) son las únicas que se pueden enviar a alguien que no te ha escrito en las últimas 24 h.
- Tarifa de marketing para Colombia: ~USD 0,0144 por mensaje desde enero de 2026 según ManyChat y SleekFlow; otras fuentes muestran 0,0125. **Verifícala en la página de precios de Meta antes de presupuestar.**
- Desde el 1 de octubre de 2026 Meta empezó a cobrar también mensajes de servicio y de utilidad dentro de la ventana de 24 h, con un cupo mensual gratis según algunos proveedores. Para este volumen el impacto es mínimo, pero conviene revisar las tarifas vigentes.

## Fuentes

- Meta – Pricing on the WhatsApp Business Platform: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- Meta – Cambios de precios en mensajes de servicio y utilidad: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages/
- ManyChat – tarifas por país: https://help.manychat.com/hc/en-us/articles/14281380243740
- SleekFlow – precios por mensaje: https://help.sleekflow.io/es_/whatsapp/pricing
- Respond.io – cambios de precios 2026: https://respond.io/blog/whatsapp-pricing-change-2026
- Twilio – cambios de precios octubre 2026: https://support.twilio.com/hc/en-us/articles/53100480177819-Notice-Changes-to-WhatsApp-s-Pricing-October-2026
- 360dialog – Coexistencia (app + API en el mismo número): https://docs.360dialog.com/docs/resources/phone-numbers/coexistence
- WATI – Coexistencia: https://support.wati.io/en/articles/11822402-introducing-whatsapp-coexistence
- Google – Citas en calendarios secundarios: https://support.google.com/calendar/answer/10729749
- Comunidad de Apps Script – redirección 302 en webhooks: https://groups.google.com/g/google-apps-script-community/c/WALz_3rw7u4
- Meta – Webhooks de WhatsApp: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint
