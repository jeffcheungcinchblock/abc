import { createAction } from '@reduxjs/toolkit'

type LoginState = {
    username: string
    email: string
}

export const login = createAction<LoginState>('user/login')
export const logout = createAction('user/logout')
