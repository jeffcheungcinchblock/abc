# POD install
```
cd ios
pod install
```
### If Error
```
cd ios 
pod deintegrate
pod cache clean --all
pod install
```

# Build IOS 
```
npm run ios
```
### If Error
Clean Build in Xcode
Close Metros

# Xcode Setup for Healthkit
- Add HealthKit at **Signing & Capibility**
- Tick Background Delivery on Healthkit
- Add Background Modes at **Signing & Capibility**
- Tick Background fetch, Remote Notifications, Backgorund processing
  
### ios//info.plist
- Add the followings
```
<key>NSHealthShareUsageDescription</key>
<string>Read and understand health data.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Share workout data with other apps.</string>
<!-- Below is only required if requesting clinical health data -->
<key>NSHealthClinicalHealthRecordsShareUsageDescription</key>
<string>Read and understand clinical health data.</string>
```

### ios//AppDelegate.m
- Add the followings
```

#import "RCTAppleHealthKit.h"

[[RCTAppleHealthKit new] initializeBackgroundObservers:bridge];

```

### In Xcode, info (entitlemenmt)
- In Required background modes, Add **App downloads content from the network
- Add **com.apple.developer.healthkit.background-delivery** and set boolean = 1