#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

echo "node: $(node -v)"
echo "npm: $(npm -v)"

