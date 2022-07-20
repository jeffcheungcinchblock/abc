import AppleHealthKit, { HealthValue, HealthKitPermissions } from 'react-native-health'
import { GeneralHealthKit } from './generalHealthKit'

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Observers.Walking,
      AppleHealthKit.Constants.Observers.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.EnergyConsumed,
    ],
    write: [AppleHealthKit.Constants.Permissions.Steps],
  },
} as HealthKitPermissions

export class IOSHealthKit extends GeneralHealthKit {
  InitHealthKitPermission() {
    return new Promise<boolean>(resolve => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        /* Called after we receive a response from the system */
        if (error) {
          resolve(false)
          return
        }
        resolve(true)
        return
      })
    })
  }

  GetAuthorizeStatus() {
    return new Promise<boolean>(resolve => {
      AppleHealthKit.getAuthStatus(permissions, (err, results) => {
        if (err) {
          resolve(false)
          return
        }
        resolve(true)
        return
      })
    })
  }

  GetSteps(startDate: Date, endDate: Date) {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }
    return new Promise<number>(resolve => {
      AppleHealthKit.getDailyStepCountSamples(options, (err: Object, results: Array<any>) => {
        if (err) {
          resolve(0)
          return
        }
        const all_steps = results.map(t => t.value)
        if (all_steps.length === 0) {
          resolve(0)
          return
        } else {
          const return_step = all_steps.reduce((a, b) => a + b)
          resolve(Math.floor(return_step))
          return
        }
      })
    })
  }

  GetDistances(startDate: Date, endDate: Date): Promise<number> {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }
    return new Promise<number>(resolve => {
      AppleHealthKit.getDailyDistanceWalkingRunningSamples(options, (err: Object, results: Array<any>) => {
        if (err) {
          resolve(0)
          return
        }
        const all_steps = results.map(t => t.value)
        if (all_steps.length === 0) {
          resolve(0)
          return
        } else {
          const return_step = all_steps.reduce((a, b) => a + b)
          resolve(Math.floor(return_step))
          return
        }
      })
    })
  }

  GetCaloriesBurned(startDate: Date, endDate: Date) {
    let options = {
      startDate: startDate.toISOString(), // required
      endDate: endDate.toISOString(),
    }
    return new Promise<number>(resolve => {
      AppleHealthKit.getActiveEnergyBurned(options, (err: Object, results: any[]) => {
        if (err) {
          resolve(0)
          return
        }
        if (results.length === 0) {
          resolve(0)
          return
        } else {
          resolve(results[0].value)
          return
        }
      })
    })
  }
  GetHeartRates(startDate: Date, endDate: Date) {
    let options = {
      startDate: startDate.toISOString(), // required
      endDate: endDate.toISOString(),
    }
    return new Promise<number>(resolve => {
      AppleHealthKit.getHeartRateSamples(options, (err: Object, results: HealthValue[]) => {
        if (err) {
          resolve(0)
          return
        }
        if (!results) {
          resolve(0)
          return
        }
        const heartRate = results.reduce((a: any, b: { value: any }) => {
          return a + b.value
        }, 0)
        if (heartRate === 0) {
          resolve(0)
          return
        }
        const averageHeartRate = heartRate / results.length
        resolve(averageHeartRate)
      })
    })
  }
  GetWorkoutSession(startDate: Date, endDate: Date) {
    return new Promise<[]>(resolve => resolve([]))
  }
  StartWorkoutSession() {
    //   throw new Error('Not implemented')
    // const nee = new NativeEventEmitter(NativeModules.RCTAppleHealthKit)
    // nee.addListener('healthKit:HeartRate:setup:success', callback)
    // nee.addListener('healthKit:HeartRate:new', callback)
    // nee.addListener('healthKit:HeartRate:setup:failure', callback)
    // nee.addListener('healthKit:HeartRate:failure', callback)
  }
  StopWorkoutSession() {
    throw new Error('Not implemented')
  }

  StartListenDistance(setLatitude: Function, setLongitude: Function) {
    throw new Error('Not implemented')
  }
}
