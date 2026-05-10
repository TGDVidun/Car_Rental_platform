Write-Host "--- Port Check ---"
$ports = @(8080, 8081, 8082, 5173, 3000)
foreach ($p in $ports) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$p" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "Port $p : OK ($($r.StatusCode))"
    } catch {
        Write-Host "Port $p : Not available"
    }
}
