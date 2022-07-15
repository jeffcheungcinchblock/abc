import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { View, ActivityIndicator, Text, TextInput, Pressable, ScrollView, TextStyle, Alert, ViewStyle, RefreshControl } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import { CompositeScreenProps } from '@react-navigation/native'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import EncryptedStorage from 'react-native-encrypted-storage'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
// @ts-ignore
import { Auth } from 'aws-amplify'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import axios from 'axios'
import { awsLogout } from '@/Utils/helpers'
import { SafeAreaView } from 'react-native-safe-area-context'

const TEXT_INPUT = {
  height: 40,
  color: 'yellow',
  borderWidth: 1,
  borderRadius: 10,
  borderColor: '#000',
}

type HomeMainScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<HomeNavigatorParamList, RouteStacks.homeMain>,
  CompositeScreenProps<
    BottomTabScreenProps<TabNavigatorParamList, RouteTabs.home>,
    DrawerScreenProps<DrawerNavigatorParamList, RouteStacks.mainTab>
  >
>

let nodeJsTimeout: NodeJS.Timeout

const MainScreen: FC<HomeMainScreenNavigationProp> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false)

  const onSignOutPress = async () => {
    await awsLogout()
  }

  const onReferFriendsPress = () => {
    navigation.navigate(RouteTabs.home, {
      screen: RouteStacks.homeReferral,
    })
  }

  const onToggleDrawer = () => {
    navigation.toggleDrawer()
  }

  const onRefresh = async () => {
    setRefreshing(true)

    nodeJsTimeout = setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      clearTimeout(nodeJsTimeout)
    }
  }, [])

  return (
    <ScreenBackgrounds screenName={RouteStacks.homeMain}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={[Layout.fill, Layout.colCenter, Gutters.smallHPadding]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} tintColor={colors.brightTurquoise} />
          }
        >
          <View
            style={{
              alignItems: 'center',
              width: '100%',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Text style={Fonts.textRegular}>Welcome</Text>

            {<TurquoiseButton onPress={onReferFriendsPress} text={t('Refer friends')} containerStyle={[Layout.fullWidth]} />}

            {<TurquoiseButton onPress={onToggleDrawer} text={t('Toggle Drawer')} containerStyle={[Layout.fullWidth]} />}

            {<TurquoiseButton onPress={onSignOutPress} text={t('Sign out')} containerStyle={[Layout.fullWidth]} />}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ScreenBackgrounds>
  )
}

export default MainScreen
