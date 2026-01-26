# 🔄 CÓMO ACTUALIZAR EL DESPLIEGUE

---

## 📋 PROCESO PARA ACTUALIZAR

A diferencia de GitHub, esta plataforma NO actualiza automáticamente. Necesitas hacer un **nuevo despliegue** cada vez que hagas cambios.

---

## ✅ PASO 1: GUARDAR CAMBIOS

Ya están guardados en Git:
- ✅ Commiteado todos los cambios
- ✅ Archivos de gestión de estudiantes creados
- ✅ Errores de despliegue arreglados

---

## ✅ PASO 2: CREAR NUEVO DESPLIEGUE

En la plataforma de despliegue:

1. **Busca el botón de despliegue**
   - Normalmente dice: "Deploy", "Publicar", "Desplegar"
   - O está en una sección de "Deployments" o "Publicaciones"

2. **Haz click en "Nuevo Despliegue"** o similar

3. **Selecciona el proyecto** (si hay varios)

4. **Click en "Deploy"** o "Publicar"

5. **Espera unos minutos** (5-10 minutos para que se complete)

---

## ⏳ PASO 3: ESPERAR ACTIVACIÓN

El despliegue puede tardar:
- **5-10 minutos** para completar
- **5-15 minutos adicionales** para propagación del dominio

---

## ✅ PASO 4: VERIFICAR

1. **Entra a:** `https://preescolar.space.z.ai`
2. **Verifica:**
   - ¿Aparece la pestaña "Agregar"?
   - ¿Puedes agregar un estudiante?

---

## 🔄 SI SIGUE SIN CAMBIOS

### Opción A: Forzar recarga
- Limpia el cache del navegador
- Entra en modo incógnito/privado
- Presiona Ctrl + Shift + R (o Cmd + Shift + R en Mac)

### Opción B: Crear otro despliegue
- Despliega nuevamente con un nombre diferente
- La plataforma asignará otro dominio

### Opción C: Verificar los cambios
- Confirma que los archivos están en el repositorio
- Confirma que se subieron todos los archivos

---

## 📊 DIFERENCIA CON GITHUB

| GitHub | Esta Plataforma |
|---------|----------------|
| ✅ Actualiza automáticamente | ❌ Requiere nuevo despliegue |
| ✅ Commit = Deploy | ❌ Deploy es acción separada |
| ✅ Push al repo = activo | ❌ Necesitas iniciar deploy |
| ✅ Mismo dominio siempre | ⚠️ Puede cambiar cada deploy |

---

## 🎯 RESUMEN

### Para actualizar la aplicación:
1. ✅ **Ya está commiteado** en git
2. ✅ **Haz click en "Deploy"** o "Publicar" en la plataforma
3. ✅ **Espera 5-15 minutos**
4. ✅ **Verifica en** `https://preescolar.space.z.ai`

---

## 💡 TIPS

### Próximas veces:
- Después de hacer cambios al código
- Haz git commit
- Crea nuevo despliegue
- Espera activación

### Para evitar múltiples despliegues:
- Haz todos los cambios primero
- Commit todo junto
- Despliega una sola vez
- Ahorra tiempo y recursos

---

## ❓ PREGUNTAS FRECUENTES

### ¿No encuentro el botón de despliegue?
- Busca en menú "Deployments"
- O "Publicaciones"
- O "Build & Deploy"

### ¿El despliegue falla?
- Verifica que no haya errores de código
- Revisa el log del despliegue
- Intenta de nuevo

### ¿Me da otro dominio?
- Es normal en esta plataforma
- Cada despliegue puede tener nuevo dominio
- Apunta el nuevo dominio

---

**¡Crea un nuevo despliegue ahora y espera unos minutos para ver los cambios!** 🚀
