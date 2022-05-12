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
import axios from 'axios'
import { triggerSnackbar } from '@/Utils/helpers'

const TEXT_INPUT = {
    height: 40,
    color: "yellow",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
}

const BUTTON_ICON = {
    width: 30
}

const BUTTON_TEXT: TextStyle = {
    width: 100
}

const CONTENT_ELEMENT_WRAPPER: ViewStyle = {
    justifyContent: "center",
    padding: 2,
    width: "90%",
}

const CODE_FIELD_ROOT = {

}

const CELL = {
    width: 50,
    height: 50,
    fontSize: 24,
    borderWidth: 1,
    color: colors.brightTurquoise,
    backgroundColor: colors.charcoal,
    borderRadius: 4,
    textAlign: 'center',
    lineHeight: 48
}

const FOCUSED_CELL = {
    borderWidth: 1,
    borderColor: colors.brightTurquoise,
}

const VerificationCodeScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.validationCode>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const params = route!.params || { username: "", action: "" }
    const [isVerifyingAccount, setIsVerifyingAccount] = useState(false)
    const [validationCode, setValidationCode] = useState("")
    const ref = useBlurOnFulfill({ value: validationCode, cellCount: 6 });
    const [errMsg, setErrMsg] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [focusCellProps, getCellOnLayoutHandler] = useClearByFocusCell({
        value: validationCode,
        setValue: setValidationCode,
    });

    const onVerifyAccountPress = useCallback(async () => {
        if(validationCode.length !== 6){
            setErrMsg("error.invalidValidationCode")
            return
        }

        if (params.action === 'forgotPassword') {
            // await Auth.forgotPasswordSubmit(params.username, validationCode, newPassword)
            navigation.navigate(RouteStacks.createNewPassword, {
                validationCode,
                username: params.username
            })
        }else{
            if (params.username === "") {
                Alert.alert("Username is empty")
                navigation.goBack()
                return
            }
            setErrMsg("")
            try {
                dispatch(startLoading(true))
                await Auth.confirmSignUp(params.username, validationCode)
    
                triggerSnackbar("Change password successfully!")
                navigation.navigate(RouteStacks.signIn, { username: params.username })
            } catch (err: any) {
                setErrMsg(err.message)
            } finally {
                dispatch(startLoading(false))
            }
        }

    }, [validationCode, params, newPassword])

    const onPasswordChange = (text: string) => {
        setNewPassword(text)
    }

    const goBack = () => {
        navigation.goBack()
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.signUp}
        >

            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                ]}
            >
                <Header
                    onLeftPress={goBack}
                    headerText={t("emailVerificationCode")}
                />
                <View style={[{
                    flexGrow: 6
                }, Layout.fullWidth, Layout.fill, Layout.colCenter,]}>

                    <View style={[CONTENT_ELEMENT_WRAPPER, { flexBasis: 60 }]}>
                        <Text style={[{ color: colors.white, fontWeight: "bold", lineHeight: 26 }, Fonts.textSmall, Fonts.textLeft]}>
                            {t('verificationCodeDesc')}
                        </Text>
                    </View>

                    <View style={[CONTENT_ELEMENT_WRAPPER, { flexBasis: 100, flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }]}>
                        <Text style={[{ color: colors.brightTurquoise, fontWeight: "bold", lineHeight: 26, marginRight: 14 }, Fonts.textSmall, Fonts.textLeft]}>
                            00:00
                        </Text>
                        <Text style={[{ color: colors.white, fontWeight: "bold", lineHeight: 26 }, Fonts.textSmall, Fonts.textLeft]}>
                            {t('resendVerificationCode')}
                        </Text>
                    </View>

                    <View style={[CONTENT_ELEMENT_WRAPPER, { flexBasis: 80, justifyContent: "flex-start" }]}>
                        <CodeField
                            ref={ref}
                            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                            value={validationCode}
                            onChangeText={setValidationCode}
                            cellCount={6}
                            rootStyle={CODE_FIELD_ROOT}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({ index, symbol, isFocused }) => (
                                <Text
                                    key={index}
                                    style={[CELL, isFocused && FOCUSED_CELL]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            )}
                        />
                    </View>

                    {
                        // params.action === 'forgotPassword' && <View style={[CONTENT_ELEMENT_WRAPPER, { flexBasis: 80, justifyContent: "flex-start" }]}>
                        //     <WhiteInput
                        //         onChangeText={onPasswordChange}
                        //         value={newPassword}
                        //         placeholder={t("newPasswordAllCapital")}
                        //         placeholderTextColor={colors.spanishGray}
                        //         secureTextEntry={params.action === 'forgotPassword'}
                        //     />
                        // </View>
                    }

                    <View style={[CONTENT_ELEMENT_WRAPPER, { flex: 1, justifyContent: "flex-start" }]}>
                        {
                            errMsg !== "" && <Text style={[{ color: colors.magicPotion }, Fonts.textSmall, Fonts.textCenter]}>
                                {errMsg}
                            </Text>
                        }
                    </View>

                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <TurquoiseButton
                        text={t("confirm")}
                        isLoading={isVerifyingAccount}
                        onPress={onVerifyAccountPress}
                        isTransparentBackground
                        containerStyle={{
                            width: "45%",
                        }}
                    />
                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default VerificationCodeScreen