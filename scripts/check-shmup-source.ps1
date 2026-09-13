param(
    [Parameter(Mandatory=$true)][string]$UnityData,
    [Parameter(Mandatory=$true)][string]$PackageAssemblies,
    [Parameter(Mandatory=$true)][string]$Csc
)
$ErrorActionPreference = 'Stop'
$outputRoot = Join-Path (Get-Location) '.checks/shmup'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
$refs = @(
    Get-ChildItem -LiteralPath (Join-Path $UnityData 'NetStandard/ref/2.1.0') -Filter '*.dll'
    Get-ChildItem -LiteralPath (Join-Path $UnityData 'Managed/UnityEngine') -Filter '*.dll'
    Get-Item -LiteralPath (Join-Path $PackageAssemblies 'Unity.InputSystem.dll')
    Get-Item -LiteralPath (Join-Path $PackageAssemblies 'Unity.TextMeshPro.dll')
    Get-Item -LiteralPath (Join-Path $PackageAssemblies 'UnityEngine.UI.dll')
) | ForEach-Object { '-r:"' + $_.FullName + '"' }
foreach ($lesson in Get-ChildItem -LiteralPath 'public/downloads/shmup' -Directory) {
    $outDir = Join-Path $outputRoot $lesson.Name
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
    $commonDir = Join-Path $lesson.FullName 'Assets/_Common'
    $commonDll = Join-Path $outDir 'BillLab.Common.dll'
    $gameRefs = $refs
    if (Test-Path -LiteralPath $commonDir) {
        $sources = Get-ChildItem -LiteralPath $commonDir -Recurse -Filter '*.cs' | ForEach-Object { '"' + $_.FullName + '"' }
        $rsp = Join-Path $outDir 'common.rsp'
        @('-nologo','-target:library','-nostdlib+','-langversion:9.0',('-out:"' + $commonDll + '"')) + $refs + $sources | Set-Content -LiteralPath $rsp -Encoding utf8
        & dotnet $Csc ('@' + $rsp)
        if ($LASTEXITCODE -ne 0) { throw "$($lesson.Name): Common compile failed" }
        $gameRefs += '-r:"' + $commonDll + '"'
    }
    $sources = Get-ChildItem -LiteralPath (Join-Path $lesson.FullName 'Assets/_ShootEmUp') -Recurse -Filter '*.cs' | ForEach-Object { '"' + $_.FullName + '"' }
    $rsp = Join-Path $outDir 'game.rsp'
    @('-nologo','-target:library','-nostdlib+','-langversion:9.0',('-out:"' + (Join-Path $outDir 'ShootEmUp.dll') + '"')) + $gameRefs + $sources | Set-Content -LiteralPath $rsp -Encoding utf8
    & dotnet $Csc ('@' + $rsp)
    if ($LASTEXITCODE -ne 0) { throw "$($lesson.Name): game compile failed" }
    Write-Output "$($lesson.Name): C# compiled against installed Unity/package assemblies"
}
