# 📚 Guía de Instalación Local - Sistema de Seguimiento de Estudiantes

## 📋 Requisitos Previos

Necesitas tener instalado en tu computadora:
- **Bun** (recomendado) o Node.js 18+
- Git (opcional, si descargaste el proyecto como ZIP no lo necesitas)

### Instalar Bun (opcional pero recomendado)
```bash
# En macOS/Linux
curl -fsSL https://bun.sh/install | bash

# En Windows (usando PowerShell)
iwr https://bun.sh/install.ps1 -useb | iex
```

---

## 🚀 Pasos para Iniciar el Servidor

### Paso 1: Descomprimir el Proyecto (si es necesario)
Si descargaste el proyecto como archivo ZIP:
1. Descomprime el archivo
2. Mueve todos los archivos a una carpeta de tu preferencia
3. Abre una terminal/consola en esa carpeta

### Paso 2: Instalar Dependencias

**Opción A: Usando Bun (Recomendado)**
```bash
bun install
```

**Opción B: Usando npm o yarn**
```bash
npm install
# o
yarn install
```

⏱️ Este proceso puede tardar unos minutos.

### Paso 3: Configurar Base de Datos

Ejecuta el siguiente comando para crear y configurar la base de datos:

```bash
# Usando Bun
bun run db:push

# O usando npm/yarn
npm run db:push
# o
yarn db:push
```

Esto creará un archivo `db/custom.db` con la base de datos SQLite.

### Paso 4: Iniciar el Servidor de Desarrollo

**Opción A: Usando Bun (Recomendado)**
```bash
bun run dev
```

**Opción B: Usando npm/yarn**
```bash
npm run dev
# o
yarn dev
```

🎉 El servidor se iniciará en: **http://localhost:3000**

---

## 📱 Acceder a la Aplicación

Una vez que el servidor esté corriendo, abre tu navegador y accede a:

### 🏠 Página Principal (Interfaz de Maestros)
**URL**: http://localhost:3000/

Permite:
- Ver la lista de estudiantes
- Registrar reportes diarios (mood, comida, siesta, etc.)
- Seleccionar múltiples estudiantes a la vez (por ejemplo, marcar si 10 estudiantes dormieron la siesta)

### 📊 Panel de Administración (Dashboard)
**URL**: http://localhost:3000/dashboard

Permite:
- Ver métricas y estadísticas por campus y grupo
- Comparar rankings entre campus
- Ver tendencias de comportamiento
- Analizar distribución de emociones, alimentación, siestas, etc.

---

## 🔧 Otros Comandos Útiles

### Verificar la calidad del código
```bash
bun run lint
```

### Generar cliente Prisma (después de cambios en schema)
```bash
bun run db:generate
```

### Crear una nueva migración de base de datos
```bash
bun run db:migrate
```

### Resetear la base de datos (¡borra todos los datos!)
```bash
bun run db:reset
```

### Construir para producción
```bash
bun run build
```

### Iniciar servidor de producción
```bash
bun start
```

---

## 📂 Estructura del Proyecto

```
proyecto/
├── prisma/
│   └── schema.prisma          # Modelo de base de datos
├── src/
│   ├── app/                   # Páginas de Next.js
│   │   ├── page.tsx           # Página principal (maestros)
│   │   ├── dashboard/         # Panel de administración
│   │   └── api/               # Rutas de la API
│   ├── components/            # Componentes React
│   │   └── ui/                # Componentes shadcn/ui
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Utilidades y configuraciones
├── db/
│   └── custom.db              # Base de datos SQLite
└── package.json               # Dependencias del proyecto
```

---

## 🎨 Tema y Estilo

La aplicación usa un estilo **Neon Future** con:
- Fondo negro (`bg-black`)
- Colores neón brillantes (cyan, magenta, amarillo, verde)
- Efectos de brillo (glow effects)
- Animaciones fluidas con Framer Motion

---

## 👥 Roles del Sistema

El sistema soporta 4 roles de usuarios:

1. **Rector (校长)** - Puede ver todos los campus
2. **Vicerrector (副校长)** - Puede ver todos los campus
3. **Directora (园长/校长)** - Solo ve su propio campus
4. **Maestra (教师)** - Solo ve su propio grupo

---

## 🏫 Campus y Grupos

### Campus (5):
- Mitras
- Cumbres
- Norte
- Dominio
- Anahuac

### Niveles de Grupos:
- Toddlers
- Prenursery
- Preescolar

Total: **15 grupos** (5 campus × 3 niveles)

---

## 🔍 Solución de Problemas

### El servidor no inicia
- Asegúrate de haber ejecutado `bun install` o `npm install`
- Verifica que el puerto 3000 esté disponible
- Si está ocupado, puedes cambiar el puerto modificando el script `dev` en `package.json`

### Error de base de datos
- Ejecuta `bun run db:push` para crear la base de datos
- Si hay errores, ejecuta `bun run db:reset` para reiniciar (¡esto borra datos!)

### La página carga pero no muestra datos
- Verifica que la base de datos tenga datos ejecutando `bun run db:push`
- Puedes revisar el archivo `db/custom.db` para ver si existe

### Errores de dependencias
- Borra la carpeta `node_modules` y ejecuta `bun install` nuevamente
- O usa `rm -rf node_modules bun.lockb && bun install` (en Linux/Mac)

---

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa los logs en la terminal donde ejecutaste `bun run dev`
2. Verifica que todos los pasos anteriores se completaron correctamente
3. Asegúrate de estar usando Node.js 18+ o la versión más reciente de Bun

---

## ✅ Lista de Verificación

Antes de comenzar, verifica:
- [ ] Bun o Node.js instalado
- [ ] Proyecto descomprimido en una carpeta
- [ ] Terminal abierta en la carpeta del proyecto
- [ ] Dependencias instaladas (`bun install`)
- [ ] Base de datos configurada (`bun run db:push`)
- [ ] Servidor iniciado (`bun run dev`)

¡Todo listo! 🚀

---

**¡Disfruta el sistema de seguimiento de estudiantes!** 🎓📊
