import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { changeSpeedUnit, changeTimeUnit } from './action'
import {SpeedUnit, TimeUnit} from '@/Screens/App/Workout/ActiveScreenSolo'


const initialState = {
    speedUnit : SpeedUnit.KILOMETRE_PER_HOUR,
    timeUnit : TimeUnit.MINUTE
}

export default createReducer(initialState, (builder) => {
    builder
        .addCase(changeSpeedUnit, (state, action) => {
            return {
                ...state,
                speedUnit: action.payload.speedUnit
            }
        })
        .addCase(changeTimeUnit, (state, action) => {
            return {
                ...state,
               timeUnit: action.payload
            }
        })
})