// import { resolveConfig } from 'prettier'
// import { CALLBACK_TYPE } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gesture'
import GoogleFit, { Scopes } from 'react-native-google-fit'
import { GeneralHealthKit } from './generalHealthKit'
import  { check, request,RESULTS, PERMISSIONS } from 'react-native-permissions'

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
console.log('init, permission')
return new Promise<boolean>((resolve) => {
GoogleFit.authorize(options).then((authResult: any) => {
      if (authResult.success) {
        resolve(true)
      } else {
        console.log(authResult.message)
        resolve(false)
      }
      }).catch(() => {
        resolve(false)
        })
})
}


  GetAuthorizeStatus() {
    return new Promise<boolean>(resolve => {
      GoogleFit.checkIsAuthorized().then(() => {
        console.log(GoogleFit.isAuthorized) // Then you can simply refer to `GoogleFit.isAuthorized` boolean.
        resolve(true)
      })
    })
  }

  GetSteps(startDate: Date, endDate: Date) {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(), // optional; default now
    }
    return new Promise<number>(resolve => {
      GoogleFit.getDailyStepCountSamples(options)
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
        .catch(err => console.warn(err))
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
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(), // optional; default now
    }
    // get calories burned
    return new Promise<number>(resolve => {
      GoogleFit.getDailyCalorieSamples(options).then((res: any) => {
        if (res.length === 0) {
          return resolve(0)
        }
        const calories = res.reduce((a: any, b: { calorie: any }) => {
          return a + b.calorie
        }, 0)
        return resolve(calories)
      })
    })
  }

  GetHeartRates(startDate: Date, endDate: Date) {
    const opt = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(), // optional; default now
    }
    return new Promise<[]>(resolve => {
      GoogleFit.getHeartRateSamples(opt)
        .then((res: any) => {
          console.log(res)
          const heartRate = res.reduce((a: any, b: { value: any }) => {
            return a + b.value
          }, 0)
          return resolve(heartRate)
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



    GoogleFit.checkIsAuthorized()
      .then(() => {
        if (!GoogleFit.isAuthorized){
          return this.InitHealthKitPermission()
        }}).then(()=>{
          GoogleFit.startRecording(function(result){
            console.log(result)
            let step = 0
            if (result.recording === true){
              console.log('start record distance')
            GoogleFit.observeSteps(function(res:any,isError){
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
              console.log('dist',dist.distance)
              setDist(dist[0].distance)
              setStep(step)

            })
            })
          }
          },['distance'])
        })


  }

  StopWorkoutSession(){
    GoogleFit.unsubscribeListeners()
    console.log('end')
  }


}
