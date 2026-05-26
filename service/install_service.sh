#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root: sudo ./install_service.sh"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cp "$SCRIPT_DIR/mazepi.service" /etc/systemd/system/mazepi.service

systemctl daemon-reload
systemctl enable mazepi
systemctl start mazepi

echo "Maze Pi service installed and started."
echo "Check status with: sudo systemctl status mazepi"
