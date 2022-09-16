import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  TextStyle,
  Alert,
  ViewStyle,
  Image,
  Dimensions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { CompanionNavigatorParamList } from '@/Screens/App/CompanionScreen'
import { RouteStacks } from '@/Navigators/routes'
import { CompositeScreenProps } from '@react-navigation/native'
import { HomeNavigatorParamList } from '../HomeScreen'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AvenirText from '@/Components/FontText/AvenirText'
import { SafeAreaView } from 'react-native-safe-area-context'
import companionPlaceholder from '@/Assets/Images/Companion/companionPlaceholder.png'
import companionDragonPlaceholder from '@/Assets/Images/Companion/companionDragonPlaceholder.png'

type CompanionScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<CompanionNavigatorParamList, RouteStacks.companionMain>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>
const windowWidth = Dimensions.get('window').width

const CompanionMainScreen: FC<CompanionScreenNavigationProp> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  let blurryImageHeight = (windowWidth * 3572) / 1440

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', backgroundColor: colors.darkGunmetal }} edges={['top']}>
      <ScreenBackgrounds screenName={RouteStacks.companionMain}>
        <Header headerText={t('companion')} />
        <KeyboardAwareScrollView
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingBottom: 20,
            },
          ]}
        >
          <View style={{}}>
            <Image
              source={companionPlaceholder}
              style={{
                width: '100%',
                resizeMode: 'contain',
                height: blurryImageHeight,
              }}
            />
            <Image
              source={companionDragonPlaceholder}
              style={{
                width: '100%',
                resizeMode: 'contain',
                position: 'absolute',
                top: (-blurryImageHeight * 1) / 4,
                left: 0,
                height: blurryImageHeight,
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default CompanionMainScreen
