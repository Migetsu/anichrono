# PowerShell script to free ports 3000 and 5173
# Use this when you need to restart the project

Write-Host "`nSearching for processes on ports 3000 and 5173..." -ForegroundColor Yellow

$ports = @(3000, 5173)
$killed = $false

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                
                if ($process) {
                    Write-Host "Port $port is occupied by: $($process.Name) (PID: $processId)" -ForegroundColor Red
                    
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "Process $($process.Name) (PID: $processId) terminated" -ForegroundColor Green
                    $killed = $true
                }
            }
        } else {
            Write-Host "Port $port is free" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Could not check port $port" -ForegroundColor Yellow
    }
}

if ($killed) {
    Write-Host "`nPorts cleared! You can now start the project." -ForegroundColor Green
} else {
    Write-Host "`nAll ports are already free." -ForegroundColor Cyan
}

Write-Host "`nTo start the project use:" -ForegroundColor White
Write-Host "  Terminal 1: vercel dev" -ForegroundColor Yellow
Write-Host "  Terminal 2: npm run dev" -ForegroundColor Yellow
Write-Host ""
