$ErrorActionPreference = 'Stop'

# Package scripts use Unix tools (rm, mkdir -p, cp -r); Git for Windows ships them in usr\bin.
$gitRoot = Split-Path (Split-Path (Get-Command git).Source)
$env:PATH = "$gitRoot\usr\bin;$env:PATH"

yarn install --immutable
if ($LASTEXITCODE -ne 0) { throw "yarn install failed with exit code $LASTEXITCODE" }

# Packages import each other via dist/, so build before tests can run.
yarn build
if ($LASTEXITCODE -ne 0) { throw "yarn build failed with exit code $LASTEXITCODE" }

Write-Host 'Worktree setup complete'
