#!/bin/bash

# 🔍 Script de Verificación del Estado del Servidor

echo "==============================================="
echo "🔍 Verificación del Estado del Servidor"
echo "==============================================="
echo ""

# Verificar Next.js
echo "📦 Estado de Next.js (Puerto 3000):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Next.js funcionando correctamente (HTTP 200)"
else
    echo "❌ Next.js no responde correctamente"
fi
echo ""

# Verificar Caddy
echo "🌐 Estado de Caddy (Puerto 81):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:81 | grep -q "200"; then
    echo "✅ Caddy funcionando correctamente (HTTP 200)"
else
    echo "❌ Caddy no responde correctamente"
fi
echo ""

# Verificar procesos
echo "⚙️  Procesos en ejecución:"
echo "---"
ps aux | grep -E "(next|caddy|bun)" | grep -v grep | awk '{print $2, $11, $12, $13, $14}' | head -10
echo ""

# Verificar puertos
echo "🔌 Puertos en escucha:"
echo "---"
netstat -tlnp 2>/dev/null | grep -E "(81|3000)" || ss -tlnp 2>/dev/null | grep -E "(81|3000)"
echo ""

# Verificar base de datos
echo "🗄️  Base de datos:"
if [ -f "/home/z/my-project/db/custom.db" ]; then
    echo "✅ Base de datos existe en /home/z/my-project/db/custom.db"
    SIZE=$(du -h /home/z/my-project/db/custom.db | cut -f1)
    echo "📊 Tamaño: $SIZE"
else
    echo "❌ Base de datos no encontrada"
fi
echo ""

# Verificar espacio en disco
echo "💾 Espacio en disco:"
echo "---"
df -h /home/z/my-project | tail -1
echo ""

# Últimas líneas del log
echo "📝 Últimas 5 líneas del log de desarrollo:"
echo "---"
tail -5 /home/z/my-project/dev.log 2>/dev/null || echo "No se puede leer el log"

echo ""
echo "==============================================="
echo "✅ Verificación completada"
echo "==============================================="
echo ""
echo "📱 URL de acceso:"
echo "   http://dailyreport.space.z.ai"
echo "   http://localhost:81"
echo "   http://localhost:3000"
echo ""
