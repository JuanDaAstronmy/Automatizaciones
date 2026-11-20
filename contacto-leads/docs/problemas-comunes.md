# Problemas comunes

**No aparece el menú 🌍 AIESEC.** Recarga la hoja. Si sigue sin aparecer, revisa en Apps Script que el código esté guardado y que no haya errores en rojo.

**"Google no verificó esta app".** Es normal: es tu propio script. *Configuración avanzada → Ir a … (no seguro) → Permitir*.

**En "Quién tiene acceso" no aparece "Cualquier usuario".** Tu cuenta (normalmente universitaria o de una organización) no permite apps públicas. Instálalo con una cuenta `@gmail.com` y comparte el calendario *AIESEC · Entrevistas* con tu cuenta principal (en Google Calendar: ⋮ junto al calendario → *Configuración y uso compartido → Compartir con personas*).

**El panel dice "Acceso no autorizado".** El link no tiene la clave correcta. Cópialo de nuevo desde *AIESEC → Ver links* o desde la pestaña Inicio.

**Los mensajes salen sin link para agendar.** Falta pegar la URL `/exec` en *Config → URL de la app web*. Luego *AIESEC → Ver links* rellena la columna *Link para agendar*.

**Cambié el código y la página sigue igual.** Hay que publicar una versión nueva: *Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar*. **No** crees una implementación nueva (cambiaría la URL y los links ya enviados dejarían de funcionar).

**No aparecen horarios.** Revisa en Config los horarios por día (formato `09:00-12:00, 14:00-18:00`), la anticipación mínima y los días a mostrar. Los festivos de Colombia se bloquean solos (*Bloquear festivos* = NO para desactivarlo). Cualquier evento que crees en el calendario *AIESEC · Entrevistas* bloquea ese rato.

**Quiero bloquear una tarde.** Crea un evento en el calendario *AIESEC · Entrevistas* (ej. "Asamblea") o agrega la fecha en *Config → Fechas bloqueadas*.

**Cambié la hora de los resúmenes y no se aplicó.** Corre *AIESEC → Configurar / reparar* para recrear los disparadores. Llegan con unos minutos de diferencia (Google los ejecuta dentro de una ventana de ±15 min).

**No llega el resumen.** Revisa *Config → Correos que reciben el resumen* y la carpeta de spam. Puedes probar con *AIESEC → Enviar el resumen ahora*. Las cuentas gratuitas de Google pueden enviar unos 100 correos al día desde scripts.

**Al importar, muchos quedaron como "Número inválido".** Revisa la columna Teléfono: los números de Colombia deben ser celulares de 10 dígitos (3XX…). Si el archivo pasó por Excel y quedó como `5,73E+11`, se perdieron dígitos: vuelve a exportar desde la fuente o abre el CSV directamente en Google Sheets.

**Otra persona del equipo no puede usar "Configurar".** Es a propósito: el calendario y los avisos están en la cuenta de quien lo configuró. El resto del equipo usa el panel y la hoja.

**Alguien agendó y quiero moverlo yo.** Ábrele su link personal (panel → ⋯ Más) y elige otro horario: el evento anterior se borra y se avisa por correo a los invitados. Si mueves el evento directamente en Google Calendar, la hoja no se entera.
