# Solución al Error 500 al Crear Estudiantes

## Problema

Al intentar dar de alta un estudiante, el sistema mostraba:
```
POST https://preescolar8.space.z.ai/api/students/create 500 (Internal Server Error)
```

El error no proporcionaba información útil al usuario.

## Causa Raíz

El problema estaba en el esquema de la base de datos. En el modelo `Student` de Prisma:

```prisma
model Student {
  id          String   @id @default(cuid())
  name        String
  lastName    String
  dateOfBirth DateTime
  gender      String
  emergencyContact String  // <-- REQUERIDO
  emergencyPhone  String    // <-- REQUERIDO
  parentEmail String        // <-- REQUERIDO
  parentPhone String        // <-- REQUERIDO
  medicalNotes String?
  campusId    String        // <-- REQUERIDO
  campus      Campus   @relation(fields: [campusId], references: [id], onDelete: Cascade)
  groupId     String        // <-- REQUERIDO
  group       Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  ...
}
```

Los campos `campusId` y `groupId` son **OBLIGATORIOS** en la base de datos, pero:
1. El formulario no incluía selección de campus y grupo
2. El API endpoint intentaba crear un estudiante sin estos campos
3. Esto causaba un error de Prisma al intentar insertar un registro con campos faltantes

## Solución Implementada

### 1. Actualizar el Formulario (`student-form-simple.tsx`)

**Cambios:**
- Agregar estado para campuses y grupos
- Cargar campuses automáticamente al montar el componente
- Cargar grupos cuando se selecciona un campus
- Agregar selectores de campus y grupo en el formulario
- Hacer campus y grupo campos obligatorios

**Nuevo flujo:**
1. El usuario llena los datos básicos del estudiante
2. Selecciona un campus de la lista (campuses cargados desde `/api/campuses`)
3. Selecciona un grupo (grupos filtrados por el campus seleccionado desde `/api/groups?campusId=XXX`)
4. Envía el formulario

### 2. Actualizar el API Endpoint (`/api/students/create/route.ts`)

**Cambios:**
- Agregar validación para `campusId` y `groupId`
- Enviar campusId y groupId como campos obligatorios
- Usar cadenas vacías para campos de contacto que no sean obligatorios en el formulario
- Mejorar mensajes de error con detalles específicos
- Agregar logging detallado para debugging

**Nueva validación:**
```typescript
if (!body.campusId) {
  return NextResponse.json(
    { error: 'El campus es requerido' },
    { status: 400 }
  )
}

if (!body.groupId) {
  return NextResponse.json(
    { error: 'El grupo es requerido' },
    { status: 400 }
  )
}
```

### 3. Actualizar Frontend para Mostrar Errores Detallados

**Cambios:**
- Capturar error JSON del servidor
- Mostrar el mensaje de error específico en el toast
- Loguear el error en la consola del navegador para debugging

## Cómo Funciona Ahora

1. **Carga de Campus**: Al abrir el formulario "Agregar", se carga automáticamente la lista de todos los campuses disponibles.

2. **Selección de Campus**: El usuario selecciona un campus (ej. "Mitras", "Cumbres", etc.).

3. **Carga de Grupos**: Una vez seleccionado el campus, se cargan solo los grupos de ese campus (ej. "Toddlers", "Prenursery", "Preescolar" del campus seleccionado).

4. **Selección de Grupo**: El usuario selecciona el grupo al que pertenece el estudiante.

5. **Envío del Formulario**: Todos los datos (incluyendo campusId y groupId) se envían al servidor.

6. **Validación**: El servidor valida que todos los campos requeridos estén presentes.

7. **Creación del Estudiante**: Prisma crea el registro con todos los campos obligatorios.

8. **Confirmación**: El usuario ve un mensaje de éxito con el nombre del estudiante creado.

## Prerrequisitos

Antes de crear estudiantes, la base de datos debe tener:
- Campuses creados (se puede hacer con `/api/setup`)
- Grupos creados (se puede hacer con `/api/setup`)

El endpoint `/api/setup` ya existe y crea automáticamente:
- 5 campuses: MITRAS, CUMBRES, NORTE, DOMINIO, ANAHUAC
- 15 grupos: 3 por cada campus (toddlers, prenursery, preescolar)

## Archivos Modificados

1. `/home/z/my-project/src/app/api/students/create/route.ts`
   - Agregar validación de campusId y groupId
   - Mejorar manejo de errores
   - Agregar logging detallado

2. `/home/z/my-project/src/components/student-form-simple.tsx`
   - Agregar selección de campus y grupo
   - Implementar carga dinámica de datos
   - Mostrar errores detallados del servidor

## Notas Importantes

- `campusId` y `groupId` son obligatorios en la base de datos según el esquema Prisma
- Los campos de contacto (emergencyContact, emergencyPhone, parentEmail, parentPhone) también son obligatorios en la base de datos, así que se envían como cadenas vacías si no se proporcionan
- El sistema usa relaciones de Prisma: Student → Campus y Student → Group
- Si la base de datos no tiene campuses y grupos, el usuario no podrá crear estudiantes

## Pasos para Desplegar

1. El código ya está commiteado al repositorio
2. Crear un nuevo despliegue (ej. preescolar9.space.z.ai)
3. Al acceder por primera vez, llamar `/api/setup` para crear campuses y grupos
4. Probar agregar un estudiante individual
5. Verificar que el estudiante se crea correctamente

## Test Case

**Pasos para probar:**
1. Ir a la pestaña "Agregar"
2. Llenar el formulario con datos de un estudiante
3. Seleccionar un campus (ej. "Mitras")
4. Seleccionar un grupo (ej. "Toddlers - Mitras")
5. Hacer clic en "Agregar Estudiante"
6. Ver el mensaje de éxito
7. Recargar la página y verificar que el estudiante aparece en la lista

**Resultado esperado:**
- El estudiante se crea correctamente
- Aparece en la lista de estudiantes
- Tiene el campus y grupo asignados correctamente
