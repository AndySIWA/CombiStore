$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="C:\Users\AndySmart\AppData\Local\Android\Sdk"
cd android
./gradlew.bat assembleRelease > ../build_log.txt 2>&1
Write-Host "Build terminé ! APK disponible dans : android/app/build/outputs/apk/release/app-release.apk"
