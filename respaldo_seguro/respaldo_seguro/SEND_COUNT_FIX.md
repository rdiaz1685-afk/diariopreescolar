# Corrección del Contador Dinámico de Reportes para Enviar

## El Problema

El usuario reportó:
> "Se viene seleccionar los reporte a enviar entonces yo selecciono solamente a Camila que es un reporte completo y más abajo me dice que se van a enviar 12 reportes que no debería decir se enviará un reporte por correo electrónico porque solo tengo uno solo seleccionado"

### Lo que ocurría:

1. Los números en la sección de envío eran **HARDCODED** (estáticos):
   - **Completos**: siempre mostraba "12"
   - **Incompletos**: siempre mostraba "5"
   - **Sin iniciar**: siempre mostraba "3"
   - **Mensaje**: "Se enviarán 12 reportes por correo electrónico"

2. La lista de estudiantes mostraba los **primeros 10 estudiantes filtrados**, sin importar si tenían reporte completo o no

3. No había lógica de **selección** para enviar reportes específicos

## La Solución

### 1. Estadísticas Dinámicas del Resumen

**Antes (números HARDCODED):**
```tsx
<Badge>12</Badge>  {/* Completos - siempre 12 */}
<Badge>5</Badge>   {/* Incompletos - siempre 5 */}
<Badge>3</Badge>   {/* Sin iniciar - siempre 3 */}
```

**Después (cálculo dinámico):**
```tsx
{(() => {
  const totalStudents = filteredStudents.length
  const completeStudents = filteredStudents.filter(s =>
    existingReports[s.id] && (existingReports[s.id].mood && existingReports[s.id].lunchIntake)
  ).length
  const incompleteStudents = filteredStudents.filter(s =>
    !existingReports[s.id] || !(existingReports[s.id]?.mood && existingReports[s.id]?.lunchIntake)
  ).length
  const notStartedStudents = filteredStudents.filter(s => !existingReports[s.id]).length

  return (
    <>
      <Badge>{completeStudents}</Badge>      {/* Dinámico según datos reales */}
      <Badge>{incompleteStudents}</Badge>   {/* Dinámico según datos reales */}
      <Badge>{notStartedStudents}</Badge>    {/* Dinámico según datos reales */}
    </>
  )
})()}
```

### 2. Lista de Estudiantes Filtrados

**Antes:**
- Mostraba los primeros 10 estudiantes filtrados
- No verificaba si tenían reportes completos
- No permitía seleccionar cuáles enviar

**Después:**
- Filtra estudiantes que **SÍ tienen reportes completos** (mood + lunchIntake)
- Solo muestra los que están listos para enviar
- Permite seleccionar específicamente cuáles enviar
- Mensaje si no hay reportes completos

```tsx
{(() => {
  // Mostrar solo estudiantes con reportes completos
  const studentsWithCompleteReports = filteredStudents.filter(s =>
    existingReports[s.id] && (existingReports[s.id].mood && existingReports[s.id].lunchIntake)
  )

  if (studentsWithCompleteReports.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No hay reportes completos para enviar.</p>
        <p>Completa los reportes (ánimo + lonche) para que aparezcan aquí.</p>
      </div>
    )
  }

  return studentsWithCompleteReports.map((student, index) => (
    <div className="...">
      <Checkbox
        checked={selectedStudents.includes(student.id)}
        onCheckedChange={() => toggleStudent(student.id)}
      />
      {/* ... nombre del estudiante ... */}
      <p>✅ Reporte completo</p>
    </div>
  ))
})()}
```

### 3. Mensaje Dinámico de Envío

**Antes:**
```tsx
<p>Se enviarán 12 reportes por correo electrónico</p>
```

**Después (basado en estudiantes SELECCIONADOS):**
```tsx
{(() => {
  // Calcular estudiantes con reportes completos seleccionados para enviar
  const selectedCompleteStudents = selectedStudents.filter(id =>
    existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
  ).length

  return selectedCompleteStudents > 0
    ? `Se enviarán ${selectedCompleteStudents} reporte${selectedCompleteStudents !== 1 ? 's' : ''} seleccionado${selectedCompleteStudents !== 1 ? 's' : ''} por correo electrónico`
    : 'Selecciona los reportes completos que deseas enviar'
})()}
```

**Ejemplos:**
- Si seleccionas 1 estudiante: "Se enviarán 1 reporte seleccionado por correo electrónico"
- Si seleccionas 3 estudiantes: "Se enviarán 3 reportes seleccionados por correo electrónico"
- Si no seleccionas ninguno: "Selecciona los reportes completos que deseas enviar"

### 4. Botón de Envío con Validación

**Después:**
```tsx
<Button
  className="neon-accent"
  disabled={selectedStudents.filter(id =>
    existingReports[id] && (existingReports[id].mood && existingReports[id].lunchIntake)
  ).length === 0}
>
  <Send className="w-4 h-4 mr-2" />
  Enviar Reportes
</Button>
```

El botón se deshabilita si:
- No hay estudiantes seleccionados, O
- Los estudiantes seleccionados no tienen reportes completos

## Comportamiento Ahora

### Escenario: Usuario selecciona SOLO a Camila (con reporte completo)

1. **Resumen del día** muestra:
   - ✅ Completos: 1 (o el número real de reportes completos)
   - ⚠️ Incompletos: X (número real de reportes incompletos)
   - ❌ Sin iniciar: X (número real de reportes sin iniciar)

2. **Lista de estudiantes para enviar**:
   - Muestra SOLO a Camila (y otros con reportes completos)
   - Cada uno tiene un checkbox para seleccionarlo
   - Dice "✅ Reporte completo"

3. **Usuario selecciona a Camila**:
   - El checkbox se marca
   - El mensaje dice: "Se enviarán **1 reporte seleccionado** por correo electrónico"
   - El botón "Enviar Reportes" está habilitado

4. **Si no selecciona nada**:
   - El mensaje dice: "Selecciona los reportes completos que deseas enviar"
   - El botón "Enviar Reportes" está deshabilitado

### Criterio para "Reporte Completo"

Un reporte se considera **completo** cuando tiene:
- ✅ **Mood** (estado de ánimo)
- ✅ **Lunch Intake** (lonche)

Ambos son necesarios para poder enviar.

## Archivo Modificado

`/home/z/my-project/src/app/page.tsx`

### Secciones modificadas:

1. **Resumen del día** (líneas 910-959)
2. **Lista de estudiantes para enviar** (líneas 1009-1074)
3. **Botón de envío** (líneas 1076-1111)

## Verificación

- ✅ Lint pasa sin errores
- ✅ Números calculados dinámicamente según datos reales
- ✅ Solo muestra estudiantes con reportes completos en la lista de envío
- ✅ Permite selección múltiple de estudiantes para enviar
- ✅ Mensaje dinámico basado en estudiantes seleccionados
- ✅ Botón de envío con validación
- ✅ Mensaje de estado cuando no hay reportes completos

## Beneficios

1. **Exactitud**: Los números siempre reflejan el estado real
2. **Claridad**: El usuario sabe exactamente cuántos reportes enviará
3. **Control**: El usuario puede elegir cuáles reportes enviar
4. **Usabilidad**: Mensajes claros según el estado de selección
5. **Validación**: Evita envíos accidentales o de reportes incompletos
