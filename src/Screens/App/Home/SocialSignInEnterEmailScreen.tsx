import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
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
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
// @ts-ignore
import Amplify, { Auth } from 'aws-amplify';

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { startLoading } from '@/Store/UI/actions'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import StandardInput from '@/Components/Inputs/StandardInput'
import { awsLogout, emailUsernameHash } from '@/Utils/helpers'
import { HomeNavigatorParamList } from '../HomeScreen'

const TEXT_INPUT = {
    height: 40,
    color: "yellow",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
}

const CODE_FIELD_ROOT = {

}

const CELL = {
    width: 50,
    height: 50,
    fontSize: 24,
    borderWidth: 1,
    borderColor: colors.spanishGray,
    color: colors.white,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 48
}

const FOCUSED_CELL = {

}

const SocialSignInEnterEmailScreen: FC<StackScreenProps<HomeNavigatorParamList, RouteStacks.socialSignInEnterEmail>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const params = route!.params || { validationCode: "", username: "" }
    const [errMsg, setErrMsg] = useState("")
    const [email, setEmail] = useState("")

    const goBack = async () => {
        await awsLogout()
    }

    const onConfirmPress = async () => {

        try{
            
        }catch(err){
            setErrMsg("Invalid Email")
        }finally{

        }

    }


    return (
        <ScreenBackgrounds
            screenName={RouteStacks.socialSignInEnterEmail}
        >

            <KeyboardAwareScrollView
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                ]}
            >
                <Header
                    onLeftPress={goBack}
                    headerText={t("enterEmail")}
                />
                <View style={[{
                    justifyContent: "space-between",
                    alignItems: "center"
                }, Layout.fullWidth, Layout.fill]}>

                    <View style={{flexBasis: 120, justifyContent: "flex-start", width: '100%', paddingHorizontal: 20}}>
                        <View style={[{ flex: 1, paddingHorizontal: 4 }]}>
                            <Text style={[{ color: colors.white, lineHeight: 26 }, Fonts.textSmall, Fonts.textLeft]}>
                                {t('provideEmailPrompt')}
                            </Text>
                        </View>


                        <View style={[{ flex: 1 }]}>
                            <StandardInput
                                onChangeText={(text) => setEmail(text)}
                                value={email}
                                placeholder={t("email")}
                                placeholderTextColor={colors.spanishGray}
                                secureTextEntry={true}
                            />
                            {
                                errMsg !== "" && <Text style={[{ color: colors.magicPotion, paddingHorizontal: 10, paddingVertical: 2 }, Fonts.textSmall, Fonts.textLeft]}>
                                    {errMsg}
                                </Text>
                            }
                        </View>
                    </View>


                    <View style={[Layout.fullWidth, Layout.center, Gutters.largeVPadding, { flex: 1, justifyContent: "flex-end" }]}>
                        <TurquoiseButton
                            text={t("confirm")}
                            onPress={onConfirmPress}
                            containerStyle={{
                                width: "45%"
                            }}
                            isTransparentBackground
                        />
                    </View>

                </View>



            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default SocialSignInEnterEmailScreen