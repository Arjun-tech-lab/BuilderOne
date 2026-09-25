#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONPATH="${PWD}/vendor:${PWD}:${PYTHONPATH:-}"
exec python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
