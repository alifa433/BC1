#!/usr/bin/env bash
set -e
if [ -f backend/requirements.txt ]; then
  pip install -r backend/requirements.txt
fi
if [ -f frontend/package.json ]; then
  cd frontend
  npm install
  cd ..
fi
echo "✅ Post-create done"
