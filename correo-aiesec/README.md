# ✉️ Correo masivo desde la cuenta de AIESEC

Script independiente para enviar un correo personalizado ("Hola, [Nombre]") a los leads **desde una cuenta de AIESEC**, distinta a la dueña de la hoja de leads.

## Instalación (5 minutos, en la cuenta de AIESEC)
1. Comparte tu hoja de leads con la cuenta de AIESEC como **Editor**.
2. Entra con la cuenta de AIESEC a [script.new](https://script.new). Se crea un proyecto nuevo; ponle de nombre "Correo masivo AIESEC".
3. Borra lo que trae y pega todo [`CorreoMasivo.gs`](CorreoMasivo.gs).
4. Arriba, en **CONFIGURA AQUÍ**:
   - `URL_HOJA`: el link de tu hoja de leads.
   - `ASUNTO_BORRADOR`: una parte del asunto de tu borrador (ej. `voluntariado en el exterior`).
   - `PROGRAMA`: `GV`, `GT` o `TODOS`.
   - `NOMBRE_REMITENTE`: cómo aparece quien envía.
5. Guarda (Ctrl+S).

## Uso
- En la barra de arriba elige **enviarPrueba** y toca **Ejecutar**. La primera vez pide permisos; acéptalos. Te llega un correo con el nombre "Prueba".
- Si se ve bien, elige **enviarALosQueFaltan** y toca **Ejecutar**. El resultado aparece abajo, en el registro de ejecución.
- No repite: marca la columna **Correo enviado** en Contactos. Tampoco se lo envía a quien está como *No cumple* o *No interesado*.
- Si se acaba el cupo diario de correos, vuelve a ejecutarla al otro día y sigue con los que faltan.
