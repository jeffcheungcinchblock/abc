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
    Image,
    ViewStyle,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Amplify, { Auth } from 'aws-amplify';

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'

import { HeaderLayout } from '@/Styles'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { startLoading } from '@/Store/UI/actions'

const BUTTON_ICON = {
    width: 30
}

const BUTTON_TEXT: TextStyle = {
    width: 100
}

const INPUT_VIEW_LAYOUT: ViewStyle = {
    flexBasis: 80,
    justifyContent: "center"
}

const SignUpScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.signUp>> = (
    { navigation, route }
) => {
    const params = route?.params || { code: "" }
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()
    const [isCreatingAccount, setIsCreatingAccount] = useState(false)
    const [errMsg, setErrMsg] = useState("")
    const [credential, setCredential] = useState({
        username: "",
        password: "",
        email: "",
    })

    const onCredentialFieldChange = (field: string, text: string) => {
        setCredential(prevCredential => {
            return {
                ...prevCredential,
                [field]: text
            }
        })
    }

    const onCreateAccountPress = useCallback(async () => {

        try {
            dispatch(startLoading(true))
            setIsCreatingAccount(true)
            // any type here as aws amplify has no typescript support
            const { user }: any = await Auth.signUp({
                username: credential.username,
                password: credential.password,
                attributes: {
                    email: credential.email,
                }
            });

            setIsCreatingAccount(false)
            navigation.navigate(RouteStacks.validationCode, {
                username: user.username,
                action: 'signUp',
                code: params.code
            })
        } catch (error: any) {
            switch (error.message) {
                case 'Password did not conform with policy: Password must have uppercase characters':
                    setErrMsg(error.message)
                    // TBD
                    break;
                default:
                    setErrMsg(error.message)
            }
        } finally {
            dispatch(startLoading(false))
            setIsCreatingAccount(false)
        }

    }, [credential])

    const goBack = () => {
        navigation.navigate(RouteStacks.signIn)
    }

    useEffect(() => {
        setErrMsg("")
    }, [])

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
                />
                <View style={[{
                    flexGrow: 6,
                    justifyContent: "flex-start",
                }, Layout.fullWidth, Layout.fill]}>

                    <View style={[Layout.fullWidth, { justifyContent: "center", flex: 1 }]}>
                        <Text style={[{ color: colors.white, fontFamily: "AvenirNext-Bold" }, Fonts.textRegular, Fonts.textCenter]}>
                            {t('createAccountAllCapital')}
                        </Text>
                    </View>


                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                        <WhiteInput
                            onChangeText={(text) => onCredentialFieldChange('email', text)}
                            value={credential.email}
                            placeholder={"EMAIL"}
                            placeholderTextColor={colors.spanishGray}

                        />
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                        <WhiteInput
                            onChangeText={(text) => onCredentialFieldChange('username', text)}
                            value={credential.username}
                            placeholder={"USER NAME"}
                            placeholderTextColor={colors.spanishGray}

                        />
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                        <WhiteInput
                            onChangeText={(text) => onCredentialFieldChange('password', text)}
                            value={credential.password}
                            placeholder={"PASSWORD"}
                            placeholderTextColor={colors.spanishGray}

                            secureTextEntry={true}
                        />
                    </View>

                    <View style={[Layout.fullWidth, { justifyContent: "flex-start", flex: 1 }]}>
                        {
                            errMsg !== "" && <Text style={[{ color: colors.orangeCrayola, fontFamily: "AvenirNext-Regular" }, Fonts.textSmall, Fonts.textCenter]}>
                                {errMsg}
                            </Text>
                        }
                    </View>

                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <TurquoiseButton
                        text={t("createAccount")}
                        containerStyle={Layout.fullWidth}
                        isLoading={isCreatingAccount}
                        onPress={onCreateAccountPress} />
                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default SignUpScreen