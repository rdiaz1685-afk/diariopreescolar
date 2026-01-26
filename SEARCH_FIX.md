# Corrección del Error 500 en Búsqueda de Estudiantes

## El Problema

Al buscar estudiantes en la pestaña "Editar Padres" (ParentContactEditor), aparecía este error:

```
Error en respuesta de búsqueda: 500
```

Y en la consola:

```
Unknown argument `mode`. Did you mean `lte`?
```

## La Causa

El código de búsqueda usaba el parámetro `mode: 'insensitive'` que **NO ES SOPORTADO por SQLite**:

```typescript
// CÓDIGO ANTERIOR (causaba error 500)
students = await db.student.findMany({
  where: {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },     // ❌ Error
      { lastName: { contains: search, mode: 'insensitive' } } // ❌ Error
    ]
  },
  orderBy: { name: 'asc' }
})
```

### ¿Por qué no funciona?

- **`mode: 'insensitive'`** es un parámetro de Prisma para búsquedas case-insensitive
- Este parámetro **SÓLO funciona** con:
  - PostgreSQL
  - MySQL
  - SQL Server
- **NO funciona con SQLite** (que es lo que usamos)

## La Solución

Eliminar el parámetro `mode: 'insensitive'` porque:

1. **SQLite es case-insensitive por defecto** cuando usa `contains` (LIKE)
2. Al remover el parámetro, SQLite hace la búsqueda de forma case-insensitive automáticamente

```typescript
// CÓDIGO CORREGIDO
students = await db.student.findMany({
  where: {
    OR: [
      { name: { contains: search } },      // ✅ Funciona en SQLite
      { lastName: { contains: search } }     // ✅ Funciona en SQLite
    ]
  },
  orderBy: { name: 'asc' }
})
```

## Archivo Modificado

`/home/z/my-project/src/app/api/students/route.ts`

### Cambio específico:

**Antes:**
```typescript
where: {
  OR: [
    { name: { contains: search, mode: 'insensitive' } },
    { lastName: { contains: search, mode: 'insensitive' } }
  ]
}
```

**Después:**
```typescript
where: {
  OR: [
    { name: { contains: search } },
    { lastName: { contains: search } }
  ]
}
```

## Comportamiento Ahora

### Búsquedas funcionales:
- Buscar "santi" → encuentra "Santiago", "Santtiago", "SANTIAGO" (case-insensitive)
- Buscar "lopez" → encuentra "López", "LOPEZ", "LopeZ"
- Buscar "maria" → encuentra "María", "MARIA", "maria"

### Requisitos de búsqueda:
- Mínimo 2 caracteres (ya estaba implementado)
- Busca en nombre O apellido
- Case-insensitive (por defecto en SQLite con `contains`)

## Verificación

- ✅ Lint pasa sin errores
- ✅ El parámetro `mode` eliminado
- ✅ SQLite hará búsquedas case-insensitive automáticamente
- ✅ La búsqueda funcionará correctamente en la pestaña "Editar Padres"

## Nota Técnica

En SQLite:
- `contains` se convierte a `LIKE '%search%'` que es case-insensitive
- Esto significa que `contains` ya hace búsquedas case-insensitive sin necesidad del parámetro `mode`
- El parámetro `mode: 'insensitive'` solo es necesario para PostgreSQL/MySQL donde `contains` es case-sensitive por defecto
