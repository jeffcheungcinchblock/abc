import { createAction } from '@reduxjs/toolkit'
import { UIState } from './reducer'


export const startLoading = createAction<boolean>('ui/startLoading')
