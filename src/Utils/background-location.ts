import BackgroundGeolocation from 'react-native-background-geolocation'
import  { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions'
import {
	Platform,
} from 'react-native'
import { IOSHealthKit } from '../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../Healthkit/androidHealthKit'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const iOSPermission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
const androidPermission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION


const backgroundLocaiton = (dispatch) => {

	if (isIOS){
		check(iOSPermission).then((result) => {
			if (result === RESULTS.GRANTED) {
				console.log('Permission granted')

			}
		})

	} else {
		check(androidPermission).then((result) => {
			if (result === RESULTS.GRANTED) {
				console.log('Permission granted')
			}
		})
	}

	const initBackgroundLocation = () => {

	}

	const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
		if (currentState !== ActivityType.PAUSE){
			if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true && location.coords.speed != -1)
			{
				if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
					const new_cal = health_kit.GetCaloriesBurned(startTime, new Date())
					const new_step = health_kit.GetSteps(startTime, new Date())
					const new_heartrate = health_kit.GetHeartRates( startTime, new Date())
					Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
						console.log('result', result)
						dispatch({ type:'move', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude,
							calories:result[0], steps:result[1], heartRate:result[2] } })
					})
				} else {
					console.log('moving too fast')
				}
			} else {
				console.log('not moving')
			}
		}
	})
}
