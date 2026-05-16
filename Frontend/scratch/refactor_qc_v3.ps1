$qcPath = "C:\Users\ASUS\OneDrive\Desktop\Buddy service\Frontend\src\modules\quickCommerce"
Get-ChildItem -Path $qcPath -Include *.jsx,*.js,*.tsx -Recurse | ForEach-Object {
    $f = $_.FullName
    $c = Get-Content $f
    $c = $c -replace '@/core/', '@core/'
    $c = $c -replace '@/shared/', '@shared/'
    $c = $c -replace '@/modules/', '@modules/'
    $c = $c -replace '@/assets/', '@assets/'
    $c = $c -replace '@/lib/', '@qc/lib/'
    $c = $c -replace '@/components/ui/', '@shared/components/ui/'
    $c | Set-Content $f
    Write-Host "Updated: $f"
}
