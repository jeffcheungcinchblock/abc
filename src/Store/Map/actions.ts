import { createAction } from '@reduxjs/toolkit'
import { State, CoordinateType } from './reducer'

export const start = createAction<State>('start')
export const move = createAction<State>('move')
export const ready = createAction<State>('ready')
export const pause = createAction<{pauseTime:Date}>('pause')
export const resume = createAction<{resumeTime:Date, latitude:number, longitude:number}>('resume')
export const stop = createAction<{endTime:Date}>('stop')
