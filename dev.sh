#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f static/js/cm6.bundle.js ]; then
    echo "CodeMirror bundle not found, building..."
    npm install
    npm run build
fi

PORT="${PORT:-5000}"
HOST="${HOST:-127.0.0.1}"

exec python app.py --mock --debug --host "$HOST" --port "$PORT"
