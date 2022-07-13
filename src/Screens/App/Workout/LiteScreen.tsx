import React, { useState, useEffect, FC } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/Hooks'
import { useDispatch, useSelector } from 'react-redux'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps' // remove PROVIDER_GOOGLE import if not using Google Maps
import { enableLatestRenderer, Polyline } from 'react-native-maps'
import { StackScreenProps } from '@react-navigation/stack'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { WorkoutNavigatorParamList } from '@/Screens/App/WorkoutScreen'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteStacks } from '@/Navigators/routes'

enableLatestRenderer()

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: 400,
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

type LiteScreenProps = CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>

const LiteScreen: FC<LiteScreenProps> = (props, { navigation, route }) => {
  const dispatch = useDispatch()

  const map = useSelector((state: any) => state.map)
  const params = { data: '' }

  return (
    <>
      <View style={styles.container}>
        <Text>Lite</Text>
      </View>
    </>
  )
}

export default LiteScreen
