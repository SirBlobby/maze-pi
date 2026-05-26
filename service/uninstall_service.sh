#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root: sudo ./uninstall_service.sh"
    exit 1
fi

systemctl stop mazepi    || true
systemctl disable mazepi || true

rm -f /etc/systemd/system/mazepi.service

systemctl daemon-reload

echo "Maze Pi service removed."
