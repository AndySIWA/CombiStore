$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="C:\Users\AndySmart\AppData\Local\Android\Sdk"
cd android
./gradlew.bat assembleDebug > ../build_log.txt 2>&1
