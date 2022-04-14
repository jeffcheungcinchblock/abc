<<<<<<< HEAD
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health'
import { GeneralHealthKit } from './generalHealthKit'

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
    ],
    write: [AppleHealthKit.Constants.Permissions.Steps],
  },
=======
import AppleHealthKit, { HealthValue, HealthKitPermissions, HealthObserver } from "react-native-health"
import { GeneralHealthKit } from './generalHealthKit';
import { NativeAppEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import appleHealthKit from "react-native-health"

const permissions = {
    permissions: {
        read: [
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Observers.Walking,
            AppleHealthKit.Constants.Observers.HeartRate
        ],
        write: [AppleHealthKit.Constants.Permissions.Steps],
    },
>>>>>>> 7ee512ad0b0a21eb6725f381fb130542e4fcc1c6
} as HealthKitPermissions

export class IOSHealthKit extends GeneralHealthKit {
  InitHealthKitPermission() {
    console.log('Init Healthkit')
    return new Promise<boolean>(resolve => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        /* Called after we receive a response from the system */

        if (error) {
          console.log('[ERROR] Cannot grant permissions!')
          resolve(false)
        }
        resolve(true)
      })
    })
  }

  GetAuthorizeStatus() {
    return new Promise<boolean>(resolve => {
      AppleHealthKit.getAuthStatus(permissions, (err, results) => {
        console.log(err, results)
        resolve(true)
      })
    })
  }

<<<<<<< HEAD
  GetSteps(startDate: Date, endDate: Date) {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
=======
    GetAuthorizeStatus() {
        return new Promise<boolean>((resolve) => {
            AppleHealthKit.getAuthStatus(permissions, (err, results) => {
                resolve(true)
            })
        })
>>>>>>> 7ee512ad0b0a21eb6725f381fb130542e4fcc1c6
    }
    return new Promise<number>(resolve => {
      AppleHealthKit.getDailyStepCountSamples(
        options,
        (err: Object, results: Array<any>) => {
          if (err) {
            return
          }
          const all_steps = results.map(t => t.value)
          if (all_steps.length === 0) {resolve(0)}
          else {resolve(all_steps.reduce((a, b) => a + b))}
        },
      )
    })
  }

  GetDistances(startDate: Date, endDate: Date): Promise<number> {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }
    return new Promise<number>(resolve => {
      AppleHealthKit.getDailyDistanceWalkingRunningSamples(
        options,
        (err: Object, results: Array<any>) => {
          if (err) {
            return
          }
          const all_steps = results.map(t => t.value)
          if (all_steps.length === 0) {resolve(0)}
          else {resolve(all_steps.reduce((a, b) => a + b))}
        },
      )
    })
  }

  GetCaloriesBurned(startDate: Date, endDate: Date) {
    return new Promise<number>(resolve => resolve(1))
  }

<<<<<<< HEAD
  GetHeartRates(startDate: Date, endDate: Date) {
    let options = {
      startDate: startDate.toISOString(), // required
      endDate: endDate.toISOString(),
    }
    return new Promise<any[]>(resolve => {
      AppleHealthKit.getHeartRateSamples(
        options,
        (err: Object, results: any[]) => {
          if (err) {
            return
          }
          console.log(results)
          resolve(results)
        },
      )
    })
  }
  GetWorkoutSession(startDate: Date, endDate: Date) {
    return new Promise<[]>(resolve => resolve([]))
  }
  StartSessionListener() {
    return new Promise<boolean>(resolve => resolve(true))
  }
=======
    GetCaloriesBurned(startDate: Date, endDate: Date) {
        return new Promise<number>(resolve => resolve(1))
    }
    GetHeartRates(startDate: Date, endDate: Date) {
        let options = {
            startDate: startDate.toISOString(), // required
            endDate: endDate.toISOString()
        }
        return new Promise<any[]>(resolve => {
            AppleHealthKit.getHeartRateSamples(
                options,
                (err: Object, results: any[]) => {
                    if (err) {
                        return
                    }
                    resolve(results)
                },
            )
        })
    }
    GetWorkoutSession(startDate: Date, endDate: Date) {
        return new Promise<[]>(resolve => resolve([]))
    }
    StartWorkoutSession() {
        console.log('Starts')
        NativeAppEventEmitter.addListener('healthKit:HeartRate:setup:success', () => console.log('set up success'))
        NativeAppEventEmitter.addListener('healthKit:HeartRate:setup:failure', () => console.log('set up failure'))
        NativeAppEventEmitter.addListener('healthKit:HeartRate:new', () => console.log('new'))
        NativeAppEventEmitter.addListener('healthKit:HeartRate:failure', () => console.log('failure'))
        // console.log(NativeModules, NativeModules.RCTAppleHealthKit)
        // const nee = new NativeEventEmitter(NativeModules.RCTAppleHealthKit)
        // nee.addListener('healthKit:HeartRate:setup:success', callback)
        // nee.addListener('healthKit:HeartRate:new', callback)
        // nee.addListener('healthKit:HeartRate:setup:failure', callback)
        // nee.addListener('healthKit:HeartRate:failure', callback)
    }
>>>>>>> 7ee512ad0b0a21eb6725f381fb130542e4fcc1c6
}
