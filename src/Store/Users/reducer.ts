import { createReducer } from '@reduxjs/toolkit'
import { login, logout } from './actions'

export type UserState = {
    isLogin: boolean
    username: string
    email: string
    cognitoUser: any
}

const initialState : UserState = {
    isLogin: false,
    username: "",
    email: "",
    cognitoUser: null

}

export default createReducer<UserState>(initialState, (builder) => {
    builder
        .addCase(login, (state, action) => {
            return {
                ...state,
                isLogin: true,
                ...action.payload
            }
        })
        .addCase(logout, (state, action) => {
            return {
                ...state,
                isLogin: false,
                username: "",
                email: "",
                cognitoUser: null
            }
        })

})