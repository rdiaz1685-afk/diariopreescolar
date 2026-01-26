#!/bin/bash

# 🚀 Script de Instalación y Arranque Rápido
# Sistema de Seguimiento de Estudiantes

echo "🎓 Sistema de Seguimiento de Estudiantes - Instalación Rápida"
echo "============================================================"
echo ""

# Verificar si está instalado Bun o Node
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    echo "✅ Detectado Bun como gestor de paquetes"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    echo "✅ Detectado npm como gestor de paquetes"
else
    echo "❌ Error: No se encontró Bun ni Node.js instalado"
    echo ""
    echo "Por favor, instala Bun o Node.js:"
    echo "  - Bun: curl -fsSL https://bun.sh/install | bash"
    echo "  - Node: https://nodejs.org/"
    exit 1
fi

echo ""
echo "📦 Paso 1/4: Instalando dependencias..."
$PACKAGE_MANAGER install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"

echo ""
echo "🗄️  Paso 2/4: Configurando base de datos..."
$PACKAGE_MANAGER run db:push
if [ $? -ne 0 ]; then
    echo "❌ Error al configurar base de datos"
    exit 1
fi
echo "✅ Base de datos configurada"

echo ""
echo "🚀 Paso 3/4: Iniciando servidor de desarrollo..."
echo ""
echo "============================================================"
echo "🎉 ¡Servidor iniciado!"
echo "📱 Página Principal (Maestros): http://localhost:3000"
echo "📊 Panel Admin (Dashboard): http://localhost:3000/dashboard"
echo "============================================================"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar el servidor
$PACKAGE_MANAGER run dev
