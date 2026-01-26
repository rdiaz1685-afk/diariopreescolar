# Diagnóstico y Solución de Errores

## Errores Comunes y Soluciones

### Error: "Application error: a client-side exception has occurred"

Este error ocurre cuando hay una excepción en el lado del cliente. Se puede deber a varias causas:

#### 1. Errores en Componentes del Cliente
**Síntoma:** Pantalla negra o pantalla de error en blanco
**Causa Posible:** Error en un componente que usa `'use client'`

**Soluciones Aplicadas:**
- ✅ Error Boundary: Se ha añadido un `ErrorBoundary` que captura errores del cliente y muestra una página amigable
- ✅ Hook useStudents Mejorado: Ahora tiene manejo de errores robusto con `isMounted` flag
- ✅ DashboardSummary Corregido: Se arregló el scope de `fetchSummary`

#### 2. Errores de Parsing JSX
**Síntoma:** Error de compilación en el navegador
**Causa Posible:** Etiquetas JSX mal cerradas o anidación incorrecta

**Soluciones Aplicadas:**
- ✅ Corregido JSX en `dashboard-summary.tsx` (línea 259 - div extra)
- ✅ Verificado anidación correcta de todos los componentes

### Error: Select Dropdowns No Visibles
**Síntoma:** Al hacer clic en un dropdown, no se ven las opciones
**Causa:** Z-index insuficiente

**Solución Aplicada:**
```css
[data-radix-popper-content-wrapper] {
  z-index: 999999 !important;
}
```

### Error: Campuses/Grupos Vacíos
**Síntoma:** "Preparando la base de datos..." se queda cargando
**Causa:** Base de datos vacía, no se ha llamado a `/api/setup`

**Solución Aplicada:**
```typescript
useEffect(() => {
  const fetchCampuses = async () => {
    // Primero hacer setup
    await fetch('/api/setup')

    // Luego cargar campuses
    const response = await fetch('/api/campuses')
    // ...
  }
  fetchCampuses()
}, [])
```

### Error: Estudiantes No Encontrados en Búsqueda
**Síntoma:** Buscar por nombre no funciona para estudiantes nuevos
**Causa:** El endpoint GET no tenía parámetro de búsqueda

**Solución Aplicada:**
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  if (search && search.length >= 2) {
    students = await db.student.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' },
          { lastName: { contains: search, mode: 'insensitive' }
        ]
      }
    })
  }
}
```

## Arquitectura de Manejo de Errores

### 1. Error Boundary (Component Level)
**Archivo:** `/src/components/error-boundary.tsx`
**Propósito:** Captura errores en toda la aplicación y muestra UI amigable

### 2. Robust Data Fetching (Hook Level)
**Archivo:** `/src/hooks/use-students.ts`
**Características:**
- Flag `isMounted` para evitar actualizaciones de estado en componentes desmontados
- Validación de respuesta: `Array.isArray(data)`
- Fallback a array vacío en caso de error
- Logging detallado de errores

### 3. Component Error Handling
**Ejemplo en DashboardSummary:**
```typescript
const fetchSummary = async () => {
  try {
    setLoading(true)
    const response = await fetch('/api/reports/summary')
    if (response.ok) {
      const data = await response.json()
      setSummary(data)
    }
  } catch (error) {
    console.error('Error cargando resumen:', error)
  } finally {
    setLoading(false)
  }
}
```

## Verificación de Estado de la Aplicación

### 1. Servidor de Desarrollo
```bash
bun run lint
```
Debería mostrar: `✓ Compiled in Xms` sin errores

### 2. Logs del Servidor
```bash
tail -20 /home/z/my-project/dev.log
```
Buscar:
- `✓ Compiled` - Compilación exitosa
- `GET / 200` - Respuestas exitosas
- `GET /api/students 200` - API funcionando

### 3. Console del Navegador
Presiona F12 y revisa:
- Errores en rojo (indican problemas)
- Warnings en amarillo (pueden causar problemas)
- Network tab - Verifica que las peticiones API retornan 200

## Pasos para Diagnosticar un Error

1. **Revisar Console del Navegador**
   - Abre DevTools (F12)
   - Busca errores en la pestaña Console
   - Toma captura del error si es necesario

2. **Revisar Network Tab**
   - Verifica qué peticiones están fallando
   - Busca peticiones con código de error (4xx, 5xx)
   - Revisa el response body

3. **Revisar Server Logs**
   ```bash
   tail -50 /home/z/my-project/dev.log
   ```

4. **Probar Endpoint Individual**
   - Abre una nueva pestaña
   - Visita: `http://localhost:3000/api/students`
   - Deberías ver un array JSON con estudiantes

5. **Recargar la Página**
   - Hard refresh: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
   - Limpia el cache si es necesario

## Recuperación de Errores

### Si la pantalla está completamente en blanco:
1. El ErrorBoundary debería mostrar un botón "Recargar Página"
2. Haz clic en ese botón
3. Si persiste, limpia el cache del navegador

### Si los componentes no responden:
1. Refresca la página
2. Verifica que el servidor esté corriendo
3. Revisa la consola para errores específicos

### Si los datos no se cargan:
1. Verifica que `/api/students` responda con 200
2. Revisa que la base de datos tenga datos
3. Verifica el console para errores de fetch

## Mejoras Recientes

1. **Error Boundary Global**
   - Captura errores en toda la aplicación
   - Proporciona UI amigable
   - Botón de recarga automático

2. **Hooks Más Robustos**
   - Manejo de `isMounted`
   - Validación de tipos
   - Fallback a valores por defecto

3. **Mejor Logging**
   - Errores detallados en console
   - Información de diagnóstico en endpoints

4. **Validación de Datos**
   - Verifica que `data` sea array antes de usarlo
   - Fallback a array vacío en errores

## Contacto y Soporte

Si encuentras un error que no está documentado aquí:

1. Toma captura del error (F12 → Console)
2. Anota qué acción causó el error
3. Revisa los logs del servidor
4. Proporciona todos estos detalles en el reporte

## Estado Actual del Sistema

✅ Error Boundary implementado
✅ Hook useStudents mejorado
✅ DashboardSummary corregido
✅ Manejo de errores robusto
✅ Logging detallado
✅ Validación de datos
✅ Fallbacks seguros
✅ Linting sin errores

La aplicación está preparada para manejar errores de forma elegante y proporcionar una buena experiencia de usuario incluso cuando ocurren problemas.
