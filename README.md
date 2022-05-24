# Steps to build ios (IPA)
```
cd ios
rm Podfile.lock
arch -x86_64 pod install
```

open ios/DragonDappRN.xcworkspace

Select build target `Any iOS Device (arm64)`

Click Product > Archive 


# Steps to build android (APK), (AAB)
```
cd android
./gradlew clean
```

(APK)
```
./gradlew assembleRelease
```

(AAB)
```
./gradlew bundleRelease
```



