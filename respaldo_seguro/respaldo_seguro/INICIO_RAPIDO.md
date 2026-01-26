# 🚀 Inicio Rápido - Guía Breve

## 📝 Instrucciones Rápidas (3 Pasos)

### 1️⃣ Instalar dependencias
```bash
bun install
# o si usas npm:
npm install
```

### 2️⃣ Configurar base de datos
```bash
bun run db:push
# o:
npm run db:push
```

### 3️⃣ Iniciar servidor
```bash
bun run dev
# o:
npm run dev
```

## 🎉 ¡Listo!

Abre tu navegador en:
- **Página principal**: http://localhost:3000 (para maestros)
- **Dashboard admin**: http://localhost:3000/dashboard (para administradores)

---

## 💡 Opción Rápida con Script (Mac/Linux)

```bash
# Dar permisos de ejecución
chmod +x iniciar.sh

# Ejecutar el script
./iniciar.sh
```

Este script hará todo automáticamente:
- ✅ Instala dependencias
- ✅ Configura base de datos
- ✅ Inicia el servidor

---

## ⚠️ Si tienes problemas

**¿No tienes Bun?** Instálalo primero:
```bash
curl -fsSL https://bun.sh/install | bash
```

**¿No tienes Node.js?** Descárgalo de: https://nodejs.org/

**¿Error de puerto?** Asegúrate de que el puerto 3000 esté libre.

**¿Borrar todo y empezar de cero?**
```bash
rm -rf node_modules .next
bun install
bun run db:push
bun run dev
```

---

**¡Disfruta el sistema!** 🎓📊
