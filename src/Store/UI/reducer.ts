import { createReducer } from '@reduxjs/toolkit'
import { startLoading } from './actions'

export type UIState = {
    isScreenLoading: boolean
}

const initialState : UIState = {
    isScreenLoading: true

}

export default createReducer<UIState>(initialState, (builder) => {
    builder
        .addCase(startLoading, (state, action) => {
            return {
                ...state,
                isScreenLoading: action.payload
            }
        })
       

})