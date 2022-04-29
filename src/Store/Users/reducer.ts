import { createReducer } from '@reduxjs/toolkit'
import { login, logout } from './actions'

export type UserState = {
    isLoggedIn: boolean
    username: string
    email: string
    cognitoUser: any
}

const initialState : UserState = {
    isLoggedIn: false,
    username: "",
    email: "",
    cognitoUser: null

}

export default createReducer<UserState>(initialState, (builder) => {
    builder
        .addCase(login, (state, action) => {
            return {
                ...state,
                isLoggedIn: true,
                ...action.payload
            }
        })
        .addCase(logout, (state, action) => {
            return {
                ...state,
                isLoggedIn: false,
                username: "",
                email: "",
                cognitoUser: null
            }
        })

})