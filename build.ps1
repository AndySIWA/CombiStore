# Script de build Android Release local pour CombiStore
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Android\Android Studio\jbr") {
        $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
    }
}

if (-not $env:ANDROID_HOME) {
    if ($env:LOCALAPPDATA -and (Test-Path "$env:LOCALAPPDATA\Android\Sdk")) {
        $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
    }
}

Write-Host "Utilisation de JAVA_HOME: $env:JAVA_HOME"
Write-Host "Utilisation de ANDROID_HOME: $env:ANDROID_HOME"

Push-Location android
try {
    ./gradlew.bat assembleRelease > ../build_log.txt 2>&1
    Write-Host "Build terminé avec succès ! APK disponible dans : android/app/build/outputs/apk/release/app-release.apk"
} finally {
    Pop-Location
}
