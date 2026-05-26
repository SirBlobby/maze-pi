#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

pip3 install -r "$SCRIPT_DIR/requirements.txt"

chmod +x "$SCRIPT_DIR/dev.sh"
chmod +x "$SCRIPT_DIR/service/install_service.sh"
chmod +x "$SCRIPT_DIR/service/uninstall_service.sh"

echo "Maze Pi installed."
