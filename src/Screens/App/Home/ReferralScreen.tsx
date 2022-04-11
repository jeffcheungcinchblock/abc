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
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { config } from '@/Utils/constants'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import EncryptedStorage from 'react-native-encrypted-storage'

import Share from 'react-native-share';
import share from '@/Utils/share'
import HeaderLayout from '@/Styles/HeaderLayout'
import { RouteStacks } from '@/Navigators/routes'

const ReferralScreen: FC<StackScreenProps<HomeNavigatorParamList, RouteStacks.homeReferral>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const onSharePress = useCallback(async () => {

        share({
            url: "https://movn/r/1234",
            title: "Refer your friend", message: "Refer your friend",
        })

    }, [])

    const goBack = useCallback(() => {

    }, [])

    return (
        <ScrollView
            style={Layout.fill}
            contentContainerStyle={[
                Layout.fill,
                Layout.colCenter,
                Gutters.smallHPadding,
            ]}
        >

            <Header headerTx="signUpScreen.screenTitle"
                style={HeaderLayout.HEADER}
                titleStyle={HeaderLayout.HEADER_TITLE}
                onLeftPress={goBack}
                leftIcon={() => <FontAwesome name="arrow-left" size={20} color="#000" />}
            />
            <View style={{
                alignItems: "center",
                width: "100%",
                flex: 1,
                justifyContent: "center",
            }}>
                <Text style={{ color: "#1A0DAB" }}>Refer friend</Text>

                <Text style={{ color: "#1A0DAB" }}>https://movn/r/1234</Text>

                <TouchableOpacity style={{ backgroundColor: "pink", marginTop: 40 }} onPress={onSharePress}>
                    <Text>Share</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    )
}

export default ReferralScreen