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
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { MarketplaceNavigatorParamList } from '@/Screens/App/MarketplaceScreen'
import EncryptedStorage from 'react-native-encrypted-storage'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AvenirText from '@/Components/FontText/AvenirText'
import { SafeAreaView } from 'react-native-safe-area-context'
import marketplacePlaceholder from '@/Assets/Images/Marketplace/marketplacePlaceholder.png'
import marketplaceDragonPlaceholder from '@/Assets/Images/Marketplace/marketplaceDragonPlaceholder.png'

type MarketplaceScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<MarketplaceNavigatorParamList, RouteStacks.marketplaceMain>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>

const windowWidth = Dimensions.get('window').width

const MainScreen: FC<MarketplaceScreenNavigationProp> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  let blurryImageHeight = (windowWidth * 3572) / 1440

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', backgroundColor: colors.darkGunmetal }} edges={['top']}>
      <ScreenBackgrounds screenName={RouteStacks.marketplaceMain}>
        <Header headerText={t('marketplace')} />
        <KeyboardAwareScrollView
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingBottom: 20,
              paddingTop: 20,
            },
          ]}
        >
          <View style={{ width: '100%' }}>
            <Image
              source={marketplacePlaceholder}
              style={{
                width: '100%',
                height: blurryImageHeight,
              }}
              resizeMode='contain'
            />
            <Image
              source={marketplaceDragonPlaceholder}
              style={{
                width: '100%',
                position: 'absolute',
                top: (-blurryImageHeight * 1) / 4,
                left: 0,
                height: blurryImageHeight,
              }}
              resizeMode='contain'
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default MainScreen
