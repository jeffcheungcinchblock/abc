import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
import {
    View,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    TextStyle,
    Alert,
    ViewStyle,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import { createStackNavigator } from '@react-navigation/stack';
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { config } from '@/Utils/constants'
import { MainNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { MainScreen } from './Breeding'

const Stack = createStackNavigator();

export type BreedingNavigatorParamList = {
    [RouteStacks.breedingMain]: undefined
    
}

const BreedingScreen: FC<StackScreenProps<MainNavigatorParamList, RouteTabs.breeding>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={RouteStacks.breedingMain} component={MainScreen} />
          
        </Stack.Navigator>
    )
}

export default BreedingScreen