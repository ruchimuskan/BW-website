# Zip production package WITHOUT node_modules / .next
# Run from the project root in PowerShell:
#
#   powershell -ExecutionPolicy Bypass -File scripts/zip-production.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "package.json"))) {
  $root = Get-Location
}

$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$out = Join-Path (Split-Path -Parent $root) "bullwaverides-userpanel-website-$stamp.zip"

$excludeNames = @(
  "node_modules",
  ".next",
  "out",
  "build",
  ".git",
  ".vercel",
  ".turbo",
  "coverage",
  "dist",
  ".cursor",
  "agent-transcripts"
)

Write-Host "Creating zip (excluding node_modules, .next, .git)..."
Write-Host "Source: $root"
Write-Host "Output: $out"

if (Test-Path $out) { Remove-Item $out -Force }

$items = Get-ChildItem -LiteralPath $root -Force | Where-Object {
  $excludeNames -notcontains $_.Name -and
  $_.Name -notlike "*.tsbuildinfo" -and
  $_.Name -notlike ".env.local" -and
  $_.Name -notlike ".env*.local"
}

Compress-Archive -Path ($items.FullName) -DestinationPath $out -CompressionLevel Optimal -Force

$size = [math]::Round((Get-Item $out).Length / 1MB, 2)
Write-Host "Done: $out ($size MB)"
Write-Host ""
Write-Host "Receiver should run:"
Write-Host "  1. Unzip the archive"
Write-Host "  2. Copy .env.example to .env.local and set production API URLs"
Write-Host "  3. npm ci"
Write-Host "  4. npm run build"
Write-Host "  5. npm start"
