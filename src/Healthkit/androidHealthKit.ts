// import { resolveConfig } from 'prettier'
// import { CALLBACK_TYPE } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gesture'
import GoogleFit, { Scopes } from 'react-native-google-fit'
import { GeneralHealthKit } from './generalHealthKit'
import  { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions'
import { is } from 'immer/dist/internal'
// import Geolocation from 'react-native-geolocation-service'

const options = {
	scopes: [
		Scopes.FITNESS_ACTIVITY_READ,
		Scopes.FITNESS_ACTIVITY_WRITE,
		Scopes.FITNESS_BODY_READ,
		Scopes.FITNESS_BODY_WRITE,
		Scopes.FITNESS_LOCATION_READ,
		Scopes.FITNESS_HEART_RATE_READ,
		Scopes.FITNESS_HEART_RATE_WRITE,
	],
}
export class GoogleFitKit extends GeneralHealthKit {


	InitHealthKitPermission() {
		return new Promise<boolean>(async (resolve) => {
			await GoogleFit.authorize(options).then((authResult) => {
				console.log('authResult', authResult)
				resolve(authResult.success)
			})
		})
	}

	GetAuthorizeStatus() {
		return new Promise<boolean>(resolve => {
			GoogleFit.checkIsAuthorized().then(() => {
				if (GoogleFit.isAuthorized){
					resolve(true)
				} else {
					resolve(false)
				}
			})
		})
	}

	GetSteps(startDate: Date, endDate: Date) {
		if (!GoogleFit.isAuthorized){
			GoogleFit.authorize(options).then((authResult: any) => {
				console.log('authResult', authResult)
			})
			return new Promise<number>(resolve => resolve(-1))
		}

		const StepOptions = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(), // optional; default now
		}
		return new Promise<number>(resolve => {
			GoogleFit.getDailyStepCountSamples(StepOptions)
				.then((res: any) => {
					const source = res.find(
						(step: { source: string }) =>
							step.source === 'com.google.android.gms:estimated_steps',
					)
					const steps = source.steps.reduce((a: any, b: { value: any }) => {
						return a + b.value
					}, 0)
					return resolve(steps)
					//   resolve(allsteps.reduce((a, b) => a + b))
				})
				.catch(err => console.log('error', err))
		})
	}

	GetDistances(startDate: Date, endDate: Date): Promise<number> {
		const opts = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
		}

		return new Promise<number>(resolve => {
			GoogleFit.getDailyDistanceSamples(opts)
				.then(res => {
					if (res.length === 0) {
						return resolve(0)
					}
					const distances = res.reduce((a, b) => {
						return a + b.distance
					}, 0)
					resolve(distances)
				})
				.catch(err => {
					console.log('error', err)
				})
		})
	}

	GetCaloriesBurned(startDate: Date, endDate: Date) {
		if (!GoogleFit.isAuthorized){
			return new Promise<number>(resolve => resolve(-1))
		}
	  const opt = {
			startDate: startDate.toISOString(), // required
			endDate: endDate.toISOString(), // required
			basalCalculation: true, // optional, to calculate or not basalAVG over the week
		}
		// get calories burned
		return new Promise<number>(resolve => {
			GoogleFit.getDailyCalorieSamples(opt).then((res: any) => {

				if (res.length === 0) {
					resolve(0)
				}
				const calories = res.reduce((a: any, b: { calorie: any }) => {
					return a + b.calorie
				}, 0)

				resolve(calories)
			}).catch(err => {
				console.log('error', err)
				resolve(0)
			})
		})
	}

	GetHeartRates(startDate: Date, endDate: Date) {
		if (!GoogleFit.isAuthorized){
			return new Promise<number>(resolve => resolve(-1))
		}
		const opt = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(), // optional; default now
		}
		return new Promise<number>(resolve => {
			GoogleFit.getHeartRateSamples(opt)
				.then((res) => {

					const heartRate = res.reduce((a: any, b: { value: any }) => {
						return a + b.value
					}, 0)
					const averageHeartRate = heartRate / res.length

					return resolve(averageHeartRate)
				})
				.catch(err => {
					return err
				})
		})
	}

	GetWorkoutSession(startDate: Date, endDate: Date) {
		const opt = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(), // optional; default now
		}
		return new Promise<[]>(resolve => {
			GoogleFit.getActivitySamples(opt).then(res => console.log('workout', res))
			GoogleFit.getWorkoutSession(opt)
				.then((res: any) => {
					console.log(res)
					const workout = res.reduce((a: any, b: { value: any }) => {
						return a + b.value
					}, 0)
					return resolve(workout)
				})
				.catch(err => {
					return err
				})
		})
	}

	StartWorkoutSession(startDate:any, setStep:Function, setDist:Function) {
		check(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION).then((result)=>{
			if (result === RESULTS.DENIED){
				request(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION).then((res)=>{
					console.log(res)
				})
			}
			if (result === RESULTS.GRANTED){
				console.log('Granted')
			}
		})


		GoogleFit.startRecording(function(result){
			console.log(result)
			let step = 0
			if (result.recording === true){
				console.log('start record distance')
				GoogleFit.observeSteps(function(res:any, isError){
					if (isError){
						console.log(isError)
					}
					const distOption = {
						startDate: startDate.toISOString(),
						endDate : new Date().toISOString(),
					}
					step = step + res.steps
					if (step > 10){
						console.log('backgound')
					}
					GoogleFit.getDailyDistanceSamples(distOption).then((dist:any)=>{
						console.log('dist', dist.distance)
						setDist(dist[0].distance)
						setStep(step)

					})
				})
			}
		}, [ 'distance' ])

	}

	StopWorkoutSession(){
		GoogleFit.unsubscribeListeners()
		console.log('end')
	}

}
