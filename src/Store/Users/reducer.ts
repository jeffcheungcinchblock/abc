import { createReducer } from '@reduxjs/toolkit'
import { login, logout, storeInvitationCode } from './actions'

export type UserState = {
    isLoggedIn: boolean
    username: string
    email: string
    cognitoUser: any
    invitationCode: string
    hasLoggedInTimes: number
}

const initialState: UserState = {
    isLoggedIn: false,
    username: "",
    email: "",
    cognitoUser: null,
    invitationCode: "",
    hasLoggedInTimes: 0
}

export default createReducer<UserState>(initialState, (builder) => {
    builder
        .addCase(storeInvitationCode, (state, action) => {
            return {
                ...state,
                ...action.payload,
            }
        })
        .addCase(login, (state, action) => {
            return {
                ...state,
                isLoggedIn: true,
                ...action.payload,
                hasLoggedInTimes: state.hasLoggedInTimes + 1
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