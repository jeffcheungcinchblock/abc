import { createAction } from '@reduxjs/toolkit'
import { UIState } from './reducer'


export const startLoading = createAction<boolean>('ui/startLoading')
export const showSnackbar = createAction<{
    snackBarConfig: {
        visible: boolean,
        textMessage: string,
        position: string,
        actionText: string,
        autoHidingTime: number
    }
}>('ui/showSnackbar')
