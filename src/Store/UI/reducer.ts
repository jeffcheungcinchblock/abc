import { createReducer } from '@reduxjs/toolkit'
import { showSnackbar, startLoading } from './actions'


export type UIState = {
    isScreenLoading: boolean,
    snackBarConfig: {
        visible: boolean,
        textMessage: string,
        position: 'top' | 'bottom',
        actionText: string,
        autoHidingTime: number
    }
}

const initialState: UIState = {
    isScreenLoading: true,
    snackBarConfig: {
        visible: false,
        textMessage: "",
        position: "top",
        actionText: "OK",
        autoHidingTime: 3000
    }
}

export default createReducer<UIState>(initialState, (builder) => {
    builder
        .addCase(startLoading, (state, action) => {
            return {
                ...state,
                isScreenLoading: action.payload
            }
        })

    builder
        .addCase(showSnackbar, (state, action) => {
            return {
                ...state,
                snackBarConfig: {
                    ...initialState.snackBarConfig,
                    ...action.payload,
                }
            }
        })
})