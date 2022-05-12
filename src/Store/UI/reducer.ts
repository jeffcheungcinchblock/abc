import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { showSnackbar, ShowSnackbarPayload, startLoading } from './actions'


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
        .addCase(showSnackbar, (state, {payload} : PayloadAction<ShowSnackbarPayload>) => {
            return {
                ...state,
                snackBarConfig: {
                    visible: payload.visible ?? false,
                    textMessage: payload.textMessage ?? "",
                    position: payload.position ?? "top",
                    actionText: payload.actionText ?? "OK",
                    autoHidingTime: payload.autoHidingTime ?? 3000
                }
            }
        })
})