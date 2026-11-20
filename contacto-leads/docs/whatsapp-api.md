# Nivel 2 (opcional): envío 100 % automático con WhatsApp Cloud API

Con esto, la invitación sale sola a todos los leads pendientes (un clic) y, si quieres, a cada lead nuevo cada hora, **sin tocar el celular**. El código ya está listo; solo hay que hacer la parte de Meta.

> Las pantallas de Meta cambian seguido. Si un nombre no coincide, busca la opción equivalente.

## Antes de empezar

- **Meta Business** (el mismo portfolio con el que pagaron los Ads sirve).
- **Un número para la API.** Con la Cloud API "pura", ese número **deja de funcionar en la app de WhatsApp del celular**. Opciones:
  - Una SIM nueva/prepago solo para enviar invitaciones (lo más simple), con un botón "Hablar con alguien" que lleve al WhatsApp humano del comité (ver plantilla abajo).
  - Un proveedor con **coexistencia** (360dialog, WATI, SleekFlow…) para usar el mismo número en la app y en la API. Tiene mensualidad.
- **Medio de pago** en Meta: ~USD 0,014 por invitación en Colombia (≈ USD 1,4 por 94 leads). Verifica la tarifa vigente en la página de precios de Meta.

## Pasos en Meta

1. **Crear la app:** [developers.facebook.com](https://developers.facebook.com) → *Mis apps → Crear app* → caso de uso de **WhatsApp** (conectar con clientes) → vincúlala al portfolio de AIESEC.
2. **Agregar el número:** en la app, *WhatsApp → Configuración de la API* → *Agregar número de teléfono* → verifica por SMS o llamada. Copia el **Identificador del número de teléfono** (*Phone number ID*).
3. **Token permanente:** [business.facebook.com](https://business.facebook.com) → *Configuración → Usuarios → Usuarios del sistema* → *Agregar* (rol administrador) → *Asignar activos*: la app y la cuenta de WhatsApp con control total → *Generar token* con los permisos `whatsapp_business_messaging` y `whatsapp_business_management`, sin vencimiento. **Guárdalo en un lugar seguro: es como una contraseña.**
4. **Medio de pago:** WhatsApp Manager → *Configuración de la cuenta → Pagos*.
5. **Crear la plantilla:** WhatsApp Manager → *Plantillas de mensajes → Crear*:
   - Categoría: **Marketing** · Nombre: `invitacion_agendar` · Idioma: **Español (es)**.
   - Cuerpo (ejemplo; `{{1}}` = primer nombre):

     ```
     ¡Hola, {{1}}! 👋 Te escribimos de AIESEC porque te registraste en nuestra convocatoria.
     Nos encantaría contarte todos los detalles en una llamada corta por Google Meet.
     Elige el horario que mejor te quede con el botón de abajo. 🌍
     ```
   - Botón 1 · *Visitar sitio web* · URL **dinámica**: `https://script.google.com/macros/s/TU_ID/exec?id={{1}}` (la URL `/exec` de tu app web + `?id=` + `{{1}}`). Ejemplo para la revisión: `https://script.google.com/macros/s/TU_ID/exec?id=4e77ac0f9ef6`.
   - Botón 2 (recomendado) · *Visitar sitio web* · URL **fija**: `https://wa.me/57XXXXXXXXXX` con el texto "Hablar con alguien" (el WhatsApp humano del comité).
   - Envía a revisión (suele tardar de minutos a horas).

## Pasos en la hoja

1. Menú **🌍 AIESEC → 🤖 WhatsApp API → 1. Guardar credenciales**: token, Phone number ID, nombre de la plantilla e idioma (`es`).
2. Pestaña **Config → Teléfono para pruebas de la API**: tu número (ej. `573001234567`).
3. Menú **→ 2. Enviarme un mensaje de prueba**. Revisa que el nombre y el botón funcionen (el botón de la prueba abre un link con `id=prueba`, que muestra "link no válido": es normal).
4. Menú **→ 3. Enviar invitación a todos los pendientes**. Muestra cuántos son y el costo aproximado antes de enviar.
5. (Opcional) En **Config**: *Modo de envío de WhatsApp* = `API` (el panel oculta el modo rápido) y *Enviar solo a leads nuevos por API* = `SI` (cada hora invita a los leads nuevos que se importen).

## Bueno saber

- **Límites:** las cuentas nuevas solo pueden escribir a un número limitado de personas nuevas por día (empieza en cientos y sube con la calidad). El sistema envía máximo 250 por clic y 100 por hora en automático.
- **Tope de marketing por usuario:** Meta puede no entregar algunas invitaciones de marketing a quien ya recibió muchas de otras empresas (error 131049). El lead queda como *Contactado*; si no agenda, aparecerá en "seguimiento" del resumen para escribirle a mano.
- **Errores graves** (token vencido, plantilla inexistente, pago pendiente): el envío se detiene solo y te dice el código. Todo queda en la pestaña **Registro**.
- **Proveedor compatible (ej. 360dialog):** en Apps Script → ⚙️ *Configuración del proyecto → Propiedades del script*, agrega `WA_URL_MENSAJES` = `https://waba-v2.360dialog.io/messages` y `WA_HEADER_AUTH` = `D360-API-KEY` (y en `WA_TOKEN` la API key del proveedor).

### Propiedades del script que usa

| Propiedad | Para qué | Por defecto |
|---|---|---|
| `WA_TOKEN` | Token de acceso (o API key del proveedor) | — |
| `WA_PHONE_NUMBER_ID` | Identificador del número | — |
| `WA_PLANTILLA` | Nombre de la plantilla | `invitacion_agendar` |
| `WA_IDIOMA` | Código de idioma de la plantilla | `es` |
| `WA_API_VERSION` | Versión de la Graph API | `v23.0` |
| `WA_BOTON_URL` | `NO` si la plantilla no tiene botón con URL dinámica | `SI` |
| `WA_NOMBRE_DEFECTO` | Texto para `{{1}}` si el lead no tiene nombre | `qué tal` |
| `WA_URL_MENSAJES`, `WA_HEADER_AUTH` | Solo para proveedores compatibles | — |
