import { createReducer } from '@reduxjs/toolkit'
import { login, logout, storeInvitationCode } from './actions'

export type UserState = {
    isLoggedIn: boolean
    username: string
    email: string
    cognitoUser: any
    invitationCode: string
    uuid: string
}

const initialState: UserState = {
    isLoggedIn: false,
    username: "",
    email: "",
    cognitoUser: null,
    invitationCode: "",
    uuid: "",
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