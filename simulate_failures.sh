#!/bin/bash
# simulate_failures.sh
# Escenarios de fallo para el proyecto — evidencia de alertas funcionando

echo "========================================"
echo "  Simulador de Fallos — Proyecto SRE"
echo "========================================"
echo ""

show_menu() {
  echo "Elige un escenario:"
  echo "  1) CPU alto  (stress por 60s)"
  echo "  2) RAM llena (stress por 30s)"
  echo "  3) Disco lleno (archivo temporal de 2GB)"
  echo "  4) Limpiar disco (borrar archivo temporal)"
  echo "  5) Ver alertas activas en Prometheus"
  echo "  6) Salir"
  echo ""
  read -rp "Opción: " opcion
}

check_deps() {
  if ! command -v stress-ng &>/dev/null; then
    echo "Instalando stress-ng..."
    sudo apt-get install -y stress-ng 2>/dev/null || sudo yum install -y stress-ng 2>/dev/null
  fi
}

case_cpu() {
  check_deps
  echo ""
  echo "► Estresando 4 CPUs por 60 segundos..."
  echo "  Abre Grafana en http://localhost:3000 y observa el spike de CPU."
  echo "  La alerta CPUAlto debería dispararse después de 2 minutos sostenidos."
  echo ""
  stress-ng --cpu 4 --timeout 60s --metrics-brief
  echo "✓ CPU stress terminado."
}

case_ram() {
  check_deps
  echo ""
  echo "► Llenando RAM por 30 segundos (90% del total)..."
  TOTAL_MB=$(free -m | awk '/Mem:/{print $2}')
  TARGET_MB=$(( TOTAL_MB * 90 / 100 ))
  echo "  Usando ~${TARGET_MB}MB de RAM."
  stress-ng --vm 1 --vm-bytes "${TARGET_MB}M" --timeout 30s --metrics-brief
  echo "✓ RAM stress terminado."
}

case_disco() {
  echo ""
  echo "► Creando archivo de 2GB en /tmp/disco_lleno_test..."
  dd if=/dev/zero of=/tmp/disco_lleno_test bs=1M count=2048 status=progress
  echo ""
  df -h /tmp
  echo "✓ Archivo creado. Revisa la alerta DiscoLleno en Prometheus."
}

case_limpia_disco() {
  echo ""
  if [ -f /tmp/disco_lleno_test ]; then
    rm /tmp/disco_lleno_test
    echo "✓ Archivo eliminado. La alerta debería resolverse en ~5 minutos."
  else
    echo "No existe /tmp/disco_lleno_test, nada que limpiar."
  fi
}

case_alertas() {
  echo ""
  echo "► Alertas activas en Prometheus:"
  curl -s "http://localhost:9090/api/v1/alerts" | python3 -m json.tool 2>/dev/null || \
  curl -s "http://localhost:9090/api/v1/alerts"
  echo ""
}

show_menu
case $opcion in
  1) case_cpu ;;
  2) case_ram ;;
  3) case_disco ;;
  4) case_limpia_disco ;;
  5) case_alertas ;;
  6) echo "Saliendo." ; exit 0 ;;
  *) echo "Opción inválida." ;;
esac
