import { createAction } from '@reduxjs/toolkit'

export const login = createAction<{
    username: string
    email: string
}>('user/login')
export const logout = createAction('user/logout')
export const storeInvitationCode = createAction<{
    invitationCode: string
}>('user/storeInvitationCode')
