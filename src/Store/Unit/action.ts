import { createAction } from '@reduxjs/toolkit'
import {SpeedUnit, TimeUnit} from '@/Screens/App/Workout/ActiveScreenSolo'


export const changeSpeedUnit = createAction<{speedUnit:SpeedUnit}>('changeSpeedUnit')
export const changeTimeUnit = createAction<TimeUnit>('changeTimeUnit')
