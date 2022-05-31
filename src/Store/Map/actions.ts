import { createAction } from '@reduxjs/toolkit'
import { State, CoordinateType } from './reducer'

type a = { jumpTime: Date }
export const init = createAction<State>('init')
export const start = createAction<State>('start')
export const move = createAction<State>('move')
export const ready = createAction<State>('ready')
export const pause = createAction<{ pauseTime: Date }>('pause')
export const resume = createAction<{
  resumeTime: Date
  latitude: number
  longitude: number
  reduceStep: number
  reduceCalories: number
}>('resume')
export const stop = createAction<{ endTime: Date }>('stop')
export const overSpeed = createAction<{
  overSpeed: boolean
  startOverSpeedTime: Date
}>('overSpeed')
export const overSpeedMoving = createAction<{
  currentSpeed: number | null | undefined
  startOverSpeedTime: Date
  latitude: number
  longitude: number
  accuracy: number
  curTime: Date
}>('overSpeedMoving')
export const returnToNormalSpeed = createAction<{
  resumeTime: Date
  latitude: number
  longitude: number
  reduceStep: number
  reduceCalories: number
}>('returnToNormalSpeed')

export const readSteps = createAction<{ steps: number }>('readSteps')
