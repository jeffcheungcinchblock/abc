import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { View, ActivityIndicator, Text, TextInput, ScrollView, TextStyle, Alert, ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import { createStackNavigator } from '@react-navigation/stack'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { config } from '@/Utils/constants'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { MainScreen } from './Companion'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'

const Stack = createStackNavigator()

export type CompanionNavigatorParamList = {
  [RouteStacks.companionMain]: undefined
}

type CompanionMainScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<TabNavigatorParamList, RouteTabs.companion>,
  DrawerScreenProps<DrawerNavigatorParamList>
>

const CompanionScreen: FC<StackScreenProps<TabNavigatorParamList, RouteTabs.companion>> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={RouteStacks.companionMain} component={MainScreen} />
    </Stack.Navigator>
  )
}

export default CompanionScreen
