# Steps to build ios
cd ios
rm Podfile.lock
arch -x86_64 pod install

# Steps to build android
cd android
./gradlew clean
./gradlew assembleRelease

