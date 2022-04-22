import AppleHealthKit, { HealthValue, HealthKitPermissions, HealthObserver } from 'react-native-health'
import { GeneralHealthKit } from './generalHealthKit'
import { NativeAppEventEmitter, NativeEventEmitter, NativeModules } from 'react-native'

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
		write: [ AppleHealthKit.Constants.Permissions.Steps ],
	},
} as HealthKitPermissions

export class IOSHealthKit extends GeneralHealthKit {

	InitHealthKitPermission() {
		console.log('Init Healthkit')
		return new Promise<boolean>((resolve) => {
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
		return new Promise<boolean>((resolve) => {
			AppleHealthKit.getAuthStatus(permissions, (err, results) => {
				resolve(true)
			})
		})
	}

	GetSteps(startDate: Date, endDate: Date) {
		const options = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
		}
		return new Promise<number>((resolve) => {
			AppleHealthKit.getDailyStepCountSamples(options, (err: Object, results: Array<any>) => {
				if (err) {
					return
				}
				const all_steps = results.map((t) => t.value)
				if (all_steps.length === 0) {resolve(0)}
				else {resolve(all_steps.reduce((a, b) => a + b))}
			})
		})
	}

	GetDistances(startDate: Date, endDate: Date): Promise<number> {
		const options = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
		}
		return new Promise<number>((resolve) => {
			AppleHealthKit.getDailyDistanceWalkingRunningSamples(
				options,
				(err: Object, results: Array<any>) => {
					if (err) {
						return
					}
					const all_steps = results.map((t) => t.value)
					if (all_steps.length === 0) {resolve(0)}
					else {resolve(all_steps.reduce((a, b) => a + b))}
				},
			)
		})
	}

	GetCaloriesBurned(startDate: Date, endDate: Date) {
		let options = {
			startDate: startDate.toISOString(), // required
			endDate: endDate.toISOString(),
		}

		console.log('options', options)
		return new Promise<number>(resolve => {
			AppleHealthKit.getActiveEnergyBurned(
				options,
				(err: Object, results: any[]) => {
					if (err) {
						return
					}
					console.log('health', results)
					if (results.length === 0){
						resolve(0)
					} else {
						resolve(results[0].value)
					}
				},
			)
		})
	}
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
					resolve(results)
				},
			)
		})
	}
	GetWorkoutSession(startDate: Date, endDate: Date) {
		return new Promise<[]>(resolve => resolve([]))
	}
	StartWorkoutSession() {
		//   throw new Error('Not implemented')

		//     NativeAppEventEmitter.addListener('healthKit:HeartRate:setup:success', () => console.log('set up success'))
		//     NativeAppEventEmitter.addListener('healthKit:HeartRate:setup:failure', () => console.log('set up failure'))
		//     NativeAppEventEmitter.addListener('healthKit:HeartRate:new', () => console.log('new'))
		//     NativeAppEventEmitter.addListener('healthKit:HeartRate:failure', () => console.log('failure'))
		// console.log(NativeModules, NativeModules.RCTAppleHealthKit)
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
