import { createReducer } from '@reduxjs/toolkit'
import { start, move, ready, pause, resume, stop, init } from './actions'
import { getDistanceBetweenTwoPoints } from '../../Healthkit/utils'

export type State = {
	currentState: ActivityType,
	startTime : Date|null,
	endTime : Date|null,
	latitude : number|null,
	longitude : number|null,
	distance: number | null,
	calories : number | null,
	steps: number | null,
	heartRate: number | null,
	paths: Array<Path>,
	startRegion?: StartRegion,
}

export enum ActivityType {
	LOADING,
	MOVING,
	READY,
	PAUSE,
	ENDED
}
export type Path = {
	numberOfPath: number,
	coordinates? : Array<CoordinateType>
	pauseTime?: Date | null,
	reduceStep :number,
	reduceCalories? :number|null,
	endPauseTime?: Date | null,
}
export type StartRegion = {
    latitude: number,
    longitude: number,
	latitudeDelta: number,
	longitudeDelta: number,
}
export type CoordinateType = {
    latitude: number,
    longitude: number
}
export type PauseTimeType = {
	startTime: Date,
	endTime: Date
}



const initialState:State = { currentState: ActivityType.LOADING, startTime: new Date(), endTime:null, latitude:null, longitude:null, distance:0, calories:0, steps:0, heartRate :0, paths:[ { numberOfPath:0, pauseTime:null, endPauseTime:null, reduceStep:0 } ] }


export default createReducer<State>(initialState, (builder) => {
	builder.addCase(init, (state, action)=>{
		console.log('reducer init')
		const initialStateStart:State = { currentState:ActivityType.LOADING, startTime: null, endTime:null, latitude:null, longitude:null, distance:0, calories:0, steps:0, heartRate :0, paths:[   { numberOfPath:0, pauseTime:null, endPauseTime:null, reduceStep:0 } ] }
		console.log('initialStateStart', initialStateStart)
		return initialStateStart
	})
	builder
		.addCase(ready, (state, action)=>{
			return { ...state, currentState:ActivityType.READY }
		})
	builder
		.addCase(start, (state, action) => {
			const initialStateStart:State = { currentState:ActivityType.MOVING, startTime: action.payload.startTime, endTime:null, latitude:null, longitude:null, distance:0, calories:0, steps:0, heartRate :0, paths:[   { numberOfPath:0, pauseTime:null, endPauseTime:null, reduceStep:0 } ] }
			console.log('initialStateStart', initialStateStart)
			return initialStateStart
		})
	builder
		.addCase(move, (state, action) => {
			if (!action.payload.latitude || !action.payload.longitude ) {
				return state
			}
			const newCarlorieBurned = action.payload.calories
			//sum of an array
			let totalReduceStep = 0
			state.paths.forEach(path => {
				totalReduceStep += path.reduceStep
			})
			const newSteps = action.payload.steps! - totalReduceStep
			const distance = getDistanceBetweenTwoPoints(state.latitude!, state.longitude!, action.payload.latitude!, action.payload.longitude!)
			console.log('newSteps', distance)
			if (distance > 20){
				return { ...state, latitude : action.payload.latitude, longitude :action.payload.longitude, calories: newCarlorieBurned, steps: newSteps }
			}

			if (distance > 0)
			{
				const newPaths = JSON.parse(JSON.stringify(state.paths))
				if (!newPaths[newPaths.length - 1].coordinates || newPaths[newPaths.length - 1].coordinates.length === 0){
					newPaths[newPaths.length - 1].coordinates = [ { latitude: action.payload.latitude, longitude: action.payload.longitude } ]
				} else {
					newPaths[newPaths.length - 1].coordinates!.push({ latitude: action.payload.latitude, longitude: action.payload.longitude })
				}
				return { ...state, latitude : action.payload.latitude, longitude :action.payload.longitude, distance : state.distance!  + distance, calories: newCarlorieBurned, steps: newSteps, paths:newPaths, heartRate: action.payload.heartRate }
			}
			return { ...state, latitude : action.payload.latitude, longitude :action.payload.longitude, calories: newCarlorieBurned, steps: newSteps }
		})
	builder
		.addCase(pause, (state, action) => {
			state.currentState = ActivityType.PAUSE
			const tempPauseTime = action.payload.pauseTime
			let lastIndexofCoordinate = 0
			if (state.paths.length !== 0){
				lastIndexofCoordinate = state.paths.length - 1
			}

			state.paths[lastIndexofCoordinate] = { ...state.paths[lastIndexofCoordinate], pauseTime: tempPauseTime }
			return state
		})

	builder.addCase(resume, (state, action) => {
		const tempEndPauseTime = action.payload.resumeTime
		const reduceStep = action.payload.reduceStep
		let lastIndexofCoordinate = 0
		if (state.paths.length !== 0){
			lastIndexofCoordinate = state.paths.length - 1
		}
		const newPaths = JSON.parse(JSON.stringify(state.paths))

		newPaths[lastIndexofCoordinate].endPauseTime = tempEndPauseTime!
		newPaths[lastIndexofCoordinate].reduceStep = reduceStep!

		newPaths.push({ numberOfPath: newPaths.length + 1, pauseTime: null, endPauseTime: null, reduceStep:0, coordinates:[ { latitude: action.payload.latitude, longitude: action.payload.longitude } ] })
		return { ...state, currentState:ActivityType.MOVING, paths:newPaths }
	})

	builder.addCase(stop, (state, action)=>{
		console.log('inside stop reduerr')
		return { ...state, currentState:ActivityType.ENDED, endTime: action.payload.endTime }
	})
})

