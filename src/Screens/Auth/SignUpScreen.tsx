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
import YellowButton from '@/Components/Buttons/YellowButton'
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
    { navigation }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()
    const [isCreatingAccount, setIsCreatingAccount] = useState(false)

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
        // TBD: frontend fields validation 

        // if(!validateEmail(credential.email)){
        //   Alert.alert("Invalid email format.", credential.email)
        //   return
        // }

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
            console.log(user);

            setIsCreatingAccount(false)
            navigation.navigate(RouteStacks.validationCode, {
                username: user.username,
            })
        } catch (error) {
            console.log('error ', error)
        } finally {
            dispatch(startLoading(false))
        }


        // var userPool = new CognitoUserPool(config.aws.cognito.poolData);

        // var attributeList: any = [];

        // var dataEmail = {
        //     Name: 'email',
        //     Value: credential.email
        // };

        // attributeList.push(dataEmail)

        // userPool.signUp(credential.username, credential.password, attributeList, [], function (
        //     err,
        //     result
        // ) {
        //     if (err) {
        //         Alert.alert(err.message || JSON.stringify(err));
        //         return;
        //     }
        //     // var cognitoUser = result.user;
        //     navigation.navigate(RouteStacks.validationCode, {
        //         username: credential.username,
        //     })

        // });


    }, [credential])

    const goBack = () => {
        navigation.navigate(RouteStacks.signIn)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.signUp}
        >
            <Header
                onLeftPress={goBack}
            />

            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                ]}
            >
                <View style={[{
                    flexGrow: 6, 
                    justifyContent: "flex-start",
                }, Layout.fullWidth, Layout.fill]}>

                    <View style={[Layout.fullWidth, { justifyContent: "center", flex: 1 }]}>
                        <Text style={[{ color: colors.white, fontFamily: "AvenirNext-Bold" }, Fonts.textRegular, Fonts.textCenter]}>
                            {t('createAccount')}
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

                    <View style={[Layout.fullWidth, { justifyContent: "center", flex: 1 }]}/>

                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <YellowButton
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