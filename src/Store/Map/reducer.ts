import { createReducer } from '@reduxjs/toolkit'
import { start, move, ready, pause,resume } from './actions'
import { getDistanceBetweenTwoPoints } from '../../Healthkit/utils'

export type State =
    {
        startTime : Date,
        latitude : number|null,
        longitude : number|null,
        distance: number | null,
        calories : number | null,
        steps: number | null,
        heartRate: number | null,
        coordinates : Array<CoordinateType> | []
		pauseTime : Array<PauseTimeType> | []
    }

export type CoordinateType = {
    latitude: number,
    longitude: number
}
export type PauseTimeType = {
	startTime: Date,
	endTime: Date
}



const initialState:State = { startTime: new Date(), latitude:null, longitude:null, distance:0, calories:0, steps:0, heartRate :0, coordinates :[ { latitude:0, longitude:0 } ] ,pauseTime:[]}


export default createReducer<State>(initialState, (builder) => {
	builder
		.addCase(ready, (state, action)=>{
			return { ...state }
		})
	builder
		.addCase(start, (state, action) => {
			const initialStateStart:State = { startTime: new Date(), latitude:null, longitude:null, distance:0, calories:0, steps:0, heartRate :0, coordinates :[] ,pauseTime:[]}
			return initialStateStart
		})

	builder
		.addCase(move, (state, action) => {
			if (!action.payload.latitude || !action.payload.longitude){
				return { ...state }
			}
			const newCarlorieBurned = action.payload.calories
			const newSteps = action.payload.steps
			const distance = getDistanceBetweenTwoPoints(state.latitude!, state.longitude!, action.payload.latitude!, action.payload.longitude!)
			const newCoor = [ ...state.coordinates!, { latitude:action.payload.latitude!, longitude:action.payload.longitude } ]
			if (distance > 50){
				return { ...state, latitude : action.payload.latitude, longitude :action.payload.longitude, calories: newCarlorieBurned, steps: newSteps }
			}
			if (distance > 0)
			{
				return { ...state, latitude : action.payload.latitude, longitude :action.payload.longitude, distance : state.distance!  + distance, calories: newCarlorieBurned, steps: newSteps, coordinates: newCoor, heartRate: action.payload.heartRate }
			}
			return { ...state, latitude : action.payload.latitude, longitude :action.payload.longitude, calories: newCarlorieBurned, steps: newSteps }
		})
	builder
		.addCase(pause, (state, action) => {
			return { ...state }
		})

	builder.addCase(resume, (state, action) => {
		return { ...state }
	}
})
