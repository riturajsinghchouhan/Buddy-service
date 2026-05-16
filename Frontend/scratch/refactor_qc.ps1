$qcPath = "C:\Users\ASUS\OneDrive\Desktop\Buddy service\Frontend\src\modules\quickCommerce"
Get-ChildItem -Path $qcPath -Include *.jsx,*.js -Recurse | ForEach-Object {
    $f = $_.FullName
    $c = Get-Content $f
    $c = $c -replace '@/components/ui/', '@shared/components/ui/'
    $c = $c -replace '@/lib/', '@qc/lib/'
    $c | Set-Content $f
    Write-Host "Updated: $f"
}
