# Prefixing Quick Commerce models with quick_
$modelsPath = "c:\Users\ASUS\OneDrive\Desktop\Buddy service\Backend\src\modules\quickCommerce\models"
$files = Get-ChildItem $modelsPath -Filter *.js

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Extract model name from export default mongoose.model("ModelName", schema)
    if ($content -match 'export default mongoose\.model\("([^"]+)",\s*([^,)]+)\)') {
        $modelName = $Matches[1]
        $schemaName = $Matches[2]
        
        # Determine plural name (simple logic: categories, products, etc)
        $plural = $modelName.ToLower()
        if ($plural -match 'y$') { $plural = $plural -replace 'y$', 'ies' }
        elseif ($plural -match 's$') { $plural = $plural + "es" } # dashboardstats -> dashboardstatses (Mongoose logic)
        else { $plural = $plural + "s" }
        
        # Mongoose default pluralization can be tricky. 
        # For simplicity, I'll use the pluralization Mongoose uses (mostly +s or ies).
        # But wait! I should just use the actual collection name from the list I just got.
    }
}
