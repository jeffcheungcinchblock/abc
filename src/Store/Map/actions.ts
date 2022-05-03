import { createAction } from '@reduxjs/toolkit'
import { State, CoordinateType } from './reducer'

export const start = createAction<State>('start')
export const move = createAction<State>('move')
export const ready = createAction<State>('ready')
