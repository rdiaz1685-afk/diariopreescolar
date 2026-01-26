#!/bin/bash

# 🌐 Script de Gestión del Servidor de Producción

case "$1" in
    start)
        echo "🚀 Iniciando servidor de producción..."
        NODE_ENV=production bun start &
        echo "✅ Servidor iniciado en el puerto 3000"
        echo "📱 Acceso: http://dailyreport.space.z.ai"
        ;;
    stop)
        echo "🛑 Deteniendo servidor..."
        pkill -f "bun.*start" || pkill -f "node.*server.js"
        echo "✅ Servidor detenido"
        ;;
    restart)
        echo "🔄 Reiniciando servidor..."
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        echo "📊 Estado del servidor:"
        ps aux | grep -E "(bun|node)" | grep -v grep | grep server
        ;;
    logs)
        echo "📝 Mostrando logs del servidor:"
        tail -f server.log
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia el servidor de producción"
        echo "  stop    - Detiene el servidor"
        echo "  restart - Reinicia el servidor"
        echo "  status  - Muestra el estado del servidor"
        echo "  logs    - Muestra los logs en tiempo real"
        ;;
esac
