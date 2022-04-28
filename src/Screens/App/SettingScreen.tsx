import React, { useState, useEffect, useCallback, FC } from 'react'
import { DrawerScreenProps } from "@react-navigation/drawer"
import {
    View,
    ActivityIndicator,
    Text,
    TextInput,
    ScrollView,
    TextStyle,
    Alert,
    ViewStyle,
    Pressable,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { DrawerNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import YellowButton from '@/Components/Buttons/YellowButton'



const SettingScreen: FC<DrawerScreenProps<DrawerNavigatorParamList, RouteStacks.setting>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const connector = useWalletConnect();
    const params = route!.params || { username: null }

    useEffect(() => {
        // FingerprintScanner
        //     .authenticate({ description: 'Scan your fingerprint on the device scanner to continue' })
        //     .then(() => {
        //         Alert.alert('Authenticated successfully');
        //     })
        //     .catch((error) => {
        //         Alert.alert(error.message);
        //     });
    }, [])

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.setting}
        >
            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                    Gutters.smallHPadding,
                ]}
            >
                <View style={{
                    alignItems: "center",
                    width: "100%",
                    flex: 1,
                    justifyContent: "center",
                }}>

                    <Text style={{ color: colors.black }}>Setting screen</Text>

                    {
                        <YellowButton
                            onPress={() => navigation.toggleDrawer()}
                            text={t("Toggle Drawer")}
                            containerStyle={[Layout.fullWidth]}
                        />
                    }

                    <YellowButton
                        onPress={() => !connector.connected ? connector.connect() : connector.killSession()}
                        text={!connector.connected ? t("Connect Wallet") : t("Disconnect Wallet")}
                        containerStyle={[Layout.fullWidth, {flex: 1}]}
                    />

                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default SettingScreen