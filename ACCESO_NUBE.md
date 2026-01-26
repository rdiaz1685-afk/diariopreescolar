# 🔗 Acceso al Sistema en la Nube

## 🌐 URL de Acceso

El sistema está desplegado en:

**http://dailyreport.space.z.ai**

⚠️ **Importante**: Usa `http://` (no `https://`)

---

## 🚀 ¿No Puedes Acceder?

### Opción 1: Esperar Propagación DNS
Si el dominio es nuevo, puede tardar unos minutos en propagarse. Intenta nuevamente después de 5-10 minutos.

### Opción 2: Verificar URL Correcta
Asegúrate de usar:
- ✅ `http://dailyreport.space.z.ai`
- ❌ `https://dailyreport.space.z.ai` (puede no funcionar)

### Opción 3: Acceso Directo a la IP
Si tienes la IP del servidor, puedes usar:
- `http://TU_IP_DEL_SERVIDOR:81`

### Opción 4: Acceso Local
Si estás en el mismo servidor, puedes usar:
- `http://localhost:81`
- `http://localhost:3000`

---

## 📱 Páginas Disponibles

### 🏠 Página Principal (Interfaz de Maestros)
URL: `http://dailyreport.space.z.ai`

Funciones:
- Ver lista de estudiantes por grupo y campus
- Registrar reportes diarios (mood, comida, siesta, etc.)
- Selección múltiple de estudiantes
- Historial de reportes

### 📊 Panel de Administración (Dashboard)
URL: `http://dailyreport.space.z.ai/dashboard`

Funciones:
- Métricas y estadísticas por campus y grupo
- Comparación de rankings
- Tendencias de comportamiento
- Distribución de emociones y hábitos

---

## 🔧 Estado del Servidor

Actualmente el servidor está funcionando:
- ✅ Next.js corriendo en puerto 3000
- ✅ Caddy corriendo en puerto 81
- ✅ Proxy configurado correctamente
- ✅ Base de datos SQLite activa
- ✅ Peticiones HTTP respondiendo con código 200

---

## 🐛 Solución de Problemas

### Error: "No se puede acceder a este sitio"

1. **Verifica que uses HTTP, no HTTPS**
   ```
   ❌ https://dailyreport.space.z.ai
   ✅ http://dailyreport.space.z.ai
   ```

2. **Espera unos minutos** (propagación DNS)
   - Los dominios nuevos pueden tardar 5-30 minutos
   - Intenta recargar la página varias veces

3. **Verifica tu conexión**
   - Asegúrate de tener internet
   - Prueba otros sitios web

4. **Limpia el cache del navegador**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

5. **Intenta en otro navegador**
   - Chrome, Firefox, Safari, Edge

---

## 🌍 Si Sigues Sin Poder Acceder

Si después de 10-15 minutos sigues sin poder acceder, puedes:

1. **Ejecutar el proyecto localmente** (instrucciones en `INSTALACION_LOCAL.md`)
2. **Verificar con el administrador del servidor**
3. **Usar una VPN** si hay restricciones de ubicación

---

## 📞 Información Técnica

- **Framework**: Next.js 16
- **Base de Datos**: SQLite (Prisma ORM)
- **Proxy**: Caddy (puerto 81)
- **Aplicación**: Puerto 3000

---

## ✅ Lista de Verificación

Antes de reportar un problema:
- [ ] Usaste `http://` no `https://`
- [ ] Esperaste al menos 10 minutos desde el despliegue
- [ ] Intentaste en múltiples navegadores
- [ ] Verificaste tu conexión a internet
- [ ] Limpiaste el cache del navegador

---

**¡El sistema está funcionando! Si no puedes acceder, verifica los pasos anteriores.** 🚀
